import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import { getRepairJobById, updateRepairJobStatus, updateRepairJobCost, RepairJob } from './repairJobModel';
import { getComplaintsForJob, updateComplaintStatus, Complaint, ComplaintStatus } from './complaintModel';
import { getAllMechanics, seedMechanicsIfEmpty, Mechanic } from '../mechanics/mechanicModel';
import { createWorkOrder } from '../workOrders/workOrderModel';
import { recordPayment, getPaymentsForJob, Payment, PaymentMethod, PaymentType } from '../payments/paymentModel';

interface RepairJobDetailProps {
  jobId: string;
}

const STATUS_OPTIONS: ComplaintStatus[] = ['Open', 'Diagnosed', 'Approved', 'In Progress', 'Repaired', 'Verified', 'Declined'];

export default function RepairJobDetail({ jobId }: RepairJobDetailProps) {
  const [job, setJob] = useState<RepairJob | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [selectedMechanics, setSelectedMechanics] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Payments State
  const [totalCostInput, setTotalCostInput] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobData = await getRepairJobById(jobId);
      setJob(jobData);
      if (jobData) {
        const compData = await getComplaintsForJob(jobId);
        setComplaints(compData);
        if (jobData.total_cost !== undefined) {
          setTotalCostInput(jobData.total_cost.toString());
        }
        const paymentsData = await getPaymentsForJob(jobId);
        setPayments(paymentsData);
      }
      await seedMechanicsIfEmpty();
      const mechs = await getAllMechanics();
      setMechanics(mechs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) fetchData();
  }, [jobId]);

  const handleUpdateComplaint = async (complaintId: string, newStatus: ComplaintStatus) => {
    // TODO: restrict "Verified" status to senior mechanic/owner role once Auth/roles are built
    try {
      await updateComplaintStatus(complaintId, newStatus);
      fetchData(); // Refresh list
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCreateWorkOrder = async (complaintId: string) => {
    const mechanicId = selectedMechanics[complaintId];
    if (!mechanicId) {
      Alert.alert('Validation Error', 'Please select a mechanic to assign.');
      return;
    }
    try {
      await createWorkOrder(complaintId, jobId, mechanicId);
      Alert.alert('Success', 'Work Order created! Mechanic assigned.');
      // Refresh to potentially show work order status if we link it back later,
      // but for now, just alerting is fine.
    } catch (error: any) {
      Alert.alert('Error', 'Failed to create work order.');
    }
  };

  const handleUpdateCost = async () => {
    const num = parseFloat(totalCostInput);
    if (isNaN(num) || num < 0) {
      Alert.alert('Validation Error', 'Enter a valid cost amount.');
      return;
    }
    try {
      await updateRepairJobCost(jobId, num);
      Alert.alert('Success', 'Total cost updated.');
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmountInput);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Validation Error', 'Enter a valid payment amount.');
      return;
    }
    const sumP = payments.reduce((sum, p) => sum + p.amount, 0);
    const bal = (job?.total_cost || 0) - sumP;
    const type: PaymentType = (sumP === 0 && amount < (job?.total_cost || 0)) ? 'Deposit' : (amount >= bal ? 'Full' : 'Balance');

    try {
      await recordPayment(jobId, amount, paymentMethod, type);
      setPaymentAmountInput('');
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const getFilteredMechanics = (requiredSpecialty?: string) => {
    if (!requiredSpecialty || requiredSpecialty === 'General') {
      return mechanics; // Or return all, or those with 'General'
    }
    return mechanics.filter(m => m.specialties.includes(requiredSpecialty) || m.specialties.includes('General'));
  };

  const handleMarkReadyForRelease = async () => {
    try {
      await updateRepairJobStatus(jobId, 'Ready for Release');
      Alert.alert('Success', 'Job marked as Ready for Release');
      fetchData();
    } catch (error: any) {
      Alert.alert('Validation Error', error.message);
    }
  };

  if (loading) return <ActivityIndicator style={styles.loader} size="large" />;
  if (!job) return <Text style={styles.errorText}>Job not found</Text>;

  const sumPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const hasCost = job.total_cost !== undefined;
  const balance = hasCost ? job.total_cost! - sumPayments : 0;

  const canReleaseComplaints = complaints.length > 0 && complaints.every(c => c.status === 'Verified' || c.status === 'Declined');
  const canReleasePayments = !hasCost || balance <= 0;
  const canRelease = canReleaseComplaints && canReleasePayments;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job: {job.id}</Text>
      <Text style={styles.subtitle}>Vehicle: {job.vehicle_id}</Text>
      <Text style={styles.subtitle}>Job Status: {job.status}</Text>

      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Payments & Cost</Text>
        <View style={styles.row}>
          <TextInput 
            style={styles.input} 
            placeholder="Total Agreed Cost" 
            keyboardType="numeric"
            value={totalCostInput}
            onChangeText={setTotalCostInput}
          />
          <Button title="Set Cost" onPress={handleUpdateCost} />
        </View>
        
        {hasCost && (
          <View style={styles.balanceBox}>
            <Text>Total Cost: ₦{job.total_cost}</Text>
            <Text>Total Paid: ₦{sumPayments}</Text>
            <Text style={{fontWeight: 'bold', color: balance > 0 ? 'red' : 'green'}}>
              Balance: ₦{Math.max(0, balance)}
            </Text>
          </View>
        )}

        {hasCost && balance > 0 && (
          <View style={styles.paymentForm}>
            <TextInput 
              style={styles.input} 
              placeholder="Payment Amount" 
              keyboardType="numeric"
              value={paymentAmountInput}
              onChangeText={setPaymentAmountInput}
            />
            <View style={styles.row}>
              {['Cash', 'POS', 'Transfer'].map((m) => (
                <TouchableOpacity 
                  key={m} 
                  style={[styles.methodBadge, paymentMethod === m && styles.activeMethodBadge]}
                  onPress={() => setPaymentMethod(m as PaymentMethod)}
                >
                  <Text style={paymentMethod === m ? styles.activeMethodText : {}}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button title="Record Payment" onPress={handleRecordPayment} />
          </View>
        )}

        {payments.length > 0 && (
          <View style={styles.paymentList}>
            {payments.map(p => (
              <Text key={p.id}>• ₦{p.amount} via {p.method} ({p.type})</Text>
            ))}
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Complaints</Text>
      <FlatList
        data={complaints}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <View style={styles.complaintCard}>
            <Text style={styles.descText}>{item.description || '[No description]'}</Text>
            {item.voice_note_url ? <Text style={styles.mediaText}>🎤 Voice Note attached</Text> : null}
            {item.photo_url ? <Text style={styles.mediaText}>📷 Photo attached</Text> : null}
            
            <Text style={styles.statusLabel}>Update Status:</Text>
            <View style={styles.statusContainer}>
              {STATUS_OPTIONS.map(status => (
                <TouchableOpacity 
                  key={status} 
                  style={[styles.statusBadge, item.status === status && styles.activeBadge]}
                  onPress={() => handleUpdateComplaint(item.id!, status)}
                >
                  <Text style={[styles.statusBadgeText, item.status === status && styles.activeBadgeText]}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {item.status === 'Approved' && (
              <View style={styles.assignmentBox}>
                <Text style={styles.assignmentLabel}>Assign Mechanic (Specialty: {item.required_specialty || 'Any'})</Text>
                <View style={styles.mechanicList}>
                  {getFilteredMechanics(item.required_specialty).map(m => (
                    <TouchableOpacity 
                      key={m.id} 
                      style={[styles.mechanicBadge, selectedMechanics[item.id!] === m.id && styles.activeMechanicBadge]}
                      onPress={() => setSelectedMechanics({...selectedMechanics, [item.id!]: m.id!})}
                    >
                      <Text style={[styles.mechanicText, selectedMechanics[item.id!] === m.id && styles.activeMechanicText]}>{m.name}</Text>
                    </TouchableOpacity>
                  ))}
                  {getFilteredMechanics(item.required_specialty).length === 0 && (
                    <Text style={styles.helperText}>No mechanics found with this specialty.</Text>
                  )}
                </View>
                <Button title="Create Work Order" onPress={() => handleCreateWorkOrder(item.id!)} color="#EF8A20" />
              </View>
            )}
          </View>
        )}
      />

      <View style={styles.footer}>
        <Button 
          title="Mark Ready for Release" 
          onPress={handleMarkReadyForRelease} 
          disabled={!canRelease || job.status === 'Ready for Release'} 
        />
        {!canReleaseComplaints && job.status !== 'Ready for Release' && (
          <Text style={styles.helperText}>All complaints must be Verified or Declined to release.</Text>
        )}
        {!canReleasePayments && job.status !== 'Ready for Release' && (
          <Text style={styles.helperText}>Outstanding balance must be cleared to release.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center' },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 12 },
  complaintCard: { padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  descText: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  mediaText: { color: '#005fcc', marginBottom: 4 },
  statusLabel: { marginTop: 8, fontSize: 12, color: '#666' },
  statusContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  statusBadge: { backgroundColor: '#e0e0e0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8, marginBottom: 8 },
  activeBadge: { backgroundColor: '#005fcc' },
  statusBadgeText: { fontSize: 12, color: '#333' },
  activeBadgeText: { color: 'white' },
  footer: { marginTop: 16, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  helperText: { fontSize: 12, color: 'red', textAlign: 'center', marginTop: 8 },
  assignmentBox: { marginTop: 16, padding: 12, backgroundColor: '#f0f4f8', borderRadius: 8, borderWidth: 1, borderColor: '#d0e0e3' },
  assignmentLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  mechanicList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  mechanicBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', marginRight: 8, marginBottom: 8 },
  activeMechanicBadge: { backgroundColor: '#208AEF', borderColor: '#208AEF' },
  mechanicText: { fontSize: 14, color: '#333' },
  activeMechanicText: { color: 'white', fontWeight: 'bold' },
  paymentSection: { padding: 12, backgroundColor: '#f0f8ff', borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#cce0ff' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, marginRight: 8, backgroundColor: '#fff' },
  balanceBox: { padding: 8, backgroundColor: '#e6f2ff', borderRadius: 4, marginBottom: 8 },
  paymentForm: { marginTop: 8, borderTopWidth: 1, borderColor: '#ccc', paddingTop: 8 },
  methodBadge: { padding: 6, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginRight: 8 },
  activeMethodBadge: { backgroundColor: '#005fcc', borderColor: '#005fcc' },
  activeMethodText: { color: 'white' },
  paymentList: { marginTop: 8 }
});
