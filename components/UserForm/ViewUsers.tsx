'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import UserActions from '@/components/UserForm/UserActions';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/navigation';
import NewUserModal from '@/components/UserForm/NewUserModal';
import { getSocket } from '@/lib/websocket';
import { FiPlusCircle, FiCheckCircle, FiXCircle, FiUsers, FiSearch, FiUser, FiMail, FiBriefcase, FiFilter, FiUserPlus } from 'react-icons/fi';

export default function ViewUsers({ usuario, cargo }: any) {
    const [usuarios, setUsuarios] = useState<any[]>(usuario);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');
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

    // Filtrar usuários baseado no termo de busca e status
    const filteredUsuarios = usuarios.filter(user => {
        const matchesSearch =
            user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.cargo?.nome?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'todos' ||
            (statusFilter === 'ativo' && user.ativo) ||
            (statusFilter === 'inativo' && !user.ativo);

        return matchesSearch && matchesStatus;
    });

    const getCargoColor = (cargoNome: string) => {
        const colors: { [key: string]: string } = {
            'Proprietário/Mecânico': 'bg-orange-100 text-orange-800 border border-orange-200',
            'Recepcionista': 'bg-blue-100 text-blue-800 border border-blue-200',
            'Mecânico Funcionário': 'bg-green-100 text-green-800 border border-green-200',
            'Administrador': 'bg-purple-100 text-purple-800 border border-purple-200',
            'Gerente': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
        };
        return colors[cargoNome] || 'bg-gray-100 text-gray-800 border border-gray-200';
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('todos');
    };

    return (
        <Layout title="Usuários">
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-3 sm:p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                                    <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
                                    <p className="text-gray-600 text-sm sm:text-base mt-1">Gerencie usuários e permissões do sistema</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center cursor-pointer justify-center bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                            >
                                <FiUserPlus className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Novo Usuário</span>
                                <span className="sm:hidden">Novo</span>
                            </button>
                        </div>

                        {/* Filtros */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 sm:mt-8">
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
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                                />
                            </div>

                            {/* Filtro de Status */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiFilter className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as any)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm appearance-none"
                                    >
                                        <option value="todos">Todos os status</option>
                                        <option value="ativo">Apenas ativos</option>
                                        <option value="inativo">Apenas inativos</option>
                                    </select>
                                </div>

                                {(searchTerm || statusFilter !== 'todos') && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-200 font-medium whitespace-nowrap"
                                    >
                                        Limpar
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
                            {[
                                { status: 'todos', label: 'Total', count: usuarios.length, color: 'bg-gray-500' },
                                { status: 'ativo', label: 'Ativos', count: usuarios.filter(u => u.ativo).length, color: 'bg-green-500' },
                                { status: 'inativo', label: 'Inativos', count: usuarios.filter(u => !u.ativo).length, color: 'bg-red-500' },
                                { status: 'cargos', label: 'Cargos', count: new Set(usuarios.map(u => u.cargo?.nome)).size, color: 'bg-blue-500' },
                            ].map((stat) => (
                                <div
                                    key={stat.status}
                                    className={`bg-white border-2 ${statusFilter === stat.status ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                                        } rounded-xl p-3 text-center cursor-pointer transition-all duration-200 hover:shadow-md`}
                                    onClick={() => stat.status !== 'cargos' && setStatusFilter(stat.status as any)}
                                >
                                    <div className={`w-3 h-3 ${stat.color} rounded-full mx-auto mb-2`}></div>
                                    <div className="text-lg sm:text-xl font-bold text-gray-900">{stat.count}</div>
                                    <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tabela */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Usuário
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                                            Contato
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Cargo
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                                            Status
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200/60">
                                    {filteredUsuarios.length > 0 ? (
                                        filteredUsuarios.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200"
                                            >
                                                {/* Usuário */}
                                                <td className="px-4 sm:px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                                                                <FiUser className="w-5 h-5 text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-sm font-semibold text-gray-900 truncate">
                                                                    {user.nome}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                                                    ID: {user.id}
                                                                </span>
                                                            </div>
                                                            <div className="sm:hidden mt-2">
                                                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                                    <FiMail className="w-3 h-3" />
                                                                    <span className="truncate">{user.email}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contato (oculta em mobile) */}
                                                <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                            <FiMail className="w-4 h-4 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                                                            <div className="text-xs text-gray-500">Contato principal</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Cargo */}
                                                <td className="px-4 sm:px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                                            <FiBriefcase className="w-4 h-4 text-orange-600" />
                                                        </div>
                                                        <div>
                                                            {user.cargo?.nome ? (
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCargoColor(user.cargo.nome)}`}>
                                                                    {user.cargo.nome}
                                                                </span>
                                                            ) : (
                                                                <span className="text-sm text-gray-400 italic">
                                                                    Não definido
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Status (oculta em mobile pequeno) */}
                                                <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                                    {user.ativo ? (
                                                        <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-xl text-sm font-medium border border-green-200">
                                                            <FiCheckCircle size={16} />
                                                            <span>Ativo</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-xl text-sm font-medium border border-red-200">
                                                            <FiXCircle size={16} />
                                                            <span>Inativo</span>
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Ações */}
                                                <td className="px-4 sm:px-6 py-4">
                                                    <div className="flex items-center justify-center">
                                                        <UserActions id={user.id} cargos={cargo} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 sm:px-6 py-12 sm:py-16 text-center">
                                                <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <FiUsers className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
                                                    </div>
                                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                                                        {searchTerm || statusFilter !== 'todos' ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                                                    </h3>
                                                    <p className="text-gray-500 text-sm sm:text-base mb-4 text-center">
                                                        {searchTerm || statusFilter !== 'todos'
                                                            ? 'Tente ajustar os filtros ou termos da busca.'
                                                            : 'Comece cadastrando o primeiro usuário do sistema.'
                                                        }
                                                    </p>
                                                    {(searchTerm || statusFilter !== 'todos') ? (
                                                        <button
                                                            onClick={clearFilters}
                                                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 font-medium"
                                                        >
                                                            Limpar filtros
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setIsModalOpen(true)}
                                                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
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
                            <div className="px-4 sm:px-6 py-3 bg-gray-50/80 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
                                    <span className="font-medium">
                                        {filteredUsuarios.length} de {usuarios.length} usuário(s)
                                        {searchTerm && ' encontrado(s)'}
                                        {statusFilter !== 'todos' && ` com status "${statusFilter}"`}
                                    </span>
                                    {(searchTerm || statusFilter !== 'todos') && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 mt-1 sm:mt-0"
                                        >
                                            <FiFilter className="w-3 h-3" />
                                            <span>Limpar filtros</span>
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