import { useEffect, useState } from "react";
import { TextField, Grid, IconButton } from "@mui/material";
import Messages from "./Messages";
import { makeStyles } from "@mui/styles";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import ScrollableFeed from "react-scrollable-feed";
import { BiHash } from "react-icons/bi";
import { FiSend } from "react-icons/fi";
import { GrEmoji } from "react-icons/gr";
import { Picker } from "emoji-mart";
import { RiImageAddLine } from "react-icons/ri";
import FileUpload from "./FileUpload";
// import "emoji-mart/css/emoji-mart.css";

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  chat: {
    position: "relative",
    height: "calc(100vh - 200px)",
    paddingLeft: "10px",
    paddingBottom: "5px",
    paddingTop: "5px",
  },
  footer: {
    paddingRight: "15px",
    paddingLeft: "15px",
    paddingTop: "10px",
  },
  message: {
    width: "100%",
    color: "white",
  },
  roomName: {
    border: "1px solid #0000004a",
    borderLeft: 0,
    borderRight: 0,
    padding: "15px",
    display: "flex",
    color: "#e5e5e5",
  },
  roomNameText: {
    marginBlockEnd: 0,
    marginBlockStart: 0,
    paddingLeft: "5px",
  },
  iconDesign: {
    fontSize: "1.5em",
    color: "#e5e5e5",
  },
  footerContent: {
    display: "flex",
    backgroundColor: "#303753",
    borderRadius: "5px",
    alignItems: "center",
  },
  inputFile: {
    display: "none",
  },
}));

const REACTION_FIELD = {
  like: "liked_by_me",
  fire: "fired_by_me",
  heart: "hearted_by_me",
};

function Chat() {
  const classes = useStyles();
  const params = useParams();
  const [allMessages, setAllMessages] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [userNewMsg, setUserNewMsg] = useState("");
  const [emojiBtn, setEmojiBtn] = useState(false);
  const [modalState, setModalState] = useState(false);
  const [file, setFileName] = useState(null);

  useEffect(() => {
    if (!params.id) return;

    let isMounted = true;

    supabase
      .from("channels")
      .select("channel_name")
      .eq("id", params.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.log(error);
          return;
        }
        if (isMounted) setChannelName(data.channel_name);
      });

    supabase
      .rpc("get_channel_messages", { p_channel_id: params.id })
      .then(({ data, error }) => {
        if (error) {
          console.log(error);
          return;
        }
        if (isMounted) setAllMessages(data);
      });

    const channel = supabase
      .channel(`messages-${params.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${params.id}`,
        },
        (payload) => {
          setAllMessages((current) => [
            ...current,
            {
              ...payload.new,
              liked_by_me: false,
              fired_by_me: false,
              hearted_by_me: false,
            },
          ]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${params.id}`,
        },
        (payload) => {
          // Reaction counts are shared; the liked/fired/hearted_by_me flags
          // are per-viewer and only known via handleReactionToggled below.
          setAllMessages((current) =>
            current.map((m) =>
              m.id === payload.new.id
                ? {
                    ...m,
                    text: payload.new.text,
                    like_count: payload.new.like_count,
                    fire_count: payload.new.fire_count,
                    heart_count: payload.new.heart_count,
                  }
                : m
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${params.id}`,
        },
        (payload) => {
          setAllMessages((current) =>
            current.filter((m) => m.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [params.id]);

  const handleReactionToggled = (messageId, reactionType, isActive) => {
    const field = REACTION_FIELD[reactionType];
    setAllMessages((current) =>
      current.map((m) => (m.id === messageId ? { ...m, [field]: isActive } : m))
    );
  };

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!userNewMsg || !params.id) return;

    const userData = JSON.parse(localStorage.getItem("userDetails"));

    if (userData) {
      const { error } = await supabase.from("messages").insert({
        channel_id: params.id,
        user_id: userData.uid,
        user_name: userData.display_name,
        user_img: userData.photo_url,
        text: userNewMsg,
      });

      if (error) {
        console.log(error);
      } else {
        console.log("message sent");
      }
    }

    setUserNewMsg("");
    setEmojiBtn(false);
  };

  const addEmoji = (e) => {
    setUserNewMsg(userNewMsg + e.native);
  };

  const openModal = () => {
    setModalState(!modalState);
  };

  const handelFileUpload = (e) => {
    e.preventDefault();
    if (e.target.files[0]) {
      setFileName(e.target.files[0]);
      openModal();
    }
    e.target.value = null;
  };

  return (
    <div className={classes.root}>
      {modalState ? <FileUpload setState={openModal} file={file} /> : null}
      <Grid item xs={12} className={classes.roomName}>
        <BiHash className={classes.iconDesign} />
        <h3 className={classes.roomNameText}>{channelName}</h3>
      </Grid>
      <Grid item xs={12} className={classes.chat}>
        <ScrollableFeed>
          {allMessages.map((message) => (
            <Messages
              key={message.id}
              values={message}
              msgId={message.id}
              onReactionToggled={handleReactionToggled}
            />
          ))}
        </ScrollableFeed>
      </Grid>
      <div className={classes.footer}>
        <Grid item xs={12} className={classes.footerContent}>
          <input
            accept="image/*"
            className={classes.inputFile}
            id="icon-button-file"
            type="file"
            onChange={(e) => handelFileUpload(e)}
          />
          <label htmlFor="icon-button-file">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
            >
              <RiImageAddLine style={{ color: "#b9bbbe" }} />
            </IconButton>
          </label>

          <IconButton
            color="primary"
            component="button"
            onClick={() => setEmojiBtn(!emojiBtn)}
          >
            <GrEmoji style={{ color: "#b9bbbe" }} />
          </IconButton>
          {emojiBtn ? <Picker onSelect={addEmoji} theme="dark" /> : null}

          <form
            autoComplete="off"
            style={{ width: "100%", display: "flex" }}
            onSubmit={(e) => sendMsg(e)}
          >
            <TextField
              className={classes.message}
              required
              id="outlined-basic"
              label="Enter Message"
              variant="outlined"
              multiline
              rows={1}
              rowsMax={2}
              value={userNewMsg}
              onChange={(e) => {
                setUserNewMsg(e.target.value);
              }}
            />
            <IconButton type="submit" component="button">
              <FiSend style={{ color: "#b9bbbe" }} />
            </IconButton>
          </form>
        </Grid>
      </div>
    </div>
  );
}

export default Chat;
