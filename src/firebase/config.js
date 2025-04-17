// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Replace these with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCNB9IIte34i1n-lrmwateXwfvHJ9gFvtw",
    authDomain: "sparky-u.firebaseapp.com",
    projectId: "sparky-u",
    storageBucket: "sparky-u.firebasestorage.app",
    messagingSenderId: "827129572585",
    appId: "1:827129572585:web:0a52667e4b169ad24e9478",
    measurementId: "G-K8KBN25TE6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };