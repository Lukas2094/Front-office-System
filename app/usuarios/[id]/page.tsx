import api from '@/lib/api';
import EditUserForm from '@/components/UserForm/EditUserForm';

export const dynamic = 'force-dynamic'; // Força renderização SSR

interface Params {
    params: {
        id: string;
    };
}

export default async function EditUserPage({ params }: Params) {
    const { id } = params;
    let user: any = null;
    let cargos: any[] = [];

    try {
        const [userRes, cargosRes] = await Promise.all([
            api.get(`/usuarios/${id}`),
            api.get('/cargos'),
        ]);

        user = userRes.data;
        cargos = cargosRes.data;
    } catch (error) {
        console.error('Erro ao carregar dados do usuário ou cargos:', error);
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-700">Usuário não encontrado.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <EditUserForm user={user} cargos={cargos} />
        </div>
    );
}
