import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const provider = new firebase.auth.GoogleAuthProvider();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCB0n94KoStejHlesi2ZGov5maX9KGZrp0",
  authDomain: "smarts-connect.firebaseapp.com",
  projectId: "smarts-connect",
  storageBucket: "smarts-connect.appspot.com",
  messagingSenderId: "540898223824",
  appId: "1:540898223824:web:f5a6dfe86916ea363660d5",
  measurementId: "G-2YWGHZBPXC",
};

const app = initializeApp(firebaseConfig);
// const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = app.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage, provider };
