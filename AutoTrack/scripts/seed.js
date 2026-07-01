
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, setDoc, doc, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBQOLuTJ8tiXlQ2rf5jqW1ag-xy2fno3lc",
  authDomain: "autotrack-app-a6dbc.firebaseapp.com",
  projectId: "autotrack-app-a6dbc",
  storageBucket: "autotrack-app-a6dbc.firebasestorage.app",
  messagingSenderId: "644802121767",
  appId: "1:644802121767:web:716b876869862aa420fe02"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const WORKSHOP_ID = 'workshop-1';
const MECHANICS_COLLECTION = 'mechanics';

async function seed() {
  const q = query(collection(db, MECHANICS_COLLECTION), where('workshop_id', '==', WORKSHOP_ID));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    const defaultMechanics = [
      { name: 'Pastor Emma', specialties: ['General'], workshop_id: WORKSHOP_ID, role: 'Owner', phone: '08011111111' },
      { name: 'Chuks', specialties: ['General', 'Electrical'], workshop_id: WORKSHOP_ID, role: 'Senior Mechanic', phone: '08022222222' },
      { name: 'Musa', specialties: ['AC'], workshop_id: WORKSHOP_ID, role: 'Senior Mechanic', phone: '08033333333' },
      { name: 'Ifeanyi', specialties: [], workshop_id: WORKSHOP_ID, role: 'Apprentice', phone: '08044444444' }
    ];

    const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
    const secondaryAuth = getAuth(secondaryApp);
    const secondaryDb = getFirestore(secondaryApp);

    console.log('--- SEEDING MECHANICS & PINS ---');
    
    for (const mech of defaultMechanics) {
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      const email = `${mech.phone}@autotrack.local`;
      
      try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, pin);
        const uid = userCredential.user.uid;
        
        mech.must_change_pin = true;
        
        // Write using the authenticated secondaryDb so it passes strict rules
        await setDoc(doc(secondaryDb, MECHANICS_COLLECTION, uid), mech);
        
        console.log(`Created: ${mech.name} | Role: ${mech.role} | Phone: ${mech.phone} | PIN: ${pin}`);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`User ${mech.phone} already exists in Auth. Skipping...`);
        } else {
          console.error(`Error creating user ${mech.phone}:`, error);
        }
      }
    }
    console.log('--------------------------------');
  } else {
    console.log('Mechanics already seeded.');
  }
  process.exit(0);
}

seed();
