import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Button } from 'react-native';
import { getAllMechanics, Mechanic, seedMechanicsIfEmpty } from '../mechanics/mechanicModel';
import { getWorkOrdersByMechanic, updateWorkOrderStatus, WorkOrder } from './workOrderModel';
import { getComplaintById, Complaint } from '../repairJobs/complaintModel';

export default function MechanicTaskList() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [tasks, setTasks] = useState<{ order: WorkOrder, complaint: Complaint | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await seedMechanicsIfEmpty();
      const mechs = await getAllMechanics();
      setMechanics(mechs);
      setLoading(false);
    };
    init();
  }, []);

  const loadTasks = async (mechanicId: string) => {
    setLoading(true);
    try {
      const orders = await getWorkOrdersByMechanic(mechanicId);
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
  };

  useEffect(() => {
    if (selectedMechanic) {
      loadTasks(selectedMechanic.id!);
    }
  }, [selectedMechanic]);

  const handleStartTask = async (orderId: string) => {
    try {
      await updateWorkOrderStatus(orderId, 'In Progress');
      if (selectedMechanic) loadTasks(selectedMechanic.id!);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleMarkRepaired = async (orderId: string) => {
    try {
      await updateWorkOrderStatus(orderId, 'Completed');
      if (selectedMechanic) loadTasks(selectedMechanic.id!);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading && !selectedMechanic) return <ActivityIndicator style={styles.loader} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Tasks Today</Text>
      
      {!selectedMechanic ? (
        <View style={styles.selectorContainer}>
          <Text style={styles.subtitle}>Select Mechanic (Simulating Login):</Text>
          {mechanics.map(m => (
            <TouchableOpacity key={m.id} style={styles.mechBadge} onPress={() => setSelectedMechanic(m)}>
              <Text style={styles.mechBadgeText}>{m.name} ({m.specialties.join(', ')})</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.headerRow}>
            <Text style={styles.subtitle}>Viewing tasks for: {selectedMechanic.name}</Text>
            <Button title="Switch Mechanic" onPress={() => { setSelectedMechanic(null); setTasks([]); }} color="#999" />
          </View>
          
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
      )}
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
