'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { FiUser, FiMail, FiLock, FiBriefcase, FiCheck, FiX, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';

interface Cargo {
    id: number;
    nome: string;
}

interface User {
    id: number;
    nome: string;
    email: string;
    cargo_id: number;
    ativo: boolean;
}

interface EditUserFormProps {
    user: User;
    cargos: Cargo[];
}

export default function EditUserForm({ user, cargos }: EditUserFormProps) {
    const router = useRouter();
    const [form, setForm] = useState<{
        nome: string;
        email: string;
        senha?: string; // Make senha optional
        cargo_id: number;
        ativo: boolean;
    }>({
        nome: user.nome || '',
        email: user.email || '',
        senha: '',
        cargo_id: Number(user.cargo_id) || 0,
        ativo: user.ativo ?? true,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Remove senha se estiver vazia
            const submitData = { ...form };
            if (!submitData.senha) {
                delete submitData.senha;
            }

            const res = await api.patch(`/usuarios/${user.id}`, submitData);
            if (res.status === 200) {
                setSuccess('Usuário atualizado com sucesso!');
                setTimeout(() => router.push('/usuarios'), 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao atualizar usuário.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                {/* Card Principal */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <FiUser className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Editar Usuário</h1>
                                    <p className="text-blue-100 text-sm mt-1">
                                        ID: {user.id} • {user.ativo ? 'Ativo' : 'Inativo'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/usuarios')}
                                className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Alertas */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <FiX className="w-4 h-4 text-red-600" />
                                </div>
                                <p className="text-red-700 text-sm font-medium flex-1">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <FiCheck className="w-4 h-4 text-green-600" />
                                </div>
                                <p className="text-green-700 text-sm font-medium flex-1">{success}</p>
                            </div>
                        )}

                        {/* Nome */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <FiUser className="w-4 h-4 text-gray-500" />
                                Nome Completo *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Digite o nome completo"
                                    value={form.nome}
                                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                    required
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiUser className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <FiMail className="w-4 h-4 text-gray-500" />
                                Email *
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Digite o email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMail className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Senha */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <FiLock className="w-4 h-4 text-gray-500" />
                                Nova Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Deixe em branco para manter a atual"
                                    value={form.senha}
                                    onChange={(e) => setForm({ ...form, senha: e.target.value })}
                                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiLock className="w-5 h-5 text-gray-400" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                >
                                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Mínimo 6 caracteres. Deixe vazio para não alterar.
                            </p>
                        </div>

                        {/* Cargo */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <FiBriefcase className="w-4 h-4 text-gray-500" />
                                Cargo *
                            </label>
                            <div className="relative">
                                <select
                                    value={form.cargo_id}
                                    onChange={(e) => setForm({ ...form, cargo_id: Number(e.target.value) })}
                                    required
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white text-gray-900"
                                >
                                    <option value="">Selecione um cargo</option>
                                    {cargos.map((cargo) => (
                                        <option key={cargo.id} value={cargo.id}>
                                            {cargo.nome}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiBriefcase className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Status Ativo */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-6 rounded-full transition-colors duration-200 relative ${form.ativo ? 'bg-green-500' : 'bg-gray-300'
                                        }`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${form.ativo ? 'left-5' : 'left-1'
                                            }`} />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold text-gray-800 block">
                                            Usuário Ativo
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {form.ativo ? 'Usuário pode acessar o sistema' : 'Usuário bloqueado'}
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={form.ativo}
                                    onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                                    className="sr-only"
                                />
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${form.ativo
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                    {form.ativo ? 'ATIVO' : 'INATIVO'}
                                </div>
                            </label>
                        </div>

                        {/* Botões */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => router.push('/usuarios')}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 font-semibold cursor-pointer hover:shadow-lg transform hover:scale-105 active:scale-95"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-200 font-semibold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Atualizando...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="w-4 h-4" />
                                        <span>Atualizar Usuário</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Informações Adicionais */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        ⚡ Alterações serão aplicadas imediatamente
                    </p>
                </div>
            </div>
        </div>
    );
}