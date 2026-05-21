// Firebase configuration
// Replace the placeholder values with your Firebase project credentials
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDJ4HzrrCXrqn4-bCeVFDKuqHdFBhChYRI",
    authDomain: "fomedepizza-9bcf0.firebaseapp.com",
    projectId: "fomedepizza-9bcf0",
    storageBucket: "fomedepizza-9bcf0.firebasestorage.app",
    messagingSenderId: "579927904072",
    appId: "1:579927904072:web:56f1eb7b2411b38db16d7d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
