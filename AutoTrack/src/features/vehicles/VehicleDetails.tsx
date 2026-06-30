import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, TextInput } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../database/firebaseConfig';
import { Vehicle, reassignVehicle } from './vehicleModel';

interface VehicleDetailsProps {
  vehicleId: string;
}

export default function VehicleDetails({ vehicleId }: VehicleDetailsProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [newCustomerId, setNewCustomerId] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);

  const fetchVehicle = async () => {
    try {
      const docRef = doc(db, 'vehicles', vehicleId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVehicle({ id: docSnap.id, ...docSnap.data() } as Vehicle);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) fetchVehicle();
  }, [vehicleId]);

  const handleReassign = async () => {
    if (!newCustomerId) return;
    try {
      await reassignVehicle(vehicleId, newCustomerId);
      Alert.alert('Success', 'Vehicle reassigned successfully!');
      setIsReassigning(false);
      fetchVehicle();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) return <ActivityIndicator style={styles.loader} size="large" />;
  if (!vehicle) return <Text style={styles.errorText}>Vehicle not found</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{vehicle.make} {vehicle.model}</Text>
      <Text style={styles.subtitle}>{vehicle.year} | Plate: {vehicle.plate}</Text>
      {vehicle.vin ? <Text style={styles.detail}>VIN: {vehicle.vin}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Repair History</Text>
        <Text style={styles.placeholder}>[Repair History Timeline will go here]</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mileage Log</Text>
        <Text style={styles.placeholder}>[Mileage entries will go here]</Text>
      </View>

      <View style={styles.reassignSection}>
        {isReassigning ? (
          <>
            <TextInput 
              style={styles.input} 
              placeholder="New Customer ID" 
              value={newCustomerId} 
              onChangeText={setNewCustomerId} 
            />
            <Button title="Confirm Reassignment" onPress={handleReassign} />
            <Button title="Cancel" onPress={() => setIsReassigning(false)} color="red" />
          </>
        ) : (
          <Button title="Reassign Owner" onPress={() => setIsReassigning(true)} />
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
  subtitle: { fontSize: 18, color: '#555', marginBottom: 16 },
  detail: { fontSize: 16, marginBottom: 8 },
  section: { marginVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  placeholder: { fontStyle: 'italic', color: '#888' },
  reassignSection: { marginTop: 32, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8, borderRadius: 4 },
});
