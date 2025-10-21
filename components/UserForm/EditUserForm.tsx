'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

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
    const [form, setForm] = useState({
        nome: user.nome || '',
        email: user.email || '',
        senha: '',
        cargo_id: user.cargo_id || '',
        ativo: user.ativo ?? true,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const res = await api.patch(`/usuarios/${user.id}`, form);
            if (res.status === 200) {
                setSuccess('Usuário atualizado com sucesso!');
                setTimeout(() => router.push('/usuarios'), 1500);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao atualizar usuário.');
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white shadow-lg p-8 rounded w-96"
        >
            <h2 className="text-xl font-semibold mb-6 text-center">
                Editar Usuário
            </h2>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

            <input
                type="text"
                placeholder="Nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
                className="border p-2 w-full mb-3 rounded"
            />

            <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="border p-2 w-full mb-3 rounded"
            />

            <input
                type="password"
                placeholder="Senha (deixe em branco para não alterar)"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                className="border p-2 w-full mb-3 rounded"
            />

            <select
                value={form.cargo_id}
                onChange={(e) => setForm({ ...form, cargo_id: Number(e.target.value) })}
                required
                className="border p-2 w-full mb-3 rounded"
            >
                <option value="">Selecione um cargo</option>
                {cargos.map((cargo) => (
                    <option key={cargo.id} value={cargo.id}>
                        {cargo.nome}
                    </option>
                ))}
            </select>

            <label className="flex items-center mb-4">
                <input
                    type="checkbox"
                    checked={form.ativo}
                    onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                    className="mr-2"
                />
                Usuário ativo
            </label>

            <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white w-full p-2 rounded"
            >
                Atualizar
            </button>
        </form>
    );
}
