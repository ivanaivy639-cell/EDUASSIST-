import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, initializeAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC_ApMIi3V_CklOmiRb9kZOenh0kW1vxL0",
  authDomain: "eduassist-prod.firebaseapp.com",
  projectId: "eduassist-prod",
  storageBucket: "eduassist-prod.firebasestorage.app",
  messagingSenderId: "989142614977",
  appId: "1:989142614977:web:5759afa692bfaf404a2540",
};

export const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app);

export const googleProvider = new GoogleAuthProvider();
