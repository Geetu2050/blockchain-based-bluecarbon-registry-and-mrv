// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration object
// These values should be set in your environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "blue-carbon-registry.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "blue-carbon-registry",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "blue-carbon-registry.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Auth and ensure a signed-in session for storage rules
export const auth = getAuth(app);
export const ensureFirebaseAuthSignedIn = async () => {
  try {
    if (auth.currentUser) {
      return auth.currentUser;
    }
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    // Allow caller to handle auth errors explicitly
    throw error;
  }
};

export default app;

