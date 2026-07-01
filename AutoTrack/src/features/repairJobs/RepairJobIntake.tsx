import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { getAllVehicles, Vehicle } from '../vehicles/vehicleModel';
import { createRepairJob } from './repairJobModel';
import { Complaint } from './complaintModel';
import { useRouter } from 'expo-router';

export default function RepairJobIntake() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  
  const [complaints, setComplaints] = useState<Partial<Complaint>[]>([{ description: '', status: 'Open' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getAllVehicles().then(setVehicles).catch(e => console.error("Error loading vehicles", e));
  }, []);

  const handleAddComplaint = () => {
    setComplaints([...complaints, { description: '', status: 'Open' }]);
  };

  const handleUpdateComplaint = (index: number, field: keyof Complaint, value: string) => {
    const updated = [...complaints];
    updated[index] = { ...updated[index], [field]: value };
    setComplaints(updated);
  };

  const handleMockVoiceNote = (index: number) => {
    handleUpdateComplaint(index, 'voice_note_url', 'mock_audio_url.mp3');
    Alert.alert('Voice Note', 'Mock voice note recorded.');
  };

  const handleMockPhoto = (index: number) => {
    handleUpdateComplaint(index, 'photo_url', 'mock_photo_url.jpg');
    Alert.alert('Photo', 'Mock photo captured.');
  };

  const handleSubmit = async () => {
    if (!selectedVehicle) {
      Alert.alert('Validation Error', 'Please select a vehicle.');
      return;
    }
    
    // Filter out completely empty complaints
    const validComplaints = complaints.filter(c => c.description?.trim() !== '' || c.voice_note_url || c.photo_url);
    if (validComplaints.length === 0) {
      Alert.alert('Validation Error', 'At least one valid complaint is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createRepairJob(selectedVehicle, validComplaints as any);
      Alert.alert('Success', 'Repair Job created successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedVehicle) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Step 1: Select Vehicle</Text>
        <ScrollView>
          {vehicles.map(v => (
            <TouchableOpacity key={v.id} style={styles.vehicleCard} onPress={() => setSelectedVehicle(v.id!)}>
              <Text style={styles.vehicleText}>{v.make} {v.model} - {v.plate}</Text>
            </TouchableOpacity>
          ))}
          {vehicles.length === 0 && <Text style={styles.empty}>No vehicles found. Add one in the Customers module first.</Text>}
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.title}>Step 2: Record Complaints</Text>
      <Text style={styles.subtitle}>Selected Vehicle ID: {selectedVehicle}</Text>

      {complaints.map((complaint, index) => (
        <View key={index} style={styles.complaintCard}>
          <Text style={styles.cardTitle}>Complaint {index + 1}</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Short description (e.g., Stiff steering)" 
            value={complaint.description} 
            onChangeText={(val) => handleUpdateComplaint(index, 'description', val)}
            multiline
          />
          
          <View style={styles.quickTags}>
            {['Noise', 'Leak', 'Electrical'].map(tag => (
              <TouchableOpacity 
                key={tag} 
                style={styles.tag} 
                onPress={() => handleUpdateComplaint(index, 'description', complaint.description ? `${complaint.description} [${tag}]` : `[${tag}]`)}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.mediaButtons}>
            <Button title={complaint.voice_note_url ? "Voice Note (1)" : "Record Voice Note"} onPress={() => handleMockVoiceNote(index)} />
            <Button title={complaint.photo_url ? "Photo (1)" : "Take Photo"} onPress={() => handleMockPhoto(index)} />
          </View>
        </View>
      ))}

      <View style={styles.actions}>
        <Button title="+ Add Another Complaint" onPress={handleAddComplaint} color="#666" />
        <View style={{ height: 16 }} />
        <Button title="Save & Continue" onPress={handleSubmit} disabled={isSubmitting} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 24 },
  vehicleCard: { padding: 16, backgroundColor: '#e0e0e0', marginBottom: 8, borderRadius: 8 },
  vehicleText: { fontSize: 18 },
  empty: { fontStyle: 'italic', marginTop: 20 },
  complaintCard: { padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#ddd' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4, marginBottom: 12, minHeight: 60, textAlignVertical: 'top' },
  quickTags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  tag: { backgroundColor: '#d0ebff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  tagText: { color: '#005fcc', fontSize: 14 },
  mediaButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  actions: { marginTop: 16 }
});
