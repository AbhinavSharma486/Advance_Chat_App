// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAiI3LYiFWUuJHTru8eaqPv8R-Gd2aIKw8",
  authDomain: "advance-chat-web-app.firebaseapp.com",
  projectId: "advance-chat-web-app",
  storageBucket: "advance-chat-web-app.firebasestorage.app",
  messagingSenderId: "849117233774",
  appId: "1:849117233774:web:48b6f1e057be029cf19c7f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);