import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
  DialogTitle,
} from "@mui/material";

function CreateRoom({ create, manage }) {
  const [open, setOpen] = useState(true);
  const [roomName, setRoomName] = useState("");

  const handleClose = () => {
    setOpen(false);
    manage();
  };
  const handleNewRoom = (e) => {
    e.preventDefault();
    if (roomName) {
      create(roomName);
      manage();
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Create A New Channel"}
        </DialogTitle>
        <DialogContent>
          <form autoComplete="off" onSubmit={handleNewRoom}>
            <TextField
              id="outlined-basic"
              label="Enter Channel Name"
              fullWidth
              margin="normal"
              variant="outlined"
              required
              value={roomName}
              style={{ backgroundColor: "rgb(45 45 73)", borderRadius: "5px" }}
              onChange={(e) => {
                setRoomName(e.target.value);
              }}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="primary"
            style={{ color: "white" }}
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              handleNewRoom(e);
            }}
            type="submit"
            color="primary"
            autoFocus
            variant="contained"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CreateRoom;
