/* =============================================
   HERWORTH — FIREBASE CONFIGURATION
   Keys are loaded here. For production, move
   apiKey to a backend proxy or Firebase App Check.
   ============================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
         signOut, onAuthStateChanged, updatePassword, updateEmail,
         reauthenticateWithCredential, EmailAuthProvider,
         GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection,
         addDoc, getDocs, deleteDoc, query, where, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey:            "AIzaSyBwE0PN1VmfgCYaD5wZGQEcYoVa-nSCAVQ",
  authDomain:        "herworth-6a0b0.firebaseapp.com",
  projectId:         "herworth-6a0b0",
  storageBucket:     "herworth-6a0b0.firebasestorage.app",
  messagingSenderId: "453015159303",
  appId:             "1:453015159303:web:9d309b3949166c980860a2",
  measurementId:     "G-5ED577JSQE"
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const db       = getFirestore(app);
const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider,
         createUserWithEmailAndPassword, signInWithEmailAndPassword,
         signOut, onAuthStateChanged, updatePassword, updateEmail,
         reauthenticateWithCredential, EmailAuthProvider,
         signInWithPopup, doc, setDoc, getDoc, updateDoc,
         collection, addDoc, getDocs, deleteDoc, query, where, serverTimestamp };
