'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import UserActions from '@/components/UserForm/UserActions';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/navigation';
import NewUserModal from '@/components/UserForm/NewUserModal';
import { getSocket } from '@/lib/websocket';
import { FiPlusCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function ViewUsers({ usuario, cargo }: any) {
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

        socket.on('usuario:get-all', (data) => setUsuarios(data));
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
                <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-2">
                            👥 Usuários
                        </h1>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow transition-all duration-200"
                        >
                            <FiPlusCircle size={20} />
                            Novo Usuário
                        </button>
                    </div>

                    {usuarios.length === 0 ? (
                        <p className="text-gray-600 text-center py-6">Nenhum usuário encontrado.</p>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full text-sm text-gray-700">
                                <thead className="bg-gray-50 text-gray-800 text-left sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 border-b font-medium">ID</th>
                                        <th className="px-4 py-3 border-b font-medium">Nome</th>
                                        <th className="px-4 py-3 border-b font-medium">Email</th>
                                        <th className="px-4 py-3 border-b font-medium">Cargo</th>
                                        <th className="px-4 py-3 border-b text-center font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 border-b text-center font-medium">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className={`${
                                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                            } hover:bg-blue-50 transition`}
                                        >
                                            <td className="px-4 py-2 border-b">{user.id}</td>
                                            <td className="px-4 py-2 border-b font-medium text-gray-800">
                                                {user.nome}
                                            </td>
                                            <td className="px-4 py-2 border-b">{user.email}</td>
                                            <td className="px-4 py-2 border-b">
                                                {user.cargo?.nome || (
                                                    <span className="text-gray-400 italic">
                                                        Não definido
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border-b text-center">
                                                {user.ativo ? (
                                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                                        <FiCheckCircle size={14} />
                                                        Ativo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                                                        <FiXCircle size={14} />
                                                        Inativo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border-b text-center">
                                                <UserActions id={user.id} cargos={cargo} />
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
