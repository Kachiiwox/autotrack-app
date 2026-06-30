import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../database/firebaseConfig';
import { WORKSHOP_ID } from '../../constants/config';

const VEHICLES_COLLECTION = 'vehicles';

export interface Vehicle {
  id?: string;
  customer_id: string;
  plate: string;
  make: string;
  model: string;
  year: string;
  vin?: string;
  photo_url?: string;
  workshop_id?: string;
  created_at?: any;
}

export async function createVehicle(data: Omit<Vehicle, 'workshop_id' | 'created_at'>) {
  const vehiclesRef = collection(db, VEHICLES_COLLECTION);
  
  // Rule: Plate number is unique within workshop. 
  if (data.plate) {
    const q = query(
      vehiclesRef, 
      where('workshop_id', '==', WORKSHOP_ID), 
      where('plate', '==', data.plate)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // DESIGN.md Phase 4.2 states this is a "soft warning, not hard block"
      console.warn(`Vehicle with plate ${data.plate} already exists in this workshop.`);
    }
  }

  const docRef = await addDoc(vehiclesRef, {
    ...data,
    workshop_id: WORKSHOP_ID,
    created_at: serverTimestamp()
  });

  return docRef.id;
}

export async function getVehiclesByCustomer(customerId: string) {
  const vehiclesRef = collection(db, VEHICLES_COLLECTION);
  const q = query(
    vehiclesRef, 
    where('workshop_id', '==', WORKSHOP_ID),
    where('customer_id', '==', customerId)
  );
  
  const querySnapshot = await getDocs(q);
  
  const vehicles: Vehicle[] = [];
  querySnapshot.forEach((doc) => {
    vehicles.push({ id: doc.id, ...doc.data() } as Vehicle);
  });

  return vehicles;
}

export async function reassignVehicle(vehicleId: string, newCustomerId: string) {
  const vehicleRef = doc(db, VEHICLES_COLLECTION, vehicleId);
  await updateDoc(vehicleRef, {
    customer_id: newCustomerId,
    updated_at: serverTimestamp() // To track assignment changes
  });
}
