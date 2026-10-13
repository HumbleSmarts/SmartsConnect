import { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import Application from "./components/Application";
import Chat from "./components/Chat";
import Login from "./components/SignUp";
import Home from "./components/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { supabase } from "./supabase/supabaseClient";
import "./App.css";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    color: "darkslategray",
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: "#22273b !important",
    height: "100vh",
  },
}));

function App() {
  const classes = useStyles();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="App">
      <Router>
        {!user ? (
          <Login />
        ) : (
          <div className={classes.root}>
            <Application uid={user.id} />
            <main className={classes.content}>
              <div className={classes.toolbar} style={{ minHeight: "50px" }} />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/channel/:id" element={<Chat />} />
              </Routes>
            </main>
          </div>
        )}
      </Router>
    </div>
  );
}

export default App;
