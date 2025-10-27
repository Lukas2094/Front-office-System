// app/ordens-servico/page.tsx
import Layout from '@/components/layout/Layout';
import OrdemServicoList from '@/components/OrdemServico/OrdemServicoList';
import api from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function OrdensServicoPage() {
  let ordens = [];

  try {
    const res = await api.get('/ordens-servico');
    ordens = res.data;
  } catch (error) {
    console.error('Erro ao carregar ordens:', error);
  }

  return (
    <Layout title="Ordens de Serviço">
        <OrdemServicoList initialData={ordens} />
    </Layout>
  )
  
  
}
