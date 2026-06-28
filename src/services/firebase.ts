// Firebase configuration
// Replace the placeholder values with your Firebase project credentials
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBFtwT0nPzZzrSMKhZexCkqreKdQSUE0Fk",
  authDomain: "apppizzaria-5a53e.firebaseapp.com",
  projectId: "apppizzaria-5a53e",
  storageBucket: "apppizzaria-5a53e.firebasestorage.app",
  messagingSenderId: "269889144420",
  appId: "1:269889144420:web:bd4b2f4ce84bb37433c171"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
