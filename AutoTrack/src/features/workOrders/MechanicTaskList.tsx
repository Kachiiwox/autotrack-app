import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Button } from 'react-native';
import { subscribeWorkOrdersByMechanic, updateWorkOrderStatus, WorkOrder } from './workOrderModel';
import { getComplaintById, Complaint } from '../repairJobs/complaintModel';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'expo-router';

export default function MechanicTaskList() {
  const { userProfile, logout } = useAuth();
  const [tasks, setTasks] = useState<{ order: WorkOrder, complaint: Complaint | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!userProfile) return;
    
    setLoading(true);
    const unsubscribe = subscribeWorkOrdersByMechanic(userProfile.id!, async (orders) => {
      // Fetch complaints for the updated orders
      try {
        const tasksWithComplaints = await Promise.all(
          orders.map(async (order) => {
            const complaint = await getComplaintById(order.complaint_id);
            return { order, complaint };
          })
        );
        setTasks(tasksWithComplaints);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [userProfile]);

  const handleStartTask = (orderId: string) => {
    updateWorkOrderStatus(orderId, 'In Progress').catch(error => {
      Alert.alert('Sync Error', error.message);
    });
  };

  const handleMarkRepaired = (orderId: string) => {
    updateWorkOrderStatus(orderId, 'Completed').catch(error => {
      Alert.alert('Sync Error', error.message);
    });
  };

  if (!userProfile) return <ActivityIndicator style={styles.loader} size="large" />;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Tasks Today</Text>
        <Button title="Logout" onPress={logout} color="#e74c3c" />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={styles.subtitle}>Viewing tasks for: {userProfile.name} ({userProfile.role})</Text>
        
        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" />
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.order.id!}
            ListEmptyComponent={<Text style={styles.emptyText}>No tasks assigned yet — check with your supervisor</Text>}
            renderItem={({ item }) => (
              <View style={styles.taskCard}>
                <Text style={styles.vehicleText}>Job ID: {item.order.repair_job_id}</Text>
                <Text style={styles.complaintDesc}>{item.complaint?.description || '[No description]'}</Text>
                <Text style={styles.statusText}>Status: {item.order.status}</Text>
                
                <View style={styles.actionRow}>
                  <Button 
                    title="Start" 
                    color="#208AEF"
                    disabled={item.order.status !== 'Pending'} 
                    onPress={() => handleStartTask(item.order.id!)} 
                  />
                  <Button 
                    title="Mark Repaired" 
                    color="#27ae60"
                    disabled={item.order.status !== 'In Progress'} 
                    onPress={() => handleMarkRepaired(item.order.id!)} 
                  />
                </View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 12 },
  selectorContainer: { marginTop: 20 },
  mechBadge: { padding: 16, backgroundColor: '#f0f4f8', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#d0e0e3' },
  mechBadgeText: { fontSize: 16, color: '#005fcc', fontWeight: 'bold' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  emptyText: { fontStyle: 'italic', color: '#666', textAlign: 'center', marginTop: 40 },
  taskCard: { padding: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  vehicleText: { fontSize: 14, color: '#666', marginBottom: 4 },
  complaintDesc: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  statusText: { fontSize: 14, color: '#EF8A20', marginBottom: 16, fontWeight: '600' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around' }
});
