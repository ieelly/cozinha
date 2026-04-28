import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBXDLXPtfMmPb7V6cGGFiANUdoOou0Z9eQ",
  authDomain: "bella-massa-6a258.firebaseapp.com",
  projectId: "bella-massa-6a258",
  storageBucket: "bella-massa-6a258.firebasestorage.app",
  messagingSenderId: "538311685459",
  appId: "1:538311685459:web:7102b565a69eb5cc2cdda6"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);