'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import Link from 'next/link';

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
            router.replace('/'); // redireciona para a home
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
        <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
            {/* Área esquerda - Formulário */}
            <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white px-8 py-12 md:px-16 shadow-2xl relative z-10">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-2">
                    Bem-vindo!
                </h2>
                <p className="text-gray-500 mb-10 text-center">
                    Acesse o sistema da <span className="text-yellow-500 font-semibold">OficinaTech</span>
                </p>

                {error && (
                    <div className="bg-red-100 text-red-600 border border-red-300 p-3 rounded mb-4 text-sm w-full max-w-sm text-center shadow-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="w-full max-w-sm space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Usuário
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="border border-gray-300 px-3 py-2 w-full rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-shadow shadow-sm"
                            placeholder="Digite seu usuário"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Senha
                        </label>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="border border-gray-300 px-3 py-2 w-full rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-shadow shadow-sm"
                            placeholder="Digite sua senha"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2.5 rounded-md font-semibold cursor-pointer text-white shadow-md transition-all duration-200 ${
                            loading
                                ? 'bg-yellow-400 cursor-not-allowed'
                                : 'bg-yellow-500 hover:bg-yellow-600 active:scale-95'
                        }`}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>

                    <Link
                        href="/usuarios/newusers"
                        className="block text-center text-sm text-yellow-500 hover:underline mt-4"
                    >
                        Não possui uma conta? Cadastre-se aqui.
                    </Link>
                </form>

                <div className="mt-10 text-sm text-gray-500">
                    © {new Date().getFullYear()} OficinaTech — Todos os direitos reservados
                </div>
            </div>

            {/* Área direita - Logo */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 justify-center items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-yellow-500/5 backdrop-blur-[2px]"></div>
                <div className="text-center z-10">
                    <Image
                        src="https://i.ibb.co/R4TcWGWz/logo.png"
                        alt="Logo Oficina"
                        width={180}
                        height={180}
                        quality={80}
                        className="mx-auto mb-6 drop-shadow-lg animate-pulse-slow"
                    />
                    <h1 className="text-3xl font-bold text-yellow-500 tracking-wide drop-shadow">
                        System Office
                    </h1>
                    <p className="text-gray-300 mt-3">
                        Sistema de Gestão de Oficina Mecânica
                    </p>
                </div>
            </div>
        </div>
    );


}
