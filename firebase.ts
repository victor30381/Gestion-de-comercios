import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB8V-IaUWw-5M44lsBpBedHM22LN6CknkM",
  authDomain: "gestion-de-comercio-483a3.firebaseapp.com",
  projectId: "gestion-de-comercio-483a3",
  storageBucket: "gestion-de-comercio-483a3.firebasestorage.app",
  messagingSenderId: "1083154392089",
  appId: "1:1083154392089:web:99d224c23ca3b9b9ce3688",
  measurementId: "G-EXZD03V8WV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);