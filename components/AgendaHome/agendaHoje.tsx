'use client';

import { FaTools, FaCar, FaUser, FaClock, FaStickyNote, FaCalendarDay, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSpinner, FaFlagCheckered } from 'react-icons/fa';
import { IoPerson } from 'react-icons/io5';

interface Agendamento {
    id: number;
    data_agendamento: string;
    status: string;
    observacoes: string;
    cliente: { nome: string };
    veiculo: { modelo: string; placa: string };
    funcionario: { nome: string };
}

export default function AgendaHoje({ data }: { data: Agendamento[] }) {

    // Agrupar por mecânico
    const agrupado = data.reduce((acc: any, item) => {
        const nome = item.funcionario?.nome ?? "Sem mecânico";
        if (!acc[nome]) acc[nome] = [];
        acc[nome].push(item);
        return acc;
    }, {});

    // Função para determinar as cores e ícones do status
    const getStatusConfig = (status: string) => {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case 'confirmado':
                return {
                    bg: 'bg-green-50',
                    text: 'text-green-700',
                    border: 'border-green-200',
                    icon: FaCheckCircle,
                    iconColor: 'text-green-500'
                };
            case 'pendente':
                return {
                    bg: 'bg-yellow-50',
                    text: 'text-yellow-700',
                    border: 'border-yellow-200',
                    icon: FaExclamationTriangle,
                    iconColor: 'text-yellow-500'
                };
            case 'cancelado':
                return {
                    bg: 'bg-red-50',
                    text: 'text-red-700',
                    border: 'border-red-200',
                    icon: FaTimesCircle,
                    iconColor: 'text-red-500'
                };
            case 'em andamento':
                return {
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    border: 'border-blue-200',
                    icon: FaSpinner,
                    iconColor: 'text-blue-500'
                };
            case 'concluído':
                return {
                    bg: 'bg-purple-50',
                    text: 'text-purple-700',
                    border: 'border-purple-200',
                    icon: FaFlagCheckered,
                    iconColor: 'text-purple-500'
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    text: 'text-gray-700',
                    border: 'border-gray-200',
                    icon: FaClock,
                    iconColor: 'text-gray-500'
                };
        }
    };

    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm border border-gray-100">
                <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                        <FaCalendarDay className="text-4xl text-blue-500" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-white text-sm" />
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Agenda Livre
                </h3>
                <p className="text-gray-500 max-w-md text-lg">
                    Nenhum agendamento para hoje. Todos os compromissos estão em dia!
                </p>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            {Object.keys(agrupado).map((mecanico) => (
                <div
                    key={mecanico}
                    className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/60 overflow-hidden flex flex-col min-h-[600px]"
                >
                    {/* Header do Mecânico */}
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 relative overflow-hidden flex-shrink-0">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

                        <div className="relative z-10 flex items-center">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm mr-4">
                                <FaTools className="text-2xl text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-white truncate">
                                    {mecanico}
                                </h2>
                                <p className="text-blue-100 text-sm font-medium">
                                    Mecânico
                                </p>
                            </div>
                            {/* <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                <span className="text-white font-bold text-lg">
                                    {agrupado[mecanico].length}
                                </span>
                                <span className="text-blue-100 text-sm ml-1">
                                    {agrupado[mecanico].length === 1 ? 'serviço' : 'serviços'}
                                </span>
                            </div> */}
                        </div>
                    </div>

                    {/* Lista de Agendamentos */}
                    <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[500px]">
                        {agrupado[mecanico].map((a: Agendamento, index: number) => {
                            const statusConfig = getStatusConfig(a.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div
                                    key={a.id}
                                    className="bg-white rounded-2xl p-5 border border-gray-200/60 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group/item"
                                >
                                    {/* Header do Agendamento */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-xl">
                                                <FaClock className="text-white text-sm" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-900 text-lg">
                                                    {new Date(a.data_agendamento).toLocaleTimeString('pt-BR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                <div className="text-xs text-gray-500 font-medium">
                                                    Horário
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${statusConfig.bg} ${statusConfig.border} border`}>
                                            <StatusIcon className={`text-sm ${statusConfig.iconColor}`} />
                                            <span className={`text-xs font-bold ${statusConfig.text}`}>
                                                {a.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Informações do Cliente e Veículo */}
                                    <div className="space-y-3">
                                        {/* Cliente */}
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="bg-blue-100 p-2 rounded-lg">
                                                <IoPerson className="text-blue-600 text-lg" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-500 font-medium">Cliente</div>
                                                <div className="font-semibold text-gray-900">{a.cliente?.nome}</div>
                                            </div>
                                        </div>

                                        {/* Veículo */}
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="bg-green-100 p-2 rounded-lg">
                                                <FaCar className="text-green-600 text-lg" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-500 font-medium">Veículo</div>
                                                <div className="font-semibold text-gray-900">{a.veiculo?.modelo}</div>
                                                <div className="text-xs text-gray-500 font-mono bg-gray-200/50 px-2 py-1 rounded inline-block mt-1">
                                                    {a.veiculo?.placa}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Observações */}
                                        {a.observacoes && (
                                            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                                <div className="flex items-start space-x-3">
                                                    <div className="bg-amber-100 p-2 rounded-lg flex-shrink-0">
                                                        <FaStickyNote className="text-amber-600 text-lg" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-amber-800 mb-1">
                                                            Observações
                                                        </div>
                                                        <p className="text-sm text-amber-700 leading-relaxed">
                                                            {a.observacoes}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer do Card */}
                    <div className="border-t border-gray-200/60 bg-gray-50/50 p-4 flex-shrink-0">
                        <div className="text-center text-sm text-gray-500 font-medium">
                            {agrupado[mecanico].length} {agrupado[mecanico].length === 1 ? 'serviço agendado' : 'serviços agendados'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}