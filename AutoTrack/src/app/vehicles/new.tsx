import { useLocalSearchParams } from 'expo-router';
import VehicleList from '../../features/vehicles/VehicleList';

export default function NewVehicleScreen() {
  const { customerId } = useLocalSearchParams();
  return <VehicleList customerId={customerId as string} />;
}
