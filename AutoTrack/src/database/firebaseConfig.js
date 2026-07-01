import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager, memoryLocalCache } from "firebase/firestore";
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyBQOLuTJ8tiXlQ2rf5jqW1ag-xy2fno3lc",
  authDomain: "autotrack-app-a6dbc.firebaseapp.com",
  projectId: "autotrack-app-a6dbc",
  storageBucket: "autotrack-app-a6dbc.firebasestorage.app",
  messagingSenderId: "644802121767",
  appId: "1:644802121767:web:716b876869862aa420fe02",
  measurementId: "G-REJZRK0EFV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth Configuration
// We need an uninitialized variable to hold the auth instance
let authInstance;

if (Platform.OS === 'web') {
  // Web uses browserLocalPersistence
  const { initializeAuth, browserLocalPersistence } = require('firebase/auth');
  authInstance = initializeAuth(app, {
    persistence: browserLocalPersistence
  });
} else {
  // Mobile uses getReactNativePersistence with AsyncStorage
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export const auth = authInstance;

// Firestore Offline Persistence
// 
// =====================================================================================
// WARNING: DATA LOSS RISK ON MOBILE (iOS/Android)
// =====================================================================================
// The Firebase JS SDK's `persistentLocalCache` relies on IndexedDB, which works 
// perfectly on Web to provide true offline-first disk persistence.
// However, React Native (mobile) does NOT natively support IndexedDB. On mobile, 
// this setup silently degrades to `memoryLocalCache`.
// 
// This means if a mechanic goes offline, creates/edits a complaint, and then 
// force-closes the app before connectivity is restored, those unsynced writes 
// WILL BE LOST permanently from memory.
// 
// LONG-TERM SOLUTION: 
// To fulfill the "never lose a customer complaint" core promise on mobile, 
// we MUST migrate from the Firebase JS SDK (`firebase/firestore`) to 
// `@react-native-firebase/firestore`, which uses native SQLite bindings under the hood.
// =====================================================================================

let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    // Attempt to use persistent cache (IndexedDB). If it fails (e.g. React Native), catch it.
    localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() })
  });
} catch (e) {
  // Fallback to memory if IndexedDB is missing
  console.warn("IndexedDB not available for Firestore persistence, falling back to memoryLocalCache", e);
  dbInstance = initializeFirestore(app, {
    localCache: memoryLocalCache()
  });
}

export const db = dbInstance;
export default app;
