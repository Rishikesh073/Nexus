// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAnxfR5DRsF4Zo_EGot4qy57VtepcH_emE",
  authDomain: "nexus-61dcb.firebaseapp.com",
  projectId: "nexus-61dcb",
  storageBucket: "nexus-61dcb.appspot.com",
  messagingSenderId: "106829693223",
  appId: "1:106829693223:web:e532b90041cbc0e9e52902"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();


// THIS LINE IS CRITICAL
export { auth, googleProvider, signInWithPopup, signOut };

