import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDDwLQPmqggEkdVcOutICc8poUxNuxlBW4",
  authDomain: "login-65908.firebaseapp.com",
  projectId: "login-65908",
  storageBucket: "login-65908.firebasestorage.app",
  messagingSenderId: "430894609930",
  appId: "1:430894609930:web:328e26017a098c0060d1f3",
  measurementId: "G-K9PRNYXFH6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider };
