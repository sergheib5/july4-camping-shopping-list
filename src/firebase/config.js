import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// These will be replaced with actual values from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// Validate Firebase configuration
const validateConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => {
    const value = firebaseConfig[field];
    return !value || value === `your-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}` || value.includes('your-');
  });

  if (missingFields.length > 0) {
    console.error('❌ Firebase configuration is missing or incomplete:', missingFields);
    console.error('Please check your .env file and ensure all VITE_FIREBASE_* variables are set correctly.');
    return false;
  }
  return true;
};

// Initialize Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  
  // Validate config in development
  if (import.meta.env.DEV) {
    validateConfig();
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  if (import.meta.env.DEV) {
    console.error('Please check your Firebase configuration in .env file');
  }
  throw error;
}

export { db };
export default app;

