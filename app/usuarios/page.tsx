// app/usuarios/page.tsx
import { cookies } from 'next/headers';
import ViewUsers from '@/components/UserForm/ViewUsers';
import api from '@/lib/api';

export default async function UsuariosPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        // Redireciona do lado do servidor
        return (
            <meta httpEquiv="refresh" content="0;url=/login" />
        );
    }

    try {
        const [usersRes, cargosRes] = await Promise.all([
            api.get('/usuarios', {
                headers: { Authorization: `Bearer ${token}` },
            }),
            api.get('/cargos', {
                headers: { Authorization: `Bearer ${token}` },
            }),
        ]);

        return (
            <ViewUsers usuario={usersRes.data} cargo={cargosRes.data} />
        );
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return (
            <div className="p-6 text-red-500">
                Erro ao carregar os dados de usuários ou cargos.
            </div>
        );
    }
}
