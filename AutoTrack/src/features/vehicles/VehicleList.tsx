import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createVehicle } from './vehicleModel';
import { useRouter } from 'expo-router';

interface VehicleListProps {
  customerId?: string; // If provided, adds a vehicle to this customer
}

export default function VehicleList({ customerId }: VehicleListProps) {
  const [plate, setPlate] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vin, setVin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const router = useRouter();

  const handleAddVehicle = async () => {
    if (!customerId) {
      Alert.alert('Error', 'Customer ID is required to add a vehicle.');
      return;
    }

    try {
      setErrorMsg('');
      await createVehicle({
        customer_id: customerId,
        plate,
        make,
        model,
        year,
        vin
      });
      setPlate('');
      setMake('');
      setModel('');
      setYear('');
      setVin('');
      Alert.alert('Success', 'Vehicle added successfully!');
      router.back();
    } catch (error: any) {
      setErrorMsg(error.message);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Vehicle</Text>
      
      <TextInput style={styles.input} placeholder="Plate Number" value={plate} onChangeText={setPlate} />
      <TextInput style={styles.input} placeholder="Make (e.g. Toyota)" value={make} onChangeText={setMake} />
      <TextInput style={styles.input} placeholder="Model (e.g. Camry)" value={model} onChangeText={setModel} />
      <TextInput style={styles.input} placeholder="Year" value={year} onChangeText={setYear} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="VIN (optional)" value={vin} onChangeText={setVin} />
      
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      
      <Button title="Save Vehicle" onPress={handleAddVehicle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12, borderRadius: 4 },
  error: { color: 'red', marginBottom: 8 }
});
