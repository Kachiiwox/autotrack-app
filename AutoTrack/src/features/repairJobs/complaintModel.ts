import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../database/firebaseConfig';
import { WORKSHOP_ID } from '../../constants/config';

export const COMPLAINTS_COLLECTION = 'complaints';

export type ComplaintStatus = 'Open' | 'Diagnosed' | 'Approved' | 'In Progress' | 'Repaired' | 'Verified' | 'Declined';

export interface Complaint {
  id?: string;
  repair_job_id: string;
  description: string;
  voice_note_url?: string;
  photo_url?: string;
  status: ComplaintStatus;
  required_specialty?: string;
  created_by?: string;
  workshop_id?: string;
  created_at?: any;
}

export async function getComplaintsForJob(jobId: string) {
  const complaintsRef = collection(db, COMPLAINTS_COLLECTION);
  const q = query(
    complaintsRef, 
    where('workshop_id', '==', WORKSHOP_ID),
    where('repair_job_id', '==', jobId)
  );
  
  const querySnapshot = await getDocs(q);
  const complaints: Complaint[] = [];
  querySnapshot.forEach((doc) => {
    complaints.push({ id: doc.id, ...doc.data() } as Complaint);
  });
  
  // Return sorted by creation theoretically, though Firestore query might need indexing.
  return complaints;
}

import { trackPendingWrite } from '../../components/SyncStatusContext';

export async function updateComplaintStatus(complaintId: string, newStatus: ComplaintStatus) {
  // TODO: restrict "Verified" status to senior mechanic/owner role once Auth/roles are built
  const complaintRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  await trackPendingWrite(updateDoc(complaintRef, {
    status: newStatus,
    updated_at: serverTimestamp()
  }));
}

export async function getComplaintById(complaintId: string): Promise<Complaint | null> {
  const complaintRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snapshot = await import('firebase/firestore').then(m => m.getDoc(complaintRef));
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Complaint;
  }
  return null;
}
