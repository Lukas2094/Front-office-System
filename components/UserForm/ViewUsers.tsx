'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import UserActions from '@/components/UserForm/UserActions';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/navigation';
import NewUserModal from '@/components/UserForm/NewUserModal';
import { getSocket } from '@/lib/websocket';
import { FiPlusCircle, FiCheckCircle, FiXCircle, FiUsers, FiSearch, FiUser, FiMail, FiBriefcase } from 'react-icons/fi';

export default function ViewUsers({ usuario, cargo }: any) {
    const [usuarios, setUsuarios] = useState<any[]>(usuario);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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

    // Filtrar usuários baseado no termo de busca
    const filteredUsuarios = usuarios.filter(user =>
        user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.cargo?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCargoColor = (cargoNome: string) => {
        const colors: { [key: string]: string } = {
            'Proprietário/Mecânico': 'bg-orange-100 text-orange-800 border-orange-200',
            'Recepcionista': 'bg-blue-100 text-blue-800 border-blue-200',
            'Mecânico Funcionário': 'bg-green-100 text-green-800 border-green-200',
        };
        return colors[cargoNome] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <Layout title="Usuários">
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                                    <FiUsers className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">Gestão de Usuários</h1>
                                    <p className="text-gray-600 text-sm">Gerencie os usuários e permissões do sistema</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Barra de Busca */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiSearch className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome, email ou cargo..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full sm:w-64"
                                    />
                                </div>

                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center justify-center cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-medium shadow-sm"
                                >
                                    <FiPlusCircle className="mr-2" size={16} />
                                    Novo Usuário
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabela */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Usuário
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Cargo
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsuarios.length > 0 ? (
                                        filteredUsuarios.map((user, index) => (
                                            <tr 
                                                key={user.id} 
                                                className={`hover:bg-gray-50 transition-colors duration-150 ${
                                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                                }`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-semibold text-gray-900">#{user.id}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <FiUser className="w-4 h-4 text-gray-400 mr-3" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {user.nome}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <FiMail className="w-4 h-4 text-gray-400 mr-3" />
                                                        <span className="text-sm text-gray-700">
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <FiBriefcase className="w-4 h-4 text-gray-400 mr-3" />
                                                        {user.cargo?.nome ? (
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCargoColor(user.cargo.nome)}`}>
                                                                {user.cargo.nome}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400 italic">
                                                                Não definido
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {user.ativo ? (
                                                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
                                                            <FiCheckCircle size={14} />
                                                            Ativo
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium border border-red-200">
                                                            <FiXCircle size={14} />
                                                            Inativo
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center justify-center">
                                                        <UserActions id={user.id} cargos={cargo} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <FiUsers className="h-12 w-12 text-gray-300 mb-3" />
                                                    <p className="text-lg font-medium text-gray-400 mb-1">
                                                        {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                                                    </p>
                                                    {searchTerm ? (
                                                        <p className="text-sm text-gray-500">
                                                            Tente ajustar os termos da busca
                                                        </p>
                                                    ) : (
                                                        <button
                                                            onClick={() => setIsModalOpen(true)}
                                                            className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                                                        >
                                                            Cadastrar primeiro usuário
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer com contador */}
                        {filteredUsuarios.length > 0 && (
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>
                                        {filteredUsuarios.length} de {usuarios.length} usuário(s)
                                        {searchTerm && ' encontrado(s)'}
                                    </span>
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Limpar busca
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
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