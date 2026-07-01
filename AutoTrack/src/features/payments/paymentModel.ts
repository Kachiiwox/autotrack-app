import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../database/firebaseConfig';
import { WORKSHOP_ID } from '../../constants/config';
import { trackPendingWrite } from '../../components/SyncStatusContext';

export const PAYMENTS_COLLECTION = 'payments';

export type PaymentMethod = 'Cash' | 'POS' | 'Transfer';
export type PaymentType = 'Deposit' | 'Balance' | 'Full';

export interface Payment {
  id?: string;
  repair_job_id: string;
  amount: number;
  method: PaymentMethod;
  type: PaymentType;
  workshop_id?: string;
  created_at?: any;
}

export async function recordPayment(repair_job_id: string, amount: number, method: PaymentMethod, type: PaymentType): Promise<string> {
  const paymentsRef = collection(db, PAYMENTS_COLLECTION);
  const newPayment: Payment = {
    repair_job_id,
    amount,
    method,
    type,
    workshop_id: WORKSHOP_ID,
    created_at: serverTimestamp()
  };

  const docRef = await trackPendingWrite(addDoc(paymentsRef, newPayment));
  return docRef.id;
}

export async function getPaymentsForJob(repair_job_id: string): Promise<Payment[]> {
  const paymentsRef = collection(db, PAYMENTS_COLLECTION);
  const q = query(
    paymentsRef,
    where('workshop_id', '==', WORKSHOP_ID),
    where('repair_job_id', '==', repair_job_id)
  );

  const snapshot = await getDocs(q);
  const payments: Payment[] = [];
  snapshot.forEach(doc => {
    payments.push({ id: doc.id, ...doc.data() } as Payment);
  });

  return payments;
}
