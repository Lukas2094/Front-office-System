import api from '@/lib/api';
import UserForm from '@/components/UserForm/UserForm';

export const dynamic = 'force-dynamic'; // Força renderização SSR

export default async function NewUserPage() {
    // SSR - busca os cargos diretamente do backend
    let cargos: any[] = [];
    try {
        const res = await api.get('/cargos');
        cargos = res.data;
    } catch (error) {
        console.error('Erro ao carregar cargos:', error);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <UserForm cargos={cargos} />
        </div>
    );
}
