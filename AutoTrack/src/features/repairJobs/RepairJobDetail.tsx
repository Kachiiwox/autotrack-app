import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { getRepairJobById, updateRepairJobStatus, RepairJob } from './repairJobModel';
import { getComplaintsForJob, updateComplaintStatus, Complaint, ComplaintStatus } from './complaintModel';

interface RepairJobDetailProps {
  jobId: string;
}

const STATUS_OPTIONS: ComplaintStatus[] = ['Open', 'Diagnosed', 'Approved', 'In Progress', 'Repaired', 'Verified', 'Declined'];

export default function RepairJobDetail({ jobId }: RepairJobDetailProps) {
  const [job, setJob] = useState<RepairJob | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobData = await getRepairJobById(jobId);
      setJob(jobData);
      if (jobData) {
        const compData = await getComplaintsForJob(jobId);
        setComplaints(compData);
      }
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

  const canRelease = complaints.length > 0 && complaints.every(c => c.status === 'Verified' || c.status === 'Declined');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job: {job.id}</Text>
      <Text style={styles.subtitle}>Vehicle: {job.vehicle_id}</Text>
      <Text style={styles.subtitle}>Job Status: {job.status}</Text>

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
          </View>
        )}
      />

      <View style={styles.footer}>
        <Button 
          title="Mark Ready for Release" 
          onPress={handleMarkReadyForRelease} 
          disabled={!canRelease || job.status === 'Ready for Release'} 
        />
        {!canRelease && job.status !== 'Ready for Release' && (
          <Text style={styles.helperText}>All complaints must be Verified or Declined to release.</Text>
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
  helperText: { fontSize: 12, color: 'red', textAlign: 'center', marginTop: 8 }
});
