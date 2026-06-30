import { useLocalSearchParams } from 'expo-router';
import CustomerProfile from '../../features/customers/CustomerProfile';

export default function CustomerProfileScreen() {
  const { id } = useLocalSearchParams();
  return <CustomerProfile customerId={id as string} />;
}
