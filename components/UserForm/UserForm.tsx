'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaLock, FaUserTag, FaUserCheck, FaArrowLeft } from 'react-icons/fa';

interface Cargo {
    id: number;
    nome: string;
}

interface UserFormProps {
    cargos: Cargo[];
}

export default function UserForm({ cargos }: UserFormProps) {
    const router = useRouter();
    const [form, setForm] = useState({
        nome: '',
        username: '',
        email: '',
        senha: '',
        cargo_id: '',
        ativo: true,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                nome: form.nome.trim(),
                username: form.username.trim(),
                email: form.email.trim(),
                senha: form.senha.trim(),
                cargo_id: Number(form.cargo_id),
                ativo: form.ativo,
            };

            const res = await api.post('/usuarios/create', payload);
            if (res.status === 201) {
                router.push('/usuarios');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao cadastrar usuário.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Novo Usuário</h2>
                            <p className="text-blue-100 text-sm mt-1">Cadastre um novo usuário no sistema</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-full">
                            <FaUser className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Nome Completo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome Completo *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaUser className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Digite o nome completo"
                                value={form.nome}
                                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                required
                                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome de Usuário *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaUserTag className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Digite o username"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                required
                                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaEnvelope className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                placeholder="Digite o email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Senha */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Senha *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaLock className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                placeholder="Digite a senha"
                                value={form.senha}
                                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                                required
                                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Cargo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cargo *
                        </label>
                        <select
                            value={form.cargo_id}
                            onChange={(e) => setForm({ ...form, cargo_id: e.target.value })}
                            required
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                        >
                            <option value="">Selecione um cargo</option>
                            {cargos.map((cargo) => (
                                <option key={cargo.id} value={cargo.id}>
                                    {cargo.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Ativo */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                            <FaUserCheck className="h-5 w-5 text-green-600 mr-3" />
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
                                checked={form.ativo}
                                onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Botão Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r cursor-pointer from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Cadastrando...
                            </>
                        ) : (
                            <>
                                <FaUser className="h-4 w-4" />
                                Cadastrar Usuário
                            </>
                        )}
                    </button>

                    {/* Link de Login */}
                    <div className="text-center pt-4 border-t border-gray-200">
                        <Link 
                            href="/usuarios" 
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <FaArrowLeft className="h-3 w-3" />
                            Voltar para lista de usuários
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}