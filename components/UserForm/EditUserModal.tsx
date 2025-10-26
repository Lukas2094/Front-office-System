'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';

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
    const [ email , setEmail ] = useState('');
    const [ativo, setAtivo] = useState(false);
    const [loading, setLoading] = useState(false);

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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded-lg w-[400px]">
                <h2 className="text-xl font-bold mb-4">Editar Usuário</h2>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block mb-1 text-sm font-medium">Usuário (Login)</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="border w-full p-2 rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium">Email Usuário</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border w-full p-2 rounded"
                            required
                        />
                    </div>


                    <div>
                        <label className="block mb-1 text-sm font-medium">Cargo</label>
                        <select
                            value={cargoId}
                            onChange={(e) => setCargoId(e.target.value ? Number(e.target.value) : '')}
                            className="border w-full p-2 rounded"
                            required
                        >
                            <option value="">Selecione</option>
                            {cargo.map((cargos) => (
                                <option key={cargos.id} value={cargos.id}>
                                    {cargos.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={ativo}
                            onChange={(e) => setAtivo(e.target.checked)}
                        />
                        <label>Ativo</label>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded cursor-pointer bg-red-500 text-white hover:bg-red-600"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
