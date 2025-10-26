import api from '@/lib/api';
import ClientesForm from '@/components/Clientes/ClientesForm';

export const revalidate = 0; // força atualização sempre

export default async function ClientesPage() {
  const res = await api.get('/clientes');
  const clientes = res.data;

  return <ClientesForm initialData={clientes} />;
}
