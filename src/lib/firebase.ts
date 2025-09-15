// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7U1bJDvB_gwgy4F38Q67hoNXr1kuVznU",
  authDomain: "latexresumeai.firebaseapp.com",
  projectId: "latexresumeai",
  storageBucket: "latexresumeai.firebasestorage.app",
  messagingSenderId: "103879047575",
  appId: "1:103879047575:web:f058f14b7043eebde9acd2"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
