import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC-WUVXAtmSIxyCfxbtRiPx2ycWPXrfl8c",
  authDomain: "extremestetica.firebaseapp.com",
  projectId: "extremestetica",
  storageBucket: "extremestetica.firebasestorage.app",
  messagingSenderId: "481262268639",
  appId: "1:481262268639:web:de3c9fc35b65a3a301b96a"
};

const app = firebase.initializeApp(firebaseConfig);
export const auth = app.auth();
export const db = getFirestore(app);