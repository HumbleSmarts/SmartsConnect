import { useState } from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Divider,
  Snackbar,
  Fade,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import { IoMdChatboxes } from "react-icons/io";
import { BiHash } from "react-icons/bi";
import CreateRoom from "./CreateRoom";
import { useChannels } from "../hooks/useChannels";

const useStyles = makeStyles((theme) => ({
  nested: {
    paddingLeft: theme.spacing(4),
  },
  iconDesign: {
    fontSize: "1.5em",
    color: "#cb43fc",
  },
  primary: {
    color: "#cb43fc",
  },
}));

function Rooms() {
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const channelList = useChannels();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const navigate = useNavigate();
  const [alert, setAlert] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  const goToChannel = (id) => {
    navigate(`/channel/${id}`);
  };

  const manageCreateRoomModal = () => {
    setShowCreateRoom(!showCreateRoom);
  };

  const handleAlert = () => {
    setAlert(!alert);
  };

  const addChannel = async (cName) => {
    if (!cName) return;

    cName = cName.toLowerCase().trim();
    if (cName === "") {
      handleAlert();
      return;
    }

    const alreadyExists = channelList.some(
      (channel) => channel.channel_name === cName
    );
    if (alreadyExists) {
      handleAlert();
      return;
    }

    const { error } = await supabase
      .from("channels")
      .insert({ channel_name: cName });

    if (error) {
      console.log(error);
      // Unique-constraint violation: someone else created the same name
      // between our check above and this insert.
      if (error.code === "23505") handleAlert();
      return;
    }

    console.log("added new channel");
  };

  return (
    <div>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={alert}
        onClose={handleAlert}
        TransitionComponent={Fade}
        message="Room Name Already Exits!!"
        key={Fade}
        action={
          <IconButton aria-label="close" color="inherit" onClick={handleAlert}>
            <CloseIcon />
          </IconButton>
        }
      />

      {showCreateRoom ? (
        <CreateRoom create={addChannel} manage={manageCreateRoomModal} />
      ) : null}
      <ListItem style={{ paddingTop: 0, paddingBottom: 0 }}>
        <ListItemText primary="Create New Channel" />
        <IconButton edge="end" aria-label="add" onClick={manageCreateRoomModal}>
          <AddIcon className={classes.primary} />
        </IconButton>
      </ListItem>
      <Divider />

      <List component="nav" aria-labelledby="nested-list-subheader">
        <ListItem button onClick={handleClick}>
          <ListItemIcon>
            <IoMdChatboxes className={classes.iconDesign} />
          </ListItemIcon>
          <ListItemText primary="CHANNELS" style={{ color: "#8e9297" }} />
          {open ? (
            <ExpandLess className={classes.primary} />
          ) : (
            <ExpandMore className={classes.primary} />
          )}
        </ListItem>

        <Collapse in={open} timeout="auto">
          <List component="div" disablePadding>
            {channelList.map((channel) => (
              <ListItem
                key={channel.id}
                button
                className={classes.nested}
                onClick={() => goToChannel(channel.id)}
              >
                <ListItemIcon style={{ minWidth: "30px" }}>
                  <BiHash
                    className={classes.iconDesign}
                    style={{ color: "#b9bbbe" }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    channel.channel_name === channel.channel_name.substr(0, 12)
                      ? channel.channel_name
                      : `${channel.channel_name.substr(0, 12)}...`
                  }
                  style={{ color: "#dcddde" }}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </div>
  );
}

export default Rooms;
