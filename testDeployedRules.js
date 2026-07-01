import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQOLuTJ8tiXlQ2rf5jqW1ag-xy2fno3lc",
  authDomain: "autotrack-app-a6dbc.firebaseapp.com",
  projectId: "autotrack-app-a6dbc",
  storageBucket: "autotrack-app-a6dbc.firebasestorage.app",
  messagingSenderId: "644802121767",
  appId: "1:644802121767:web:716b876869862aa420fe02",
  measurementId: "G-REJZRK0EFV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function runTest() {
  try {
    console.log("1. Logging in as seeded mechanic (Pastor Emma: 08011111111)...");
    const cred = await signInWithEmailAndPassword(auth, "08011111111@autotrack.local", "917072");
    console.log("Logged in! UID:", cred.user.uid);
    
    console.log("2. Testing first-login read...");
    const mechanicRef = doc(db, 'mechanics', cred.user.uid);
    const mechanicSnap = await getDoc(mechanicRef);
    if (mechanicSnap.exists()) {
      console.log("Read successful! Mechanic data:", mechanicSnap.data().name);
    } else {
      console.log("Mechanic document does not exist.");
    }
    
    console.log("3. Testing creation permissions...");
    const customerRef = collection(db, 'customers');
    const newCustomer = {
      name: 'Test Customer',
      phone: '1234567890',
      workshop_id: 'workshop-1'
    };
    const docRef = await addDoc(customerRef, newCustomer);
    console.log("Creation successful! Customer ID:", docRef.id);
    
    console.log("All tests passed!");
    process.exit(0);
  } catch(e) {
    console.error("Test failed:", e);
    process.exit(1);
  }
}

runTest();
