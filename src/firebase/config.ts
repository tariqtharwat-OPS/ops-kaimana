import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Real project credentials for oceanpearl-ops
const firebaseConfig = {
  apiKey: "AIzaSyBmHSr7huWpMZa9RnKNBgV6fnXltmvsxcc",
  authDomain: "oceanpearl-ops.firebaseapp.com",
  projectId: "oceanpearl-ops",
  storageBucket: "oceanpearl-ops.firebasestorage.app",
  messagingSenderId: "784571080866",
  appId: "1:784571080866:web:61bacaf38ea90f81d1f7fb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
