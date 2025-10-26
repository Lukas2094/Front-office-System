'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import Link from 'next/link';
import { FaUser, FaLock, FaArrowRight, FaShieldAlt } from 'react-icons/fa';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 🚫 Bloqueia a tela se já houver token
    useEffect(() => {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];

        if (token) {
            router.replace('/');
        }
    }, [router]);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/usuarios/login', { username, senha });
            document.cookie = `token=${res.data.access_token}; path=/;`;
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Usuário ou senha inválidos');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">
                {/* Lado Esquerdo - Formulário */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg mb-4">
                            <FaShieldAlt className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Bem-vindo de volta
                        </h1>
                        <p className="text-gray-600">
                            Acesse o sistema da <span className="text-blue-600 font-semibold">DayCar</span>
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Campo Usuário */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Usuário
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUser className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Digite seu usuário"
                                    required
                                />
                            </div>
                        </div>

                        {/* Campo Senha */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Digite sua senha"
                                    required
                                />
                            </div>
                        </div>

                        {/* Botão de Login */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r cursor-pointer from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    Acessar Sistema
                                    <FaArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>

                        {/* Link de Cadastro */}
                        <div className="text-center pt-4">
                            <Link 
                                href="/usuarios/newusers" 
                                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                Não possui uma conta?
                                <span className="font-semibold text-blue-600 hover:text-blue-700">
                                    Cadastre-se aqui
                                </span>
                            </Link>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <p className="text-xs text-gray-500">
                            © {new Date().getFullYear()} DayCar — Todos os direitos reservados
                        </p>
                    </div>
                </div>

                {/* Lado Direito - Banner */}
                <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center text-center text-white p-12 h-full">
                        <div className="mb-8">
                            <Image
                                src="https://i.ibb.co/R4TcWGWz/logo.png"
                                alt="Logo Oficina"
                                width={140}
                                height={140}
                                quality={100}
                                className="mx-auto mb-6 drop-shadow-xl"
                            />
                        </div>
                        
                        <h2 className="text-4xl font-bold mb-4 drop-shadow">
                            System Office
                        </h2>
                        <p className="text-blue-100 text-lg mb-6 max-w-xs">
                            Sistema completo de gestão para oficinas mecânicas
                        </p>
                        
                        <div className="space-y-3 text-left text-blue-100 text-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <span>Gestão de clientes e veículos</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <span>Controle de ordens de serviço</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <span>Relatórios e analytics</span>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                            <p className="text-sm text-blue-100">
                                "Ferramenta essencial para o crescimento do seu negócio"
                            </p>
                        </div>
                    </div>

                    {/* Elementos decorativos */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                </div>
            </div>
        </div>
    );
}