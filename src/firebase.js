import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBi8glYuCKCwgPvGX2VKp48jTZ8SezUPjM",
  authDomain: "sister-stars.firebaseapp.com",
  projectId: "sister-stars",
  storageBucket: "sister-stars.firebasestorage.app",
  messagingSenderId: "876499122680",
  appId: "1:876499122680:web:f600913385ba18cfe33e0d"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);