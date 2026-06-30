import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Button, ActivityIndicator } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../database/firebaseConfig';
import { Customer } from './customerModel';
import { Vehicle, getVehiclesByCustomer } from '../vehicles/vehicleModel';
import { useRouter } from 'expo-router';

interface CustomerProfileProps {
  customerId: string;
}

export default function CustomerProfile({ customerId }: CustomerProfileProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'customers', customerId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setCustomer({ id: docSnap.id, ...docSnap.data() } as Customer);
        }

        const customerVehicles = await getVehiclesByCustomer(customerId);
        setVehicles(customerVehicles);
      } catch (error) {
        console.error("Error fetching customer profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) fetchData();
  }, [customerId]);

  if (loading) return <ActivityIndicator style={styles.loader} size="large" />;
  if (!customer) return <Text style={styles.errorText}>Customer not found</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{customer.name}</Text>
      <Text style={styles.subtitle}>Phone: {customer.phone || 'Walk-in'}</Text>
      {customer.notes ? <Text style={styles.notes}>Notes: {customer.notes}</Text> : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vehicles Owned</Text>
        <Button title="Add Vehicle" onPress={() => router.push(`/vehicles/new?customerId=${customerId}`)} />
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <View style={styles.vehicleCard}>
            <Text style={styles.vehicleTitle}>{item.make} {item.model} ({item.year})</Text>
            <Text>Plate: {item.plate}</Text>
            <Button title="Details" onPress={() => router.push(`/vehicles/${item.id}`)} />
          </View>
        )}
        ListEmptyComponent={<Text>No vehicles found for this customer.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center' },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 8 },
  notes: { fontSize: 14, fontStyle: 'italic', marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  vehicleCard: { padding: 16, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 8 },
  vehicleTitle: { fontSize: 16, fontWeight: 'bold' }
});
