'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { FiEdit, FiTrash2, FiPlus, FiTool, FiPackage, FiDollarSign, FiList } from 'react-icons/fi';
import ServicoOsModal from './ServicoOsModal';
import { getSocket } from '@/lib/websocket';

interface ServicoOs {
    id: number;
    ordem_id: number;
    descricao: string;
    quantidade: number;
    valor_unitario: number;
    tipo: 'servico' | 'peca';
}

export default function ServicosOsList({ ordemId }: { ordemId: number }) {
    const [servicos, setServicos] = useState<ServicoOs[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [contagem, setContagem] = useState({ servicos: 0, pecas: 0 });
    const [modalData, setModalData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // CORREÇÃO: Ref para controlar se já está escutando WebSocket
    const isListeningRef = useRef(false);
    const loadDataTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const loadData = async () => {
        const callId = Math.random().toString(36).substring(7);

        setLoading(true);
        try {
            const response = await api.get(`/servicos-os/ordem/${ordemId}`);
            setServicos(response.data);

            // Calcular totais localmente
            const novoTotal = response.data.reduce((acc: number, servico: ServicoOs) => {
                return acc + (servico.quantidade * servico.valor_unitario);
            }, 0);

            const novaContagem = response.data.reduce((acc: any, servico: ServicoOs) => {
                if (servico.tipo === 'servico') {
                    acc.servicos += 1;
                } else {
                    acc.pecas += 1;
                }
                return acc;
            }, { servicos: 0, pecas: 0 });

            setTotal(novoTotal);
            setContagem(novaContagem);


        } catch (error) {
            console.error(`❌ [${callId}] Erro no loadData:`, error);
        } finally {
            setLoading(false);
        }
    };

    // CORREÇÃO: Função com debounce para evitar múltiplas chamadas
    const loadDataDebounced = () => {
        if (loadDataTimeoutRef.current) {
            clearTimeout(loadDataTimeoutRef.current);
        }

        loadDataTimeoutRef.current = setTimeout(() => {
            loadData();
        }, 100);
    };

    useEffect(() => {

        if (!ordemId) return;

        // CORREÇÃO: Verificar se já está escutando
        if (isListeningRef.current) {
            return;
        }
        isListeningRef.current = true;
        loadData();

        const socket = getSocket('/servicos-os');

        // Entrar na sala da ordem específica
        socket.emit('servico-os:join-ordem', ordemId);

        // Criar funções nomeadas para os listeners
        const handleServicoCriado = (data: ServicoOs) => {
            if (data.ordem_id === ordemId) {
                loadDataDebounced();
            }
        };

        const handleServicoAtualizado = (data: ServicoOs) => {
            if (data.ordem_id === ordemId) {
                loadDataDebounced();
            }
        };

        const handleServicoDeletado = (data: any) => {
            console.log('🎯 WebSocket: servico-os:deleted RECEBIDO', data);
            loadDataDebounced();
        };

        // Registrar listeners
        socket.on('servico-os:created', handleServicoCriado);
        socket.on('servico-os:updated', handleServicoAtualizado);
        socket.on('servico-os:deleted', handleServicoDeletado);

        // Debug de conexão
        socket.on('connect', () => {
            console.log('✅ WebSocket /servicos-os CONECTADO');
        });

        socket.on('disconnect', () => {
            console.log('❌ WebSocket /servicos-os DESCONECTADO');
        });

        return () => {

            // Limpar timeout pendente
            if (loadDataTimeoutRef.current) {
                clearTimeout(loadDataTimeoutRef.current);
            }

            // Remover listeners específicos
            socket.off('servico-os:created', handleServicoCriado);
            socket.off('servico-os:updated', handleServicoAtualizado);
            socket.off('servico-os:deleted', handleServicoDeletado);

            socket.emit('servico-os:leave-ordem', ordemId);

            // CORREÇÃO: Resetar a ref para permitir nova configuração
            isListeningRef.current = false;
        };
    }, [ordemId]);

    const handleDelete = async (servico: ServicoOs) => {
        if (!confirm(`Tem certeza que deseja remover "${servico.descricao}"?`)) {
            return;
        }

        try {
            await api.delete(`/servicos-os/${servico.id}`);
            // Recarrega a lista após deletar
            loadDataDebounced();
        } catch (error) {
            console.error('❌ Erro ao deletar:', error);
            alert('Erro ao remover item. Tente novamente.');
        }
    };

    const handleNovoItem = () => {
        setModalData({
            ordem_id: ordemId,
            descricao: '',
            quantidade: 1,
            valor_unitario: 0,
            tipo: 'servico'
        });
    };

    const handleEditarItem = (servico: ServicoOs) => {
        setModalData(servico);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const getTipoColor = (tipo: string) => {
        return tipo === 'servico'
            ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : 'bg-green-100 text-green-800 border border-green-200';
    };

    const getTipoIcon = (tipo: string) => {
        return tipo === 'servico' ? <FiTool className="w-3 h-3" /> : <FiPackage className="w-3 h-3" />;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-600 text-sm">Carregando serviços...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FiList className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Serviços e Peças</h2>
                            <p className="text-gray-600 text-sm">Itens da ordem de serviço #{ordemId}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleNovoItem}
                        className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-2.5 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl cursor-pointer"
                    >
                        <FiPlus className="mr-2 w-4 h-4" />
                        <span>Adicionar Item</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-white border-b border-gray-200">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <FiTool className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Serviços</span>
                    </div>
                    <div className="text-xl font-bold text-blue-600">{contagem.servicos}</div>
                </div>

                <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <FiPackage className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Peças</span>
                    </div>
                    <div className="text-xl font-bold text-green-600">{contagem.pecas}</div>
                </div>

                <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <FiDollarSign className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-700">Total</span>
                    </div>
                    <div className="text-xl font-bold text-emerald-700">
                        {formatCurrency(total)}
                    </div>
                </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
                {servicos.length > 0 ? (
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Descrição
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Qtd
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                                    Unitário
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/60">
                            {servicos.map((servico) => (
                                <tr
                                    key={servico.id}
                                    className="hover:bg-blue-50/30 transition-all duration-150"
                                >
                                    {/* Descrição */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                {getTipoIcon(servico.tipo)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {servico.descricao}
                                                </p>
                                                <div className="sm:hidden mt-1">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(servico.tipo)}`}>
                                                        {servico.tipo === 'servico' ? 'Serviço' : 'Peça'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Tipo */}
                                    <td className="px-6 py-4 text-center hidden sm:table-cell">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTipoColor(servico.tipo)}`}>
                                            {servico.tipo === 'servico' ? 'Serviço' : 'Peça'}
                                        </span>
                                    </td>

                                    {/* Quantidade */}
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">
                                            {servico.quantidade}
                                        </span>
                                    </td>

                                    {/* Valor Unitário */}
                                    <td className="px-6 py-4 text-center hidden md:table-cell">
                                        <span className="text-sm font-medium text-gray-700">
                                            {formatCurrency(servico.valor_unitario)}
                                        </span>
                                    </td>

                                    {/* Total */}
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-bold text-emerald-700">
                                            {formatCurrency(servico.quantidade * servico.valor_unitario)}
                                        </span>
                                    </td>

                                    {/* Ações */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button
                                                onClick={() => handleEditarItem(servico)}
                                                className="inline-flex items-center p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 cursor-pointer hover:shadow-sm"
                                                title="Editar item"
                                            >
                                                <FiEdit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(servico)}
                                                className="inline-flex items-center p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 cursor-pointer hover:shadow-sm"
                                                title="Excluir item"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-12 px-6">
                        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <FiList className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Nenhum item cadastrado
                            </h3>
                            <p className="text-gray-500 text-sm mb-6 text-center">
                                Adicione serviços ou peças para esta ordem de serviço
                            </p>
                            <button
                                onClick={handleNovoItem}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl cursor-pointer"
                            >
                                Adicionar Primeiro Item
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer com total geral */}
            {servicos.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-t border-emerald-200 px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                        <div className="text-emerald-700 font-medium mb-2 sm:mb-0">
                            {servicos.length} ite{servicos.length === 1 ? 'm' : 'ns'} na ordem
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-emerald-700">
                                <span className="font-semibold">Total Geral:</span>
                            </div>
                            <div className="text-xl font-bold text-emerald-700">
                                {formatCurrency(total)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {modalData && (
                <ServicoOsModal
                    data={modalData}
                    onClose={() => setModalData(null)}
                    onSaved={() => {
                        setModalData(null);
                    }}
                />
            )}
        </div>
    );
}