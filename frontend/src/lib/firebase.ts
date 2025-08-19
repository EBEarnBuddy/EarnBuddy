import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDoEPIqS_9wXRnWUWP-wTR_BqWBjqFCXVs",
  authDomain: "earnbuddy-641b3.firebaseapp.com",
  projectId: "earnbuddy-641b3",
  storageBucket: "earnbuddy-641b3.firebasestorage.app",
  messagingSenderId: "679982634262",
  appId: "1:679982634262:web:ef471fa3e4f99008216c37",
  measurementId: "G-Z09YD857RK"
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey &&
         firebaseConfig.authDomain &&
         firebaseConfig.projectId &&
         firebaseConfig.storageBucket &&
         firebaseConfig.messagingSenderId &&
         firebaseConfig.appId;
};

let app;
let auth;
let db;
let storage;
let googleProvider;

if (isFirebaseConfigured()) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize Firebase Authentication and get a reference to the service
    auth = getAuth(app);

    // Configure Google Provider with additional settings
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    // Set custom parameters for better popup handling
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    // Initialize Cloud Firestore with robust transport options for dev networks
    // Auto-detect long polling if WebChannel streaming is blocked (proxies/ISP/extensions)
    db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true
    });

    // Initialize Firebase Storage
    storage = getStorage(app);

    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn('Firebase is not properly configured. Please update your environment variables with valid Firebase credentials.');
  // TODO: Configure Firebase properly
  auth = null;
  googleProvider = null;
  db = null;
  storage = null;
}

export { auth, googleProvider, db, storage, isFirebaseConfigured };
export default app;