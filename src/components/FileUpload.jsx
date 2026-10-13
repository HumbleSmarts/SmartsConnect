import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  LinearProgress,
  Typography,
  Box,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { supabase, CHAT_IMAGES_BUCKET } from "../supabase/supabaseClient";
import { useParams } from "react-router-dom";

const useStyles = makeStyles(() => ({
  displayImage: {
    height: "105px",
    width: "180px",
  },
  imageName: {
    paddingLeft: "15px",
    fontSize: "1.3em",
  },
  imageDiv: {
    marginLeft: "16px",
    marginRight: "16px",
    marginTop: "-33px",
  },
}));

function FileUpload({ setState, file }) {
  const params = useParams();
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleClose = () => {
    setOpen(false);
    setState();
  };

  const sendMsg = async (imageUrl) => {
    if (!params.id) return;

    const userData = JSON.parse(localStorage.getItem("userDetails"));

    if (userData) {
      const { error } = await supabase.from("messages").insert({
        channel_id: params.id,
        user_id: userData.uid,
        user_name: userData.display_name,
        user_img: userData.photo_url,
        text: message,
        post_img: imageUrl,
      });

      if (error) {
        console.log(error);
      } else {
        console.log("message sent");
      }
    }

    setMessage("");
  };

  const fileObj = URL.createObjectURL(file);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);

    const path = `${params.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(CHAT_IMAGES_BUCKET)
      .upload(path, file);

    if (uploadError) {
      console.log(uploadError);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(CHAT_IMAGES_BUCKET).getPublicUrl(path);

    await sendMsg(publicUrl);
    setUploading(false);
    handleClose();
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className={classes.imageDiv}>
          <img src={fileObj} alt={file.name} className={classes.displayImage} />
          <Typography className={classes.imageName}>{file.name}</Typography>
        </div>

        <DialogTitle id="alert-dialog-title">Upload Image</DialogTitle>

        <DialogContent>
          <form
            autoComplete="off"
            onSubmit={(e) => {
              handleUpload(e);
            }}
          >
            <TextField
              id="outlined-basic"
              label="Add A Message"
              fullWidth
              margin="normal"
              variant="outlined"
              style={{
                backgroundColor: "rgb(45, 45, 73)",
                borderRadius: "5px",
              }}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            />
          </form>

          {uploading ? (
            <Box display="flex" alignItems="center">
              <Box width="100%" mr={1}>
                <LinearProgress />
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} style={{ color: "white" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={(e) => handleUpload(e)}
            color="primary"
            autoFocus
            variant="contained"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default FileUpload;
