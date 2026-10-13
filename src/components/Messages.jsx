import { useState } from "react";
import { Grid, Avatar, IconButton } from "@mui/material";
import { deepPurple } from "@mui/material/colors";
import { makeStyles } from "@mui/styles";
import { AiFillLike } from "react-icons/ai";
import { AiFillFire } from "react-icons/ai";
import { AiFillHeart } from "react-icons/ai";
import { AiFillDelete } from "react-icons/ai";
import { supabase } from "../supabase/supabaseClient";
import DeleteModal from "./DeleteModal";
import { Anchorme } from "react-anchorme";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    position: "relative",
    padding: "8px",
  },
  paper: {
    padding: "10px",
    "&:hover": {
      backgroundColor: "#1f2436",
    },
  },
  avatar: {
    display: "inline-block",
    verticalAlign: "top",
  },
  chat: {
    display: "inline-block",
    paddingLeft: "1rem",
    width: "calc(100% - 50px)",
    wordBreak: "break-all",
  },
  chatHeading: {
    marginBlockStart: 0,
    marginBlockEnd: 0,
    display: "inline-block",
    fontSize: "1rem",
    fontWeight: "600",
    color: "white",
  },
  chatTimming: {
    marginBlockStart: 0,
    marginBlockEnd: 0,
    display: "inline-block",
    paddingLeft: "0.5em",
    color: "white",
  },
  chatText: {
    color: "#dcddde",
  },
  purple: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: "#3f51b5",
  },
  emojiDiv: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  emojiDivInner: {
    position: "absolute",
    right: 0,
    padding: "0 35px 0 32px",
  },
  emojiBtn: {
    fontSize: "1.1rem",
    color: "rgb(255 195 54)",
  },
  allEmoji: {
    backgroundColor: "#2d2e31ba",
    borderRadius: "5px",
    paddingLeft: "2px",
    paddingRight: "2px",
    display: "flex",
  },
  countEmojiBtn: {
    padding: "3px",
    borderRadius: "4px",
    fontSize: "0.8em",
    backgroundColor: "#ffffff4a",
    color: "#cacaca",
    paddingLeft: "5px",
    paddingRight: "5px",
    "&:hover": {
      backgroundColor: "#ffffff4a",
      color: "#e7e7e7",
    },
  },
}));

function Messages({ values, msgId, onReactionToggled }) {
  const [style, setStyle] = useState({ display: "none" });
  const [deleteModal, setDeleteModal] = useState(false);
  const classes = useStyles();

  const uid = JSON.parse(localStorage.getItem("userDetails")).uid;
  const messegerUid = values.user_id;
  const date = new Date(values.created_at);
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.getMonth();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const time = `${day}/${month}/${year}   ${hour}:${minute}`;

  const numLikes = values.like_count;
  const numFire = values.fire_count;
  const numHeart = values.heart_count;

  const userLiked = values.liked_by_me;
  const userFire = values.fired_by_me;
  const userHeart = values.hearted_by_me;

  const postImg = values.post_img;

  const selectedLike = userLiked
    ? { color: "#8ff879", backgroundColor: "#545454" }
    : null;

  const selectedHeart = userHeart
    ? { color: "#ff527d", backgroundColor: "#545454" }
    : null;

  const selectedFire = userFire
    ? { color: "#ffc336", backgroundColor: "#545454" }
    : null;

  const showDeleteModal = () => {
    setDeleteModal(!deleteModal);
  };

  const toggleReaction = async (reactionType) => {
    const { data: isActive, error } = await supabase.rpc("toggle_reaction", {
      p_message_id: msgId,
      p_reaction_type: reactionType,
    });

    if (error) {
      console.log(error);
      return;
    }

    onReactionToggled(msgId, reactionType, isActive);
  };

  const likeClick = () => toggleReaction("like");
  const fireClick = () => toggleReaction("fire");
  const heartClick = () => toggleReaction("heart");

  const deleteMsg = async (id) => {
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) {
      console.log(error);
      return;
    }
    console.log("deleted successfully");
  };

  return (
    <Grid item xs={12} className={classes.root}>
      {deleteModal ? (
        <DeleteModal
          msgId={msgId}
          text={values.text}
          postImg={postImg}
          deleteMsg={deleteMsg}
          handleModal={showDeleteModal}
        />
      ) : null}
      <div
        className={classes.paper}
        onMouseEnter={() => {
          setStyle({ display: "block" });
        }}
        onMouseLeave={() => {
          setStyle({ display: "none" });
        }}
      >
        <div className={classes.avatar}>
          <Avatar
            alt={values.user_name}
            src={values.user_img}
            className={classes.purple}
          />
        </div>

        <div className={classes.chat}>
          <div>
            <h6 className={classes.chatHeading}>{values.user_name}</h6>
            <p className={classes.chatTimming}>{time}</p>
          </div>

          <div className={classes.chatText}>
            {values.text.split("\n").map((txt, idx) => (
              <div key={idx}>
                <Anchorme target="_blank" rel="noreferrer noopener">
                  {txt}
                </Anchorme>
              </div>
            ))}
          </div>

          <Grid item xs={12} md={12} style={{ paddingTop: "5px" }}>
            {postImg ? (
              <img
                src={postImg}
                alt="user"
                style={{ height: "30vh", width: "auto", borderRadius: "4px" }}
              />
            ) : null}
          </Grid>

          <div style={{ paddingTop: "5px", display: "flex" }}>
            {numLikes > 0 ? (
              <div style={{ padding: "3px" }}>
                <IconButton
                  component="span"
                  onClick={likeClick}
                  className={classes.countEmojiBtn}
                  style={selectedLike}
                >
                  <AiFillLike />
                  <div style={{ paddingLeft: "2px" }}>{numLikes}</div>
                </IconButton>
              </div>
            ) : null}

            {numFire > 0 ? (
              <div style={{ padding: "3px" }}>
                <IconButton
                  component="span"
                  onClick={fireClick}
                  className={classes.countEmojiBtn}
                  style={selectedFire}
                >
                  <AiFillFire />
                  <div style={{ paddingLeft: "2px" }}>{numFire}</div>
                </IconButton>
              </div>
            ) : null}

            {numHeart > 0 ? (
              <div style={{ padding: "3px" }}>
                <IconButton
                  component="span"
                  onClick={heartClick}
                  className={classes.countEmojiBtn}
                  style={selectedHeart}
                >
                  <AiFillHeart />
                  <div style={{ paddingLeft: "2px" }}>{numHeart}</div>
                </IconButton>
              </div>
            ) : null}
          </div>
        </div>

        <div className={classes.emojiDiv} style={style}>
          <div className={classes.emojiDivInner}>
            <div className={classes.allEmoji}>
              <IconButton
                component="span"
                style={{ padding: "4px" }}
                onClick={likeClick}
              >
                <AiFillLike className={classes.emojiBtn} />
              </IconButton>
              <IconButton
                component="span"
                style={{ padding: "4px" }}
                onClick={fireClick}
              >
                <AiFillFire className={classes.emojiBtn} />
              </IconButton>
              <IconButton
                component="span"
                style={{ padding: "4px" }}
                onClick={heartClick}
              >
                <AiFillHeart className={classes.emojiBtn} />
              </IconButton>
              {uid === messegerUid ? (
                <IconButton
                  component="span"
                  style={{ padding: "4px" }}
                  onClick={showDeleteModal}
                >
                  <AiFillDelete
                    className={classes.emojiBtn}
                    color="#c3c3c3f0"
                  />
                </IconButton>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Grid>
  );
}

export default Messages;
