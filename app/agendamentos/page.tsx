import { cookies } from "next/headers";
import AgendamentosList from "@/components/Agendamentos/agendaList";
import Layout from "@/components/layout/Layout";
import api from "@/lib/api";

export default async function AgendamentosPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    const [agendaRes, clientesRes , funcionariosRes] = await Promise.all([
        api.get("/agendamentos", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/clientes", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/funcionarios", { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    console.log(funcionariosRes.data);
    

    return (
        <Layout title="Agendamentos">
            <AgendamentosList
                initialAgendamentos={agendaRes.data}
                initialClientes={clientesRes.data}
                initialFuncionarios={funcionariosRes.data}
            />
        </Layout>
    );
}
