'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/websocket';
import { FaPlus, FaEdit, FaFileInvoiceDollar, FaSearch, FaCar, FaUser, FaTools, FaFilter, FaCalendar, FaDollarSign } from 'react-icons/fa';
import api from '@/lib/api';
import OrdemServicoModal from './OrdemServicoModal';

interface OrdemServico {
  id: number;
  cliente: { nome: string };
  veiculo: { placa: string; modelo: string };
  funcionario?: { nome: string } | null;
  status: string;
  valorTotal: number;
  dataAbertura: string;
  dataFechamento?: string;
}

export default function OrdemServicoList({ initialData }: { initialData: OrdemServico[] }) {
  const [ordens, setOrdens] = useState<OrdemServico[]>(initialData);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrdem, setSelectedOrdem] = useState<OrdemServico | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const socket = getSocket('/ordens');

  useEffect(() => {

    socket.on('ordemCriada', (ordem: OrdemServico) => {
      setOrdens((prev) => [ordem, ...prev]);
    });

    socket.on('ordemAtualizada', (ordem: OrdemServico) => {
      setOrdens((prev) => prev.map((o) => (o.id === ordem.id ? ordem : o)));
    });

    socket.on('ordemFaturada', (ordem: OrdemServico) => {
      setOrdens((prev) => prev.map((o) => (o.id === ordem.id ? ordem : o)));
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket /ordens CONECTADO');
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket /ordens DESCONECTADO:', reason);
    });

    return () => {
      socket.off('ordemCriada');
      socket.off('ordemAtualizada');
      socket.off('ordemFaturada');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  // Filtrar ordens baseado no termo de busca e status
  const filteredOrdens = ordens.filter(ordem => {
    const matchesSearch =
      ordem.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.veiculo?.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.veiculo?.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.funcionario?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.status?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || ordem.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  async function fetchOrdens() {
    const res = await api.get('/ordens-servico');
    setOrdens(res.data);
  }

  async function handleFaturar(id: number) {
    await api.put(`/ordens-servico/${id}/faturar`);
    await fetchOrdens();
  }

  function handleNovaOrdem() {
    setSelectedOrdem(null);
    setShowModal(true);
  }

  function handleEditarOrdem(ordem: OrdemServico) {
    setSelectedOrdem(ordem);
    setShowModal(true);
  }

  const getStatusColor = (status: string) => {
    const colors = {
      aberta: 'bg-blue-100 text-blue-800 border border-blue-200',
      em_andamento: 'bg-amber-100 text-amber-800 border border-amber-200',
      concluida: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      faturada: 'bg-purple-100 text-purple-800 border border-purple-200',
      cancelada: 'bg-red-100 text-red-800 border border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      aberta: '🟦',
      em_andamento: '🟨',
      concluida: '🟩',
      faturada: '🟪',
      cancelada: '🟥',
    };
    return icons[status as keyof typeof icons] || '⚪';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <FaTools className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
                <p className="text-gray-600 text-sm sm:text-base mt-1">Gerencie todas as ordens de serviço da oficina</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleNovaOrdem}
                className="flex items-center cursor-pointer justify-center bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <FaPlus className="mr-2 w-4 h-4" />
                <span className="hidden sm:inline">Nova OS</span>
                <span className="sm:hidden">Nova</span>
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 sm:mt-8">
            {/* Barra de Busca */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por cliente, veículo, placa, responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
              />
            </div>

            {/* Filtro de Status */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm appearance-none"
                >
                  <option value="todos">Todos os status</option>
                  <option value="aberta">Aberta</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                  <option value="faturada">Faturada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              {(searchTerm || statusFilter !== 'todos') && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-200 font-medium whitespace-nowrap"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mt-6">
            {[
              { status: 'todos', label: 'Total', count: ordens.length, color: 'bg-gray-500' },
              { status: 'aberta', label: 'Abertas', count: ordens.filter(o => o.status === 'aberta').length, color: 'bg-blue-500' },
              { status: 'em_andamento', label: 'Andamento', count: ordens.filter(o => o.status === 'em_andamento').length, color: 'bg-amber-500' },
              { status: 'concluida', label: 'Concluídas', count: ordens.filter(o => o.status === 'concluida').length, color: 'bg-emerald-500' },
              { status: 'faturada', label: 'Faturadas', count: ordens.filter(o => o.status === 'faturada').length, color: 'bg-purple-500' },
            ].map((stat) => (
              <div
                key={stat.status}
                className={`bg-white border-2 ${statusFilter === stat.status ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                  } rounded-xl p-3 text-center cursor-pointer transition-all duration-200 hover:shadow-md`}
                onClick={() => setStatusFilter(stat.status)}
              >
                <div className={`w-3 h-3 ${stat.color} rounded-full mx-auto mb-2`}></div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">{stat.count}</div>
                <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    OS / Cliente
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                    Veículo
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">
                    Responsável
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                    Valor
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                    Data
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60">
                {filteredOrdens.length > 0 ? (
                  filteredOrdens.map((ordem) => (
                    <tr
                      key={ordem.id}
                      className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200"
                    >
                      {/* OS e Cliente */}
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                              <span className="text-xs font-bold text-white">#{ordem.id}</span>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <FaUser className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="text-sm font-semibold text-gray-900 truncate">
                                {ordem.cliente?.nome}
                              </span>
                            </div>
                            <div className="lg:hidden mt-1">
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <FaCar className="w-3 h-3" />
                                <span>{ordem.veiculo?.modelo}</span>
                                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                  {ordem.veiculo?.placa}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Veículo (oculta em mobile) */}
                      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <FaCar className="w-3 h-3 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{ordem.veiculo?.modelo}</div>
                            <div className="text-xs text-gray-500 font-mono uppercase">{ordem.veiculo?.placa}</div>
                          </div>
                        </div>
                      </td>

                      {/* Responsável (oculta em tablet) */}
                      <td className="px-4 sm:px-6 py-4 hidden xl:table-cell">
                        <div className={`flex items-center space-x-2 ${!ordem.funcionario ? 'text-gray-400' : 'text-gray-700'}`}>
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <FaUser className="w-3 h-3" />
                          </div>
                          <span className="text-sm font-medium">
                            {ordem.funcionario?.nome || 'Não atribuído'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{getStatusIcon(ordem.status)}</span>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(ordem.status)}`}>
                            {ordem.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>

                      {/* Valor (oculta em mobile) */}
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center space-x-2">
                          <FaDollarSign className="w-3 h-3 text-green-500" />
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(ordem.valorTotal)}
                          </span>
                        </div>
                      </td>

                      {/* Data (oculta em mobile pequeno) */}
                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <FaCalendar className="w-3 h-3" />
                          <span className="text-sm">{formatDate(ordem.dataAbertura)}</span>
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleFaturar(ordem.id)}
                            disabled={ordem.status === 'faturada'}
                            className={`inline-flex items-center p-2 rounded-xl transition-all duration-200 cursor-pointer ${ordem.status === 'faturada'
                                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                : 'text-green-600 bg-green-50 hover:bg-green-100 hover:shadow-sm transform hover:scale-110'
                              }`}
                            title={ordem.status === 'faturada' ? 'OS já faturada' : 'Faturar OS'}
                          >
                            <FaFileInvoiceDollar className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditarOrdem(ordem)}
                            className="inline-flex items-center p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 cursor-pointer hover:shadow-sm transform hover:scale-110"
                            title="Editar OS"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 sm:px-6 py-12 sm:py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <FaTools className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                          {searchTerm || statusFilter !== 'todos' ? 'Nenhuma ordem encontrada' : 'Nenhuma ordem de serviço'}
                        </h3>
                        <p className="text-gray-500 text-sm sm:text-base mb-4 text-center">
                          {searchTerm || statusFilter !== 'todos'
                            ? 'Tente ajustar os filtros ou termos da busca.'
                            : 'Comece criando sua primeira ordem de serviço.'
                          }
                        </p>
                        {(searchTerm || statusFilter !== 'todos') ? (
                          <button
                            onClick={clearFilters}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 font-medium"
                          >
                            Limpar filtros
                          </button>
                        ) : (
                          <button
                            onClick={handleNovaOrdem}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                          >
                            Criar primeira OS
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer com contador */}
          {filteredOrdens.length > 0 && (
            <div className="px-4 sm:px-6 py-3 bg-gray-50/80 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
                <span className="font-medium">
                  {filteredOrdens.length} de {ordens.length} ordem(ns)
                  {searchTerm && ' encontrada(s)'}
                  {statusFilter !== 'todos' && ` com status "${statusFilter}"`}
                </span>
                {(searchTerm || statusFilter !== 'todos') && (
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 mt-1 sm:mt-0"
                  >
                    <FaFilter className="w-3 h-3" />
                    <span>Limpar filtros</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <OrdemServicoModal
          onClose={() => setShowModal(false)}
          onSaved={fetchOrdens}
          ordem={selectedOrdem}
        />
      )}
    </div>
  );
}