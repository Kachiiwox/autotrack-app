import { useLocalSearchParams } from 'expo-router';
import VehicleDetails from '../../features/vehicles/VehicleDetails';

export default function VehicleDetailsScreen() {
  const { id } = useLocalSearchParams();
  return <VehicleDetails vehicleId={id as string} />;
}
