'use client';

import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/websocket';

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

    useEffect(() => {
        const s = getSocket('/usuarios');
        setSocket(s);

        // Listeners
        s.on('usuario:create:success', (data) => {
            console.log('✅ Usuário criado via WebSocket:', data);
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

    if (!isOpen) return null;

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

        if (!socket) {
            setError('WebSocket não conectado');
            setLoading(false);
            return;
        }

        // 🔥 Envia o evento via WebSocket
        socket.emit('usuario:create', formData);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Novo Usuário</h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            placeholder='Insira o nome do usuário'
                            required
                            className="w-full border rounded px-3 py-2 mt-1 focus:ring focus:ring-blue-300 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder='Insira o Nickname de Login do usuário'
                            required
                            className="w-full border rounded px-3 py-2 mt-1 focus:ring focus:ring-blue-300 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder='Insira um email válido'
                            required
                            className="w-full border rounded px-3 py-2 mt-1 focus:ring focus:ring-blue-300 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha</label>
                        <input
                            type="password"
                            name="senha"
                            value={formData.senha}
                            onChange={handleChange}
                            placeholder='Insira uma senha segura'
                            required
                            className="w-full border rounded px-3 py-2 mt-1 focus:ring focus:ring-blue-300 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cargo</label>
                        <select
                            name="cargo_id"
                            value={formData.cargo_id}
                            onChange={handleChange}
                            required
                            className="w-full border rounded px-3 py-2 mt-1 focus:ring focus:ring-blue-300 outline-none"
                        >
                            <option value="">Selecione um cargo</option>
                            {cargos?.map((cargo) => (
                                <option key={cargo.id} value={cargo.id}>
                                    {cargo.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="ativo"
                            checked={formData.ativo}
                            onChange={handleChange}
                            className="h-4 w-4"
                        />
                        <label className="text-sm text-gray-700">Usuário ativo</label>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Criando...' : 'Criar Usuário'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
