import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '../../database/firebaseConfig';
import { WORKSHOP_ID } from '../../constants/config';
import { COMPLAINTS_COLLECTION, Complaint, getComplaintsForJob } from './complaintModel';

export const REPAIR_JOBS_COLLECTION = 'repair_jobs';

export type RepairJobStatus = 'Intake' | 'In Progress' | 'Ready for Release' | 'Released';

export interface RepairJob {
  id?: string;
  vehicle_id: string;
  status: RepairJobStatus;
  total_cost?: number; // Added for basic payment balance tracking
  workshop_id?: string;
  created_at?: any;
  closed_at?: any;
}

import { trackPendingWrite } from '../../components/SyncStatusContext';

export async function updateRepairJobCost(jobId: string, totalCost: number) {
  const jobRef = doc(db, REPAIR_JOBS_COLLECTION, jobId);
  await trackPendingWrite(updateDoc(jobRef, {
    total_cost: totalCost,
    updated_at: serverTimestamp()
  }));
}

export async function createRepairJob(vehicleId: string, complaints: Omit<Complaint, 'repair_job_id' | 'status' | 'workshop_id' | 'created_at'>[]) {
  if (!complaints || complaints.length === 0) {
    throw new Error("At least one complaint is required to create a repair job.");
  }

  const batch = writeBatch(db);

  // 1. Create the Repair Job document
  const jobsRef = doc(collection(db, REPAIR_JOBS_COLLECTION));
  batch.set(jobsRef, {
    vehicle_id: vehicleId,
    status: 'Intake',
    workshop_id: WORKSHOP_ID,
    created_at: serverTimestamp()
  });

  // 2. Create the Complaint documents
  const complaintsCol = collection(db, COMPLAINTS_COLLECTION);
  complaints.forEach((complaint) => {
    const newComplaintRef = doc(complaintsCol);
    batch.set(newComplaintRef, {
      ...complaint,
      repair_job_id: jobsRef.id,
      status: 'Open',
      workshop_id: WORKSHOP_ID,
      created_at: serverTimestamp()
    });
  });

  await trackPendingWrite(batch.commit());
  return jobsRef.id;
}

export async function getRepairJobs() {
  const jobsRef = collection(db, REPAIR_JOBS_COLLECTION);
  const q = query(jobsRef, where('workshop_id', '==', WORKSHOP_ID));
  
  const querySnapshot = await getDocs(q);
  const jobs: RepairJob[] = [];
  querySnapshot.forEach((doc) => {
    jobs.push({ id: doc.id, ...doc.data() } as RepairJob);
  });

  return jobs;
}

export async function getRepairJobById(jobId: string) {
  const docRef = doc(db, REPAIR_JOBS_COLLECTION, jobId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as RepairJob;
  }
  return null;
}

export async function updateRepairJobStatus(jobId: string, newStatus: RepairJobStatus) {
  if (newStatus === 'Ready for Release') {
    // Validate that all complaints are either Verified or Declined
    const complaints = await getComplaintsForJob(jobId);
    const hasUnresolved = complaints.some(c => c.status !== 'Verified' && c.status !== 'Declined');
    if (hasUnresolved) {
      throw new Error("Cannot mark job as Ready for Release while there are unresolved complaints. All complaints must be Verified or Declined.");
    }
  }

  const jobRef = doc(db, REPAIR_JOBS_COLLECTION, jobId);
  
  const updateData: any = {
    status: newStatus,
    updated_at: serverTimestamp()
  };
  
  if (newStatus === 'Released') {
    updateData.closed_at = serverTimestamp();
  }

  await trackPendingWrite(updateDoc(jobRef, updateData));
}
