'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getSocket } from '@/lib/websocket';
import { FiX, FiUser, FiTruck, FiCalendar, FiFileText, FiSave, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle, FiUserCheck } from 'react-icons/fi';

interface AgendamentoModalProps {
    data?: any;
    onClose: () => void;
    onSaved: () => void;
    client: any;
    employee?: any[]; // Adicione esta prop
}

export default function AgendamentoModal({ data, onClose, onSaved, client, employee }: AgendamentoModalProps) {
    const isEdit = !!data?.id;

    const [form, setForm] = useState({
        cliente_id: data?.cliente?.id || '',
        veiculo_id: data?.veiculo?.id || '',
        funcionario_id: data?.funcionario?.id || '',
        data_agendamento: data?.data_agendamento?.split('T')[0] || data?.start || '',
        hora_agendamento: data?.data_agendamento?.split('T')[1]?.slice(0, 5) || data?.hora_agendamento || '08:00',
        observacoes: data?.observacoes || '',
        status: data?.status || 'pendente',
    });

    const [clientes, setClientes] = useState<any[]>(client || []);
    const [veiculos, setVeiculos] = useState<any[]>([]);
    const [loadingVeiculos, setLoadingVeiculos] = useState(false);
    const [loading, setLoading] = useState(false);

    // Busca clientes ao montar
    useEffect(() => {
        if (isEdit && data?.cliente?.id) {
            loadVeiculosByCliente(data.cliente.id);
        }
    }, []);

    // Atualiza veículos quando muda o cliente
    useEffect(() => {
        if (form.cliente_id) {
            loadVeiculosByCliente(form.cliente_id);
        } else {
            setVeiculos([]);
        }
    }, [form.cliente_id]);

    const loadVeiculosByCliente = async (clienteId: number | string) => {
        try {
            setLoadingVeiculos(true);
            const res = await api.get(`/clientes/${clienteId}/veiculos`);
            setVeiculos(res.data || []);
        } catch (error) {
            console.error('Erro ao buscar veículos:', error);
            setVeiculos([]);
        } finally {
            setLoadingVeiculos(false);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'cliente_id' ? { veiculo_id: '' } : {}),
        }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        if (!form.cliente_id || !form.veiculo_id) {
            alert('Selecione um cliente e um veículo antes de salvar.');
            setLoading(false);
            return;
        }

        // Prepara o payload com funcionario_id (pode ser undefined se não selecionado)
        const payload: any = {
            cliente_id: Number(form.cliente_id),
            veiculo_id: Number(form.veiculo_id),
            data_agendamento: `${form.data_agendamento}T${form.hora_agendamento}:00`,
            observacoes: form.observacoes || '',
            status: form.status || 'pendente',
        };

        // Adiciona funcionario_id apenas se foi selecionado
        if (form.funcionario_id) {
            payload.funcionario_id = Number(form.funcionario_id);
        }

        try {
            const socket = getSocket('/agendamentos');
            if (isEdit) {
                await api.patch(`/agendamentos/${data.id}`, payload);
                socket.emit('agendamento:updated', payload);
            } else {
                await api.post('/agendamentos', payload);
                socket.emit('agendamento:created', payload);
            }

            onSaved();
            onClose();
        } catch (error: any) {
            console.error('Erro ao salvar agendamento:', error.response?.data || error);
            alert(
                error.response?.data?.message?.join('\n') ||
                'Erro ao salvar agendamento.'
            );
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pendente': return <FiClock className="text-yellow-500" />;
            case 'confirmado': return <FiCheckCircle className="text-green-500" />;
            case 'concluido': return <FiCheckCircle className="text-blue-500" />;
            case 'cancelado': return <FiXCircle className="text-red-500" />;
            default: return <FiClock className="text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendente': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
            case 'confirmado': return 'border-green-500 bg-green-50 text-green-700';
            case 'concluido': return 'border-blue-500 bg-blue-50 text-blue-700';
            case 'cancelado': return 'border-red-500 bg-red-50 text-red-700';
            default: return 'border-gray-500 bg-gray-50 text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <FiCalendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">
                                {isEdit ? 'Editar Agendamento' : 'Novo Agendamento'}
                            </h2>
                            {isEdit && (
                                <p className="text-blue-100 text-sm">#{data.id}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Cliente */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                            <FiUser className="text-blue-600" /> Cliente *
                        </label>
                        <select
                            name="cliente_id"
                            value={form.cliente_id}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Selecione o cliente</option>
                            {clientes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Veículo */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                            <FiTruck className="text-orange-600" /> Veículo *
                        </label>
                        <select
                            name="veiculo_id"
                            value={form.veiculo_id}
                            onChange={handleChange}
                            disabled={!form.cliente_id || loadingVeiculos}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            required
                        >
                            <option value="">
                                {!form.cliente_id
                                    ? 'Selecione um cliente primeiro'
                                    : loadingVeiculos
                                        ? 'Carregando veículos...'
                                        : 'Selecione o veículo'}
                            </option>
                            {!loadingVeiculos &&
                                veiculos.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.marca} {v.modelo} - {v.placa.toUpperCase()}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Funcionário (Opcional) */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                            <FiUserCheck className="text-green-600" /> Funcionário (Opcional)
                        </label>
                        <select
                            name="funcionario_id"
                            value={form.funcionario_id}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Selecione um funcionário (opcional)</option>
                            {(employee || []).map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.nome} {f.email ? `- ${f.email}` : ''}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Atribua um funcionário responsável por este agendamento
                        </p>
                    </div>

                    {/* Data e Hora */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Data *</label>
                            <input
                                type="date"
                                name="data_agendamento"
                                value={form.data_agendamento}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Hora *</label>
                            <input
                                type="time"
                                name="hora_agendamento"
                                value={form.hora_agendamento}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                            <FiAlertCircle className="text-purple-600" /> Status
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                { value: 'pendente', label: 'Pendente', icon: <FiClock className="w-4 h-4" /> },
                                { value: 'confirmado', label: 'Confirmado', icon: <FiCheckCircle className="w-4 h-4" /> },
                                { value: 'concluido', label: 'Concluído', icon: <FiCheckCircle className="w-4 h-4" /> },
                                { value: 'cancelado', label: 'Cancelado', icon: <FiXCircle className="w-4 h-4" /> },
                            ].map((statusOption) => (
                                <label
                                    key={statusOption.value}
                                    className={`flex items-center justify-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${form.status === statusOption.value
                                            ? getStatusColor(statusOption.value)
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={statusOption.value}
                                        checked={form.status === statusOption.value}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    {statusOption.icon}
                                    <span className="text-sm font-medium">{statusOption.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Observações */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                            <FiFileText className="text-gray-600" /> Observações
                        </label>
                        <textarea
                            name="observacoes"
                            value={form.observacoes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Digite observações sobre o agendamento..."
                        />
                    </div>

                    {/* Botões */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border-2 cursor-pointer border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r cursor-pointer from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 font-semibold flex items-center gap-2 transition-all"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <FiSave className="w-4 h-4" />
                                    {isEdit ? 'Salvar Alterações' : 'Criar Agendamento'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}