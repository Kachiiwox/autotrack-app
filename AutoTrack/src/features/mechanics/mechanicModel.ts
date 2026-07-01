import { collection, getDocs, setDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../database/firebaseConfig';
import { WORKSHOP_ID } from '../../constants/config';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

export const MECHANICS_COLLECTION = 'mechanics';

export type Role = 'Owner' | 'Senior Mechanic' | 'Apprentice' | 'Front Desk';

export interface Mechanic {
  id?: string;
  name: string;
  specialties: string[];
  workshop_id: string;
  phone?: string;
  role: Role;
  must_change_pin?: boolean;
}

export async function getAllMechanics(): Promise<Mechanic[]> {
  const mechanicsRef = collection(db, MECHANICS_COLLECTION);
  const q = query(mechanicsRef, where('workshop_id', '==', WORKSHOP_ID));
  const snapshot = await getDocs(q);
  
  const mechanics: Mechanic[] = [];
  snapshot.forEach(doc => {
    mechanics.push({ id: doc.id, ...doc.data() } as Mechanic);
  });
  
  return mechanics;
}

export async function getMechanicById(uid: string): Promise<Mechanic | null> {
  const docRef = doc(db, MECHANICS_COLLECTION, uid);
  const snapshot = await getDocs(query(collection(db, MECHANICS_COLLECTION), where('__name__', '==', uid)));
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Mechanic;
}

export async function seedMechanicsIfEmpty() {
  const mechanics = await getAllMechanics();
  if (mechanics.length === 0) {
    const defaultMechanics: Mechanic[] = [
      { name: 'Pastor Emma', specialties: ['General'], workshop_id: WORKSHOP_ID, role: 'Owner', phone: '08011111111' },
      { name: 'Chuks', specialties: ['General', 'Electrical'], workshop_id: WORKSHOP_ID, role: 'Senior Mechanic', phone: '08022222222' },
      { name: 'Musa', specialties: ['AC'], workshop_id: WORKSHOP_ID, role: 'Senior Mechanic', phone: '08033333333' },
      { name: 'Ifeanyi', specialties: [], workshop_id: WORKSHOP_ID, role: 'Apprentice', phone: '08044444444' }
    ];
    
    // We only initialize the secondary app once
    const { getApps } = require('firebase/app');
    const { default: app } = require('../../database/firebaseConfig');
    
    let secondaryApp = getApps().find((a: any) => a.name === 'SecondaryApp');
    if (!secondaryApp) {
      secondaryApp = initializeApp(app.options, 'SecondaryApp');
    }
    const secondaryAuth = getAuth(secondaryApp);

    console.log('--- SEEDING MECHANICS & PINS ---');
    
    for (const mech of defaultMechanics) {
      // Generate a random 6 digit PIN (Firebase Auth requires min 6 chars for password)
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      const email = `${mech.phone}@autotrack.local`;
      
      try {
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, pin);
        const uid = userCredential.user.uid;
        
        mech.must_change_pin = true;
        
        // Write to Firestore with the auth uid as the document ID
        await setDoc(doc(db, MECHANICS_COLLECTION, uid), mech);
        
        console.log(`Created: ${mech.name} | Role: ${mech.role} | Phone: ${mech.phone} | PIN: ${pin}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`User ${mech.phone} already exists in Auth. Skipping...`);
        } else {
          console.error(`Error creating user ${mech.phone}:`, error);
        }
      }
    }
    console.log('--------------------------------');
  }
}
