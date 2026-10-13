import {
  Grid,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Avatar,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import { useChannels } from "../hooks/useChannels";

const useStyles = makeStyles(() => ({
  root: {
    paddingTop: "50px",
    paddingBottom: "25px",
    color: "#f0f0f0",
  },
  heading: {
    fontSize: "2.2em",
    fontWeight: "700",
  },
  subHeading: {
    fontSize: "1.6em",
  },
  channelDiv: {
    padding: "15px",
  },
  channelContent: {
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    padding: "20px",
    alignItems: "center",
  },
  square: {
    height: "80px",
    width: "80px",
    backgroundColor: "#8fabbd66",
    fontSize: "2rem",
  },
  rootChannel: {
    height: "calc(100vh - 185px)",
    position: "relative",
    padding: "15px",
    overflowY: "scroll",
  },
  channelText: {
    paddingTop: "10px",
    fontSize: "1.2rem",
  },
  channelCard: {
    backgroundColor: "#1e2439",
    boxShadow:
      "0px 3px 4px -1px rgb(0 0 0 / 17%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
    color: "rgb(220, 221, 222)",
  },
}));

function Home() {
  const classes = useStyles();
  const channels = useChannels();
  const navigate = useNavigate();

  const goToChannel = (id) => {
    navigate(`/channel/${id}`);
  };

  return (
    <div style={{ backgroundColor: "rgb(34 39 59)" }}>
      <Grid container className={classes.root}>
        <Grid item xs={12} style={{ textAlign: "center" }}>
          <Typography component="h1" className={classes.heading}>
            Welcome to Smarts Connect
          </Typography>
          <Typography component="h1" className={classes.subHeading}>
            Effortless live chat to hangout with friends!
          </Typography>
        </Grid>
      </Grid>

      <Grid container className={classes.rootChannel}>
        {channels.map((channel) => (
          <Grid
            item
            xs={6}
            md={3}
            className={classes.channelDiv}
            key={channel.id}
          >
            <Card className={classes.channelCard}>
              <CardActionArea
                style={{ display: "flex" }}
                onClick={() => goToChannel(channel.id)}
              >
                <CardContent className={classes.channelContent}>
                  <Avatar
                    variant="square"
                    className={classes.square}
                    style={{ backgroundColor: "#6a9ec066" }}
                  >
                    {channel.channel_name.substr(0, 1).toUpperCase()}
                  </Avatar>
                  <Typography className={classes.channelText}>
                    {channel.channel_name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default Home;
