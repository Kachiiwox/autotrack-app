import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../database/firebaseConfig';
import { WORKSHOP_ID } from '../../constants/config';

const CUSTOMERS_COLLECTION = 'customers';

export interface Customer {
  id?: string;
  name: string;
  phone: string;
  notes?: string;
  isWalkIn?: boolean;
  workshop_id?: string;
  created_at?: any;
}

import { trackPendingWrite } from '../../components/SyncStatusContext';

export async function createCustomer(data: Omit<Customer, 'workshop_id' | 'created_at'>) {
  const customersRef = collection(db, CUSTOMERS_COLLECTION);
  
  // Rule: Phone number is unique identifier. Walk-ins without phone allowed if flagged.
  if (data.phone) {
    const q = query(
      customersRef, 
      where('workshop_id', '==', WORKSHOP_ID), 
      where('phone', '==', data.phone)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error(`Customer with phone number ${data.phone} already exists.`);
    }
  } else if (!data.isWalkIn) {
    throw new Error('Phone number is required unless customer is flagged as walk-in.');
  }

  const docRef = await trackPendingWrite(addDoc(customersRef, {
    ...data,
    workshop_id: WORKSHOP_ID,
    created_at: serverTimestamp()
  }));

  return docRef.id;
}

export async function getCustomers(searchQuery?: string) {
  const customersRef = collection(db, CUSTOMERS_COLLECTION);
  const q = query(customersRef, where('workshop_id', '==', WORKSHOP_ID));
  const querySnapshot = await getDocs(q);
  
  let customers: Customer[] = [];
  querySnapshot.forEach((doc) => {
    customers.push({ id: doc.id, ...doc.data() } as Customer);
  });

  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    customers = customers.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) || 
      (c.phone && c.phone.includes(searchQuery))
    );
  }

  return customers;
}
