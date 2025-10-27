'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { FiX, FiUser, FiUserCheck, FiMail, FiBriefcase, FiSave, FiCheckCircle } from 'react-icons/fi';

interface Props {
    id: number;
    onClose: () => void;
    onUpdated: () => void;
    cargo: Cargo[];
}

interface Cargo {
    id: number;
    nome: string;
}

export default function EditUserModal({ id, onClose, onUpdated, cargo }: Props) {
    const [username, setUsername] = useState('');
    const [cargoId, setCargoId] = useState<number | ''>('');
    const [email, setEmail] = useState('');
    const [ativo, setAtivo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);

    const didFetch = useRef(false);

    const token =
        typeof window !== 'undefined'
            ? document.cookie
                .split('; ')
                .find((row) => row.startsWith('token='))
                ?.split('=')[1]
            : '';

    useEffect(() => {
        if (didFetch.current) return;   
        didFetch.current = true;
        
        async function fetchData() {
            try {
                setFetchLoading(true);
                const userRes = await api.get(`/usuarios/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const user = userRes.data;
                setUsername(user?.username ?? '');
                setEmail(user?.email ?? '');
                setCargoId(user?.cargo_id ?? user?.cargo?.id ?? '');
                setAtivo(Boolean(user?.ativo));
            } catch (err) {
                console.error('Erro ao buscar dados do usuário:', err);
            } finally {
                setFetchLoading(false);
            }
        }

        fetchData();
    }, [id, token]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: any = {
                username: username.trim(),
                email: email.trim(),
                ativo,
                cargo_id: cargoId !== '' ? Number(cargoId) : undefined,
            };

            await api.patch(`/usuarios/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            onUpdated();
            onClose();
        } catch (err: any) {
            console.error('Erro ao atualizar usuário:', err.response?.data || err.message);
            alert(err.response?.data?.message || 'Erro ao atualizar usuário.');
        } finally {
            setLoading(false);
        }
    }

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
                                <h2 className="text-xl font-bold">Editar Usuário</h2>
                                <p className="text-blue-100 text-sm">Atualize os dados do usuário</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 cursor-pointer rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        >
                            <FiX size={18} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {fetchLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-gray-600 text-sm">Carregando dados do usuário...</p>
                        </div>
                    ) : (
                        <>
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FiUserCheck className="inline w-4 h-4 mr-1 text-gray-400" />
                                    Nome de Usuário *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Digite o username"
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Digite o email"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMail className="w-5 h-5 text-gray-400" />
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
                                        value={cargoId}
                                        onChange={(e) => setCargoId(e.target.value ? Number(e.target.value) : '')}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                                    >
                                        <option value="">Selecione um cargo</option>
                                        {cargo.map((cargos) => (
                                            <option key={cargos.id} value={cargos.id}>
                                                {cargos.nome}
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
                                        checked={ativo}
                                        onChange={(e) => setAtivo(e.target.checked)}
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
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave className="w-4 h-4" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}