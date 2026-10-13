import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { supabase } from "../supabase/supabaseClient";

function EditProfile({ toggler, alert }) {
  const [open, setOpen] = useState(true);
  const [userName, setUserName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");

  const handleClose = () => {
    setOpen(false);
    toggler();
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", uid);

    if (error) {
      console.log(error);
    } else {
      alert();
    }

    setOpen(false);
    toggler();
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userDetails"));
    setUserName(userData.name);
    setDisplayName(userData.display_name);
    setEmail(userData.email);
    setUid(userData.uid);
  }, []);

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Edit User Profile</DialogTitle>
        <DialogContent>
          <form autoComplete="off">
            <TextField
              id="outlined-basic"
              label="Name"
              fullWidth
              margin="normal"
              variant="outlined"
              disabled
              value={userName}
              style={{
                backgroundColor: "rgb(45, 45, 73)",
                borderRadius: "5px",
                color: "#a6a6a6",
              }}
            />
            <TextField
              id="outlined-basic"
              label="Email"
              fullWidth
              margin="normal"
              variant="outlined"
              disabled
              value={email}
              style={{
                backgroundColor: "rgb(45, 45, 73)",
                borderRadius: "5px",
                color: "#a6a6a6",
              }}
            />

            <TextField
              id="outlined-basic"
              label="Display Name"
              fullWidth
              margin="normal"
              variant="outlined"
              value={displayName}
              style={{
                backgroundColor: "rgb(45, 45, 73)",
                borderRadius: "5px",
              }}
              onChange={(e) => {
                setDisplayName(e.target.value);
              }}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} style={{ color: "white" }}>
            Cancel
          </Button>
          <Button
            onClick={(e) => updateProfile(e)}
            color="primary"
            variant="contained"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default EditProfile;
