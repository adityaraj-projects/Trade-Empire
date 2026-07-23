import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://trade-empire-vyapari-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "trade-empire-vyapari",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "trade-empire-vyapari.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock-app-id"
};

// Check if credentials are mock/default templates or missing
export const IS_FIREBASE_MOCK = 
  firebaseConfig.apiKey === 'mock-api-key' || 
  !import.meta.env.VITE_FIREBASE_API_KEY;

// Only initialize Firebase if we are NOT in mock fallback mode
let app: any = null;
let database: any = null;
let auth: any = null;

if (!IS_FIREBASE_MOCK) {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    auth = getAuth(app);
  } catch (err) {
    console.warn("Failed to initialize Firebase app. Falling back to local mock.", err);
  }
}

export { app, database, auth };
