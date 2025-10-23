// app/usuarios/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ViewUsers from '@/components/UserForm/ViewUsers';
import api from '@/lib/api';

export default async function UsuariosPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        redirect('/login');
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
            <ViewUsers 
                usuario={usersRes.data} 
                cargo={cargosRes.data} 
            />
        );
    } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        
        // Se for erro 401, redireciona para login
        if (error.response?.status === 401) {
            redirect('/login');
        }
        
        return (
            <div className="p-6">
                <div className="text-red-500 mb-4">
                    Erro ao carregar os dados: {error.response?.data?.message || error.message}
                </div>
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }
}