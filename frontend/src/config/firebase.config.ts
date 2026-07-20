import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC_ApMIi3V_CklOmiRb9kZOenh0kW1vxL0",
  authDomain: "eduassist-prod.firebaseapp.com",
  projectId: "eduassist-prod",
  storageBucket: "eduassist-prod.firebasestorage.app",
  messagingSenderId: "989142614977",
  appId: "1:989142614977:web:5759afa692bfaf404a2540",
};

export const app = initializeApp(firebaseConfig);

// getAuth automatically picks the right persistence for each platform
// (indexedDB on web, AsyncStorage on native via react-native adapter).
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

