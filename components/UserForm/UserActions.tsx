'use client';

import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useState } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import EditUserModal from './EditUserModal';

interface Props {
    id: number;
    cargos: any[];
}

export default function UserActions({ id, cargos }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function handleDelete() {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
        setLoading(true);

        try {
            await api.delete(`/usuarios/${id}`, {
                headers: {
                    Authorization: `Bearer ${typeof window !== 'undefined'
                            ? document.cookie
                                .split('; ')
                                .find((row) => row.startsWith('token='))
                                ?.split('=')[1]
                            : ''
                        }`,
                },
            });
            router.refresh();
        } catch (err) {
            console.error('Erro ao excluir usuário:', err);
            alert('Erro ao excluir o usuário.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="flex justify-center items-center gap-3">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Editar"
                >
                    <FaEdit />
                </button>

                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    title="Excluir"
                >
                    <FaTrash />
                </button>
            </div>

            {isModalOpen && (
                <EditUserModal
                    id={id}
                    cargo={cargos}
                    onClose={() => setIsModalOpen(false)}
                    onUpdated={() => {
                        router.refresh();
                        setIsModalOpen(false);
                    }}
                />
            )}
        </>
    );
}
