import Layout from "@/components/layout/Layout";

export default function UnauthorizedPage() {
  return (
    <Layout title="Acesso Negado">
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-3xl font-bold text-red-500">Acesso Negado</h1>
        <p className="mt-2 text-gray-400">Você não tem permissão para acessar esta página.</p>
      </div>  
    </Layout>

  );
}
