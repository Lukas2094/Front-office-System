'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

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
        username: '', // antes era nome
        email: '',
        senha: '', // antes era senha
        cargo_id: '',
        ativo: true,
    });
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        try {
            const payload = {
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
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white shadow-lg p-8 rounded w-96"
        >
            <h2 className="text-xl font-semibold mb-6 text-center">Novo Usuário</h2>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <input
                type="text"
                placeholder="Nome de usuário"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
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
                placeholder="Senha"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                required
                className="border p-2 w-full mb-3 rounded"
            />

            <select
                value={form.cargo_id}
                onChange={(e) => setForm({ ...form, cargo_id: e.target.value })}
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
                className="bg-blue-600 hover:bg-blue-700 text-white w-full p-2 rounded cursor-pointer"
            >
                Salvar
            </button>


            <Link href="/login" className="block text-center mt-4 text-blue-600 hover:underline">
                Já possui uma conta? Faça login
            </Link>
        </form>
    );
}
