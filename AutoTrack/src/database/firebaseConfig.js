import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

// TODO: AsyncStorage persistence needs to be properly implemented once real Auth screens are built.
// Currently falling back to simpler working persistence setup (getAuth) since getReactNativePersistence 
// is not available in this version of firebase/auth.
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
