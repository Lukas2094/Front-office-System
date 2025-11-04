'use client';

import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/websocket';
import { FiX, FiUser, FiUserCheck, FiMail, FiLock, FiBriefcase, FiSave, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '@/lib/api';

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
    const [showPassword, setShowPassword] = useState(false);
    const [adminExists, setAdminExists] = useState<boolean>(false);

    useEffect(() => {
        if (!isOpen) return;

        const checkAdminExists = async () => {
            try {
                const response = await api.get('/usuarios/check/admin-exists');
                const data = await response.data;
                setAdminExists(data.hasAdmin);
            } catch (error) {
                console.error('Erro ao verificar administrador:', error);
                setAdminExists(false);
            }
        };

        checkAdminExists();
    }, [isOpen]);

    useEffect(() => {
        const s = getSocket('/usuarios');
        setSocket(s);

        // Listeners
        s.on('usuario:create:success', (data) => {
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

        // Verificação do cargo admin
        if (adminExists && Number(formData.cargo_id) === 1) {
            setError('Já existe um usuário administrador no sistema. Não é possível criar outro.');
            setLoading(false);
            return;
        }

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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 sm:p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <FiUser className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold">Novo Usuário</h2>
                                <p className="text-blue-100 text-xs sm:text-sm">Cadastre um novo usuário no sistema</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105"
                        >
                            <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        {/* Alertas */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <FiX className="w-4 h-4 text-red-600" />
                                </div>
                                <p className="text-red-700 text-sm font-medium flex-1">{error}</p>
                            </div>
                        )}

                        {/* Grid de Campos */}
                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            {/* Nome */}
                            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FiUser className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span>Nome Completo *</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="nome"
                                        value={formData.nome}
                                        onChange={handleChange}
                                        placeholder="Digite o nome completo"
                                        required
                                        className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 font-medium"
                                    />
                                </div>
                            </div>

                            {/* Username */}
                            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <FiUserCheck className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span>Nome de Usuário *</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Digite o username para login"
                                        required
                                        className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 font-medium"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Será usado para fazer login no sistema
                                </p>
                            </div>

                            {/* Email */}
                            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <FiMail className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <span>Email *</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Digite um email válido"
                                        required
                                        className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 font-medium"
                                    />
                                </div>
                            </div>

                            {/* Senha */}
                            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <FiLock className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <span>Senha *</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="senha"
                                        value={formData.senha}
                                        onChange={handleChange}
                                        placeholder="Digite uma senha segura"
                                        required
                                        className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                    >
                                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Mínimo 6 caracteres. Use letras, números e símbolos.
                                </p>
                            </div>

                            {/* Cargo */}
                            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <FiBriefcase className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <span>Cargo *</span>
                                </label>
                                <div className="relative">
                                    <select
                                        name="cargo_id"
                                        value={formData.cargo_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white text-gray-900 font-medium"
                                    >
                                        <option value="">Selecione um cargo</option>
                                        {cargos?.map((cargo) => (
                                            <option key={cargo.id} value={cargo.id}>
                                                {cargo.nome}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Ativo */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl p-4 border border-blue-200">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${formData.ativo ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        <FiCheckCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-semibold text-gray-800">
                                            Usuário Ativo
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formData.ativo ? 'Usuário pode acessar o sistema' : 'Usuário bloqueado do sistema'}
                                        </span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="ativo"
                                        checked={formData.ativo}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className={`w-14 h-7 rounded-full transition-all duration-300 relative ${formData.ativo ? 'bg-green-500' : 'bg-gray-300'
                                        }`}>
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-lg ${formData.ativo ? 'left-8' : 'left-1'
                                            }`} />
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Botões */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 font-semibold cursor-pointer hover:shadow-lg transform hover:scale-105 active:scale-95"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-semibold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span className="hidden sm:inline">Criando Usuário...</span>
                                        <span className="sm:hidden">Criando...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="w-4 h-4" />
                                        <span>Criar Usuário</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}