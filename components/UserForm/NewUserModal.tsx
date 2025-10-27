'use client';

import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/websocket';
import { FiX, FiUser, FiUserCheck, FiMail, FiLock, FiBriefcase, FiSave, FiCheckCircle } from 'react-icons/fi';

interface Cargo {
    id: number;
    nome: string;
}

interface NewUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    cargos: Cargo[] | null;
}

export default function NewUserModal({ isOpen, onClose, cargos }: NewUserModalProps) {
    const [formData, setFormData] = useState({
        nome: '',
        username: '',
        senha: '',
        email: '',
        cargo_id: '',
        ativo: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        const s = getSocket('/usuarios');
        setSocket(s);

        // Listeners
        s.on('usuario:create:success', (data) => {
            // console.log('✅ Usuário criado via WebSocket:', data);
            onClose();
            setLoading(false);
        });

        s.on('usuario:create:error', (err) => {
            console.error('❌ Erro ao criar via WebSocket:', err);
            setError(err?.error || 'Erro ao criar usuário');
            setLoading(false);
        });

        return () => {
            s.off('usuario:create:success');
            s.off('usuario:create:error');
        };
    }, [onClose]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.currentTarget;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === 'checkbox'
                    ? (e.currentTarget as HTMLInputElement).checked
                    : name === 'cargo_id'
                        ? Number(value)
                        : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!socket) {
            setError('WebSocket não conectado');
            setLoading(false);
            return;
        }

        // 🔥 Envia o evento via WebSocket
        socket.emit('usuario:create', formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <FiUser className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Novo Usuário</h2>
                                <p className="text-blue-100 text-sm">Cadastre um novo usuário no sistema</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        >
                            <FiX size={18} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Nome */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiUser className="inline w-4 h-4 mr-1 text-gray-400" />
                            Nome Completo *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                placeholder="Digite o nome completo"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiUser className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiUserCheck className="inline w-4 h-4 mr-1 text-gray-400" />
                            Nome de Usuário *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Digite o username para login"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiUserCheck className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiMail className="inline w-4 h-4 mr-1 text-gray-400" />
                            Email *
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Digite um email válido"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiMail className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Senha */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiLock className="inline w-4 h-4 mr-1 text-gray-400" />
                            Senha *
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                name="senha"
                                value={formData.senha}
                                onChange={handleChange}
                                placeholder="Digite uma senha segura"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiLock className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Cargo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiBriefcase className="inline w-4 h-4 mr-1 text-gray-400" />
                            Cargo *
                        </label>
                        <div className="relative">
                            <select
                                name="cargo_id"
                                value={formData.cargo_id}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                            >
                                <option value="">Selecione um cargo</option>
                                {cargos?.map((cargo) => (
                                    <option key={cargo.id} value={cargo.id}>
                                        {cargo.nome}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiBriefcase className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Status Ativo */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                            <FiCheckCircle className="h-5 w-5 text-green-600 mr-3" />
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Usuário ativo
                                </label>
                                <p className="text-xs text-gray-500">Usuário poderá acessar o sistema</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="ativo"
                                checked={formData.ativo}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Botões */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-medium cursor-pointer flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Criando...
                                </>
                            ) : (
                                <>
                                    <FiSave className="w-4 h-4" />
                                    Criar Usuário
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}