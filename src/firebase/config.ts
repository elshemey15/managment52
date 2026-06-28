// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBoabEOr-ZOkQ6NLcbpNPjsNHMVzcJuhuA",
  authDomain: "managment52.firebaseapp.com",
  projectId: "managment52",
  storageBucket: "managment52.firebasestorage.app",
  messagingSenderId: "444816435749",
  appId: "1:444816435749:web:d5a4a29d952a76a6d1edcc",
  measurementId: "G-PRW67PJSX1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firestore (هذا الجزء هو اللي هيحفظ البيانات)
export const db = getFirestore(app);

export default app;