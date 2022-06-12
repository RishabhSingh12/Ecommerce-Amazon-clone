import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyDdfN9VfiaaZC6JiSrvFjQsm86-GT6Im1E",
  authDomain: "e-clone-7fb9a.firebaseapp.com",
  projectId: "e-clone-7fb9a",
  storageBucket: "e-clone-7fb9a.appspot.com",
  messagingSenderId: "872807222795",
  appId: "1:872807222795:web:1125b0e4d48f613357c10e",
  measurementId: "G-580QLW178G",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
const auth = firebase.auth();

export { db, auth };
