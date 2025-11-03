import Layout from "@/components/layout/Layout";
import api from "@/lib/api";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AgendaHoje from "@/components/AgendaHome/agendaHoje";

export default async function Home() {

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const agenda = await api.get('/agendamentos/hoje', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return (
    <Layout title="Home">
      <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 to-green-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Agendamentos de Hoje</h1>
        <AgendaHoje data={agenda.data} />
      </div>
    </Layout>
  );
}
