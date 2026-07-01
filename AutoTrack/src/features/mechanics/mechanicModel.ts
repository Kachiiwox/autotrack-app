import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../../database/firebaseConfig';
import { WORKSHOP_ID } from '../../constants/config';

export const MECHANICS_COLLECTION = 'mechanics';

export interface Mechanic {
  id?: string;
  name: string;
  specialties: string[];
  workshop_id: string;
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

export async function seedMechanicsIfEmpty() {
  const mechanics = await getAllMechanics();
  if (mechanics.length === 0) {
    const defaultMechanics = [
      { name: 'John Doe', specialties: ['General', 'Electrical'], workshop_id: WORKSHOP_ID },
      { name: 'Mike Smith', specialties: ['Panel Beating'], workshop_id: WORKSHOP_ID },
      { name: 'Sarah Lee', specialties: ['AC', 'General'], workshop_id: WORKSHOP_ID },
      { name: 'Tom B', specialties: ['Gear/Transmission', 'Brakes'], workshop_id: WORKSHOP_ID }
    ];
    
    const mechanicsRef = collection(db, MECHANICS_COLLECTION);
    for (const mech of defaultMechanics) {
      await addDoc(mechanicsRef, mech);
    }
    console.log('Seeded default mechanics');
  }
}
