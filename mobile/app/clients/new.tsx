import { useRouter } from 'expo-router';
import { ClientForm } from '../../src/components/forms/ClientForm';

export default function NewClientScreen() {
  const router = useRouter();
  return <ClientForm onSaved={(id) => router.push(`/clients/${id}`)} />;
}
