import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Project: ops-kaimana (unified — hosting + Firestore + Auth)
export const firebaseConfig = {
  apiKey: "AIzaSyDSZbFxBNRNpHRxzS3sz_mQruBlfAtMO3I",
  authDomain: "ops-kaimana.firebaseapp.com",
  projectId: "ops-kaimana",
  storageBucket: "ops-kaimana.firebasestorage.app",
  messagingSenderId: "398690919178",
  appId: "1:398690919178:web:24bd08477d72b6b68410f3"
};

let app;
let db: any;
let auth: any;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { db, auth };

