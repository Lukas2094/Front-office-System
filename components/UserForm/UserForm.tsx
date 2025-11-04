'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaLock, FaUserTag, FaUserCheck, FaArrowLeft, FaExclamationTriangle, FaCrown } from 'react-icons/fa';

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
    const [adminExists, setAdminExists] = useState<boolean | null>(null);
    const [loadingAdminCheck, setLoadingAdminCheck] = useState(true);

    // Verificar se já existe um admin no sistema
    useEffect(() => {
        const checkAdminExists = async () => {
            try {
                const response = await api.get('/usuarios/check/admin-exists');
                setAdminExists(response.data.hasAdmin);
            } catch (error) {
                console.error('Erro ao verificar administrador:', error);
                setAdminExists(false);
            } finally {
                setLoadingAdminCheck(false);
            }
        };

        checkAdminExists();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validação adicional no frontend
        if (adminExists && Number(form.cargo_id) === 1) {
            setError('Já existe um usuário administrador no sistema. Não é possível criar outro.');
            setLoading(false);
            return;
        }

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

    // Função para verificar se o cargo selecionado é admin
    const isAdminSelected = Number(form.cargo_id) === 1;

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
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                            <FaExclamationTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <strong className="font-medium">Erro no cadastro:</strong>
                                <p className="mt-1">{error}</p>
                            </div>
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
                                minLength={6}
                                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                    </div>

                    {/* Cargo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cargo *
                        </label>
                        <div className="relative">
                            <select
                                value={form.cargo_id}
                                onChange={(e) => setForm({ ...form, cargo_id: e.target.value })}
                                required
                                disabled={loadingAdminCheck}
                                className={`block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white ${
                                    loadingAdminCheck ? 'opacity-50 cursor-not-allowed' : ''
                                } ${isAdminSelected ? 'border-yellow-400 bg-yellow-50' : ''}`}
                            >
                                <option value="">Selecione um cargo</option>
                                {cargos.map((cargo) => (
                                    <option key={cargo.id} value={cargo.id}>
                                        {cargo.nome}
                                    </option>
                                ))}
                            </select>
                            {loadingAdminCheck && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            {isAdminSelected && (
                                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                                    <FaCrown className="h-4 w-4 text-yellow-500" />
                                </div>
                            )}
                        </div>

                        {/* Aviso sobre administrador */}
                        {loadingAdminCheck ? (
                            <p className="text-xs text-gray-500 mt-1">Verificando permissões...</p>
                        ) : adminExists && isAdminSelected ? (
                            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <FaExclamationTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-yellow-800 font-medium">
                                            Administrador já existe
                                        </p>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            Já existe um usuário administrador no sistema. 
                                            Não é possível criar outro.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : isAdminSelected ? (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <FaCrown className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-blue-800 font-medium">
                                            Permissões de Administrador
                                        </p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            Este usuário terá acesso total ao sistema.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Status Ativo */}
                    <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        isAdminSelected ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                        <div className="flex items-center">
                            <FaUserCheck className={`h-5 w-5 mr-3 ${
                                isAdminSelected ? 'text-yellow-600' : 'text-green-600'
                            }`} />
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
                            <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 ${
                                isAdminSelected 
                                    ? 'bg-yellow-200 peer-focus:ring-yellow-300 peer-checked:bg-yellow-600' 
                                    : 'bg-gray-200 peer-focus:ring-blue-300 peer-checked:bg-blue-600'
                            } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full`}></div>
                        </label>
                    </div>

                    {/* Botão Submit */}
                    <button
                        type="submit"
                        disabled={loading || loadingAdminCheck || (adminExists === true && isAdminSelected)}
                        className={`w-full text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform flex items-center justify-center gap-2 ${
                            loading || loadingAdminCheck || (adminExists && isAdminSelected)
                                ? 'bg-gray-400 cursor-not-allowed transform-none'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:scale-[1.02] cursor-pointer'
                        }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Cadastrando...
                            </>
                        ) : loadingAdminCheck ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Verificando...
                            </>
                        ) : (
                            <>
                                <FaUser className="h-4 w-4" />
                                {adminExists && isAdminSelected ? 'Administrador já existe' : 'Cadastrar Usuário'}
                            </>
                        )}
                    </button>

                    {/* Informação sobre administrador */}
                    {adminExists !== null && (
                        <div className="text-center">
                            <p className="text-xs text-gray-500">
                                {adminExists 
                                    ? '✅ Sistema já possui um administrador' 
                                    : '⚠️ Sistema ainda não possui um administrador'
                                }
                            </p>
                        </div>
                    )}

                    {/* Link de Voltar */}
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