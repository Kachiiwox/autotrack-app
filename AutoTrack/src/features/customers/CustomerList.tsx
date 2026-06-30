import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { getCustomers, createCustomer, Customer } from './customerModel';
import { useRouter } from 'expo-router';

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const router = useRouter();

  const fetchCustomers = async () => {
    const data = await getCustomers(search);
    setCustomers(data);
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleAddCustomer = async () => {
    try {
      setErrorMsg('');
      await createCustomer({ name, phone, isWalkIn });
      setName('');
      setPhone('');
      fetchCustomers();
      // Use Alert for UI feedback, which also works on web as a standard alert
      Alert.alert('Success', 'Customer added successfully!');
    } catch (error: any) {
      setErrorMsg(error.message);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customers</Text>
      
      <View style={styles.addSection}>
        <Text style={styles.subtitle}>Add New Customer</Text>
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
        <Button title="Add Customer" onPress={handleAddCustomer} />
      </View>

      <View style={styles.listSection}>
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search by name or phone..." 
          value={search} 
          onChangeText={setSearch} 
        />
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => (
            <View style={styles.customerCard}>
              <Text style={styles.customerName}>{item.name}</Text>
              <Text>{item.phone || 'Walk-in'}</Text>
              <Button title="View Profile" onPress={() => router.push(`/customers/${item.id}`)} />
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  addSection: { marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8, borderRadius: 4 },
  error: { color: 'red', marginBottom: 8 },
  listSection: { flex: 1 },
  searchInput: { borderWidth: 1, borderColor: '#aaa', padding: 8, marginBottom: 16, borderRadius: 4 },
  customerCard: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customerName: { fontSize: 16, fontWeight: 'bold' }
});
