import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../database/firebaseConfig';
import { WORKSHOP_ID } from '../../constants/config';
import { COMPLAINTS_COLLECTION, updateComplaintStatus } from '../repairJobs/complaintModel';

export const WORK_ORDERS_COLLECTION = 'work_orders';

export type WorkOrderStatus = 'Pending' | 'In Progress' | 'Completed';

export interface WorkOrder {
  id?: string;
  complaint_id: string;
  repair_job_id: string;
  mechanic_id: string;
  status: WorkOrderStatus;
  priority: string;
  workshop_id: string;
  created_at?: any;
  updated_at?: any;
}

export async function createWorkOrder(complaint_id: string, repair_job_id: string, mechanic_id: string, priority: string = 'Normal'): Promise<string> {
  const workOrderRef = collection(db, WORK_ORDERS_COLLECTION);
  const newOrder: WorkOrder = {
    complaint_id,
    repair_job_id,
    mechanic_id,
    status: 'Pending',
    priority,
    workshop_id: WORKSHOP_ID,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  };
  
  const docRef = await addDoc(workOrderRef, newOrder);
  return docRef.id;
}

export async function getWorkOrdersByMechanic(mechanic_id: string): Promise<WorkOrder[]> {
  const workOrderRef = collection(db, WORK_ORDERS_COLLECTION);
  const q = query(
    workOrderRef, 
    where('workshop_id', '==', WORKSHOP_ID),
    where('mechanic_id', '==', mechanic_id)
  );
  
  const snapshot = await getDocs(q);
  const orders: WorkOrder[] = [];
  snapshot.forEach(d => {
    orders.push({ id: d.id, ...d.data() } as WorkOrder);
  });
  
  return orders;
}

export async function updateWorkOrderStatus(workOrder_id: string, status: WorkOrderStatus) {
  const workOrderRef = doc(db, WORK_ORDERS_COLLECTION, workOrder_id);
  await updateDoc(workOrderRef, {
    status,
    updated_at: serverTimestamp()
  });

  // Cross-module update: sync parent complaint status
  const orderSnapshot = await getDoc(workOrderRef);
  if (orderSnapshot.exists()) {
    const orderData = orderSnapshot.data() as WorkOrder;
    if (status === 'In Progress') {
      await updateComplaintStatus(orderData.complaint_id, 'In Progress');
    } else if (status === 'Completed') {
      await updateComplaintStatus(orderData.complaint_id, 'Repaired');
    }
  }
}
