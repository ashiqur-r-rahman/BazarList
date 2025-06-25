import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

// IMPORTANT: Create a .env.local file in the root of your project
// and add your Firebase configuration there.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;
let firebaseInitialized = false;

// Initialize Firebase only if all keys are present
if (firebaseConfig.apiKey) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
        firebaseInitialized = true;
    } catch(e) {
        console.error('Firebase initialization error', e);
    }
} else {
    console.warn("Firebase API Key is missing. Firebase features will be disabled. Please add NEXT_PUBLIC_FIREBASE_API_KEY to your .env.local file");
}


export { app, auth, googleProvider, firebaseInitialized };
