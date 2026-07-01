import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { getRepairJobs, RepairJob } from './repairJobModel';
import { useRouter } from 'expo-router';

export default function RepairJobList() {
  const [jobs, setJobs] = useState<RepairJob[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getRepairJobs();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <ActivityIndicator style={styles.loader} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Repair Jobs</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="+ New Job" onPress={() => router.push('/repair-jobs/new')} />
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.jobText}>Job for Vehicle ID: {item.vehicle_id}</Text>
            <Text style={styles.statusText}>Status: {item.status}</Text>
            <Button title="View Job" onPress={() => router.push(`/repair-jobs/${item.id}`)} />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No active jobs — tap + to start one</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  buttonContainer: { marginBottom: 16 },
  card: { padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8, marginVertical: 8, borderWidth: 1, borderColor: '#eee' },
  jobText: { fontSize: 16, fontWeight: 'bold' },
  statusText: { fontSize: 14, color: '#555', marginBottom: 8 },
  empty: { textAlign: 'center', marginTop: 24, fontStyle: 'italic', color: '#888' }
});
