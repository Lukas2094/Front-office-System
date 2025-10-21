'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import UserActions from '@/components/UserForm/UserActions';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/navigation';
import NewUserModal from '@/components/UserForm/NewUserModal';
import { getSocket } from '@/lib/websocket';

export default function ViewUsers({usuario , cargo }: any) {
    const [usuarios, setUsuarios] = useState<any[]>(usuario);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const [cargos, setCargos] = useState(cargo);


    
    const token =
        typeof window !== 'undefined'
            ? document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1]
            : '';

    useEffect(() => {
        if (!token) router.push('/login');
    }, [token, router]);

    useEffect(() => {
        const socket = getSocket('/usuarios');

        socket.on('usuario:created', (user) => setUsuarios((prev) => [...prev, user]));
        socket.on('usuario:updated', (user) =>
            setUsuarios((prev) => prev.map((u) => (u.id === user.id ? user : u)))
        );
        socket.on('usuario:deleted', ({ id }) =>
            setUsuarios((prev) => prev.filter((u) => u.id !== id))
        );
        socket.on('usuario:activated', ({ id, usuario }) =>
            setUsuarios((prev) => prev.map((u) => (u.id === id ? usuario : u)))
        );
        socket.on('usuario:deactivated', ({ id, usuario }) =>
            setUsuarios((prev) => prev.map((u) => (u.id === id ? usuario : u)))
        );

        return () => {
            socket.off('usuario:created');
            socket.off('usuario:updated');
            socket.off('usuario:deleted');
            socket.off('usuario:activated');
            socket.off('usuario:deactivated');
        };
    }, []);



    return (
        <Layout title="Usuários">
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-5xl mx-auto bg-white shadow-lg rounded p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
                        >
                            Novo Usuário
                        </button>
                    </div>

                    {usuarios.length === 0 ? (
                        <p className="text-gray-600">Nenhum usuário encontrado.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 border text-left">ID</th>
                                        <th className="px-4 py-2 border text-left">Nome</th>
                                        <th className="px-4 py-2 border text-left">Cargo</th>
                                        <th className="px-4 py-2 border text-center">Ativo</th>
                                        <th className="px-4 py-2 border text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 border">{user.id}</td>
                                            <td className="px-4 py-2 border">{user.username}</td>
                                            <td className="px-4 py-2 border">
                                                {user.cargo?.nome || '-'}
                                            </td>
                                            <td className="px-4 py-2 border text-center">
                                                {user.ativo ? (
                                                    <span className="text-green-600 font-semibold">Sim</span>
                                                ) : (
                                                    <span className="text-red-500 font-semibold">Não</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border text-center">
                                                <UserActions id={user.id} cargos={cargo}  />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de criação via WebSocket */}
            <NewUserModal
                cargos={cargos}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </Layout>
    );
}
