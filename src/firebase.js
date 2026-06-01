import { initializeApp } from "firebase/app";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment
} from "firebase/firestore";

/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyBnitePNoweH0sEsZxAngOrhJcH8YrlfE0",
  authDomain: "pinnacleinc-ce001.firebaseapp.com",
  projectId: "pinnacleinc-ce001",
  storageBucket: "pinnacleinc-ce001.firebasestorage.app",
  messagingSenderId: "732753891147",
  appId: "1:732753891147:web:d3907858c13933ef85e2ce",
  measurementId: "G-XY2KSM5FDY"
};

/* ================= INITIALIZE ================= */

const app = initializeApp(firebaseConfig);

/* ================= FIRESTORE ================= */

export const db = getFirestore(app);

/* ================= EXPORTS ================= */

export {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment
};