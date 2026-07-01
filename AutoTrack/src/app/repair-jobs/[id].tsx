import { useLocalSearchParams } from 'expo-router';
import RepairJobDetail from '../../features/repairJobs/RepairJobDetail';

export default function RepairJobDetailScreen() {
  const { id } = useLocalSearchParams();
  return <RepairJobDetail jobId={id as string} />;
}
