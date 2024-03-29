import * as firebase from "firebase/app";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import "firebase/auth";
// import "firebase/firestore";
// import "firebase/storage";

// const provider = new firebase.auth.GoogleAuthProvider();

const provider = new GoogleAuthProvider();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoN-nSGUo_1h87nkOXSXX2vv4IBXBXey0",
  authDomain: "chatify-49.firebaseapp.com",
  projectId: "chatify-49",
  storageBucket: "chatify-49.appspot.com",
  messagingSenderId: "1034185885241",
  appId: "1:1034185885241:web:a46af138b7a40d318defe8",
  measurementId: "G-EHQ2YBVYY9",
};

const app = initializeApp(firebaseConfig);
// const firebaseApp = firebase.initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// const db = app.firestore();
// const auth = firebase.auth();
// const storage = firebase.storage();

export { db, auth, storage, provider };
