'use client';

import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/websocket';
import api from '@/lib/api';
import { FiX, FiFileText, FiPackage, FiDollarSign, FiHash, FiSave, FiTool } from 'react-icons/fi';

interface ServicoOsModalProps {
    data?: any;
    onClose: () => void;
    onSaved: () => void;
}

export default function ServicoOsModal({ data = {}, onClose, onSaved }: ServicoOsModalProps) {
    const [form, setForm] = useState({
        id: data?.id || null,
        ordem_id: data?.ordem_id || null,
        descricao: data?.descricao || '',
        quantidade: data?.quantidade || 1,
        valor_unitario: data?.valor_unitario || 0,
        tipo: data?.tipo || 'servico',
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (data) {
            setForm({
                id: data.id || null,
                ordem_id: data.ordem_id || null,
                descricao: data.descricao || '',
                quantidade: data.quantidade || 1,
                valor_unitario: data.valor_unitario || 0,
                tipo: data.tipo || 'servico',
            });
        }
    }, [data]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.ordem_id) {
            alert('ID da ordem não encontrado.');
            return;
        }

        if (!form.descricao.trim()) {
            alert('A descrição é obrigatória.');
            return;
        }

        if (form.quantidade < 1) {
            alert('A quantidade deve ser no mínimo 1.');
            return;
        }

        if (form.valor_unitario < 0) {
            alert('O valor unitário não pode ser negativo.');
            return;
        }

        setLoading(true);

        try {
            const socket = getSocket('/servicos-os');

            const payload = {
                descricao: form.descricao.trim(),
                quantidade: Number(form.quantidade),
                valor_unitario: Number(form.valor_unitario),
                tipo: form.tipo,
                ordem_id: Number(form.ordem_id)
            };

            let response;
            if (form.id) {
                console.log('🔄 Editando serviço existente');
                // response = await api.patch(`/servicos-os/${form.id}`, payload);
                // console.log('✅ Serviço atualizado via HTTP:', response.data);

                console.log('📤 Emitindo WebSocket para atualização');
                socket.emit('servico-os:update', {
                    id: form.id,
                    data: payload
                });

            } else {
                // response = await api.post('/servicos-os', payload);
                socket.emit('servico-os:create', payload);
            }

            onClose(); 
        } catch (error: any) {
            console.error('❌ Erro ao salvar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            const numValue = value === '' ? 1 : Math.max(1, parseInt(value));
            setForm({ ...form, quantidade: numValue });
        }
    };

    const handleValorUnitarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
            const numValue = value === '' ? 0 : parseFloat(value);
            setForm({ ...form, valor_unitario: isNaN(numValue) ? 0 : numValue });
        }
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
        return tipo === 'servico' ? <FiTool className="w-4 h-4" /> : <FiPackage className="w-4 h-4" />;
    };

    const valorTotal = form.quantidade * form.valor_unitario;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                {getTipoIcon(form.tipo)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">
                                    {form.id ? 'Editar Item' : 'Novo Item'}
                                </h2>
                                <p className="text-blue-100 text-sm">
                                    {form.id ? 'Atualize os dados do item' : 'Adicione um novo serviço ou peça'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all cursor-pointer"
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <FiPackage className="w-4 h-4 text-purple-600" />
                                </div>
                                <span>Tipo de Item</span>
                            </label>
                            <select
                                className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${getTipoColor(form.tipo)}`}
                                value={form.tipo}
                                onChange={(e) => setForm({ ...form, tipo: e.target.value as 'servico' | 'peca' })}
                            >
                                <option value="servico">🔧 Serviço</option>
                                <option value="peca">📦 Peça</option>
                            </select>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FiFileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <span>Descrição *</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Descreva o serviço ou peça..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                value={form.descricao}
                                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <FiHash className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <span>Quantidade *</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    placeholder="1"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-center"
                                    value={form.quantidade}
                                    onChange={handleQuantidadeChange}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Mínimo: 1</p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <FiDollarSign className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span>Valor Unit. *</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                    value={form.valor_unitario}
                                    onChange={handleValorUnitarioChange}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Mínimo: 0.00</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                    <FiDollarSign className="w-4 h-4 text-white" />
                                </div>
                                <span>Valor Total</span>
                            </label>
                            <div className="text-center">
                                <span className="text-2xl font-bold text-emerald-700">
                                    {formatCurrency(valorTotal)}
                                </span>
                                <p className="text-xs text-emerald-600 mt-1">
                                    {form.quantidade} × {formatCurrency(form.valor_unitario)}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all font-semibold cursor-pointer"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all font-semibold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{form.id ? 'Atualizando...' : 'Salvando...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="w-4 h-4" />
                                        <span>{form.id ? 'Atualizar' : 'Adicionar'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}