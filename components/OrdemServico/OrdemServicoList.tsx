'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/websocket';
import { FaPlus, FaEdit, FaFileInvoiceDollar, FaSearch, FaCar, FaUser, FaTools } from 'react-icons/fa';
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

  useEffect(() => {
    const socket = getSocket('/ordens');

    socket.on('ordemCriada', (ordem: OrdemServico) => {
      setOrdens((prev) => [ordem, ...prev]);
    });

    socket.on('ordemAtualizada', (ordem: OrdemServico) => {
      setOrdens((prev) => prev.map((o) => (o.id === ordem.id ? ordem : o)));
    });

    socket.on('ordemFaturada', (ordem: OrdemServico) => {
      setOrdens((prev) => prev.map((o) => (o.id === ordem.id ? ordem : o)));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Filtrar ordens baseado no termo de busca
  const filteredOrdens = ordens.filter(ordem =>
    ordem.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.veiculo?.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.veiculo?.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.funcionario?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ordem.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      aberta: 'bg-blue-100 text-blue-800 border-blue-200',
      em_andamento: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      concluida: 'bg-green-100 text-green-800 border-green-200',
      faturada: 'bg-purple-100 text-purple-800 border-purple-200',
      cancelada: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaTools className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Ordens de Serviço</h1>
                <p className="text-gray-600 text-sm">Gerencie todas as ordens de serviço da oficina</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Barra de Busca */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por cliente, veículo, placa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full sm:w-64"
                />
              </div>

              <button
                onClick={handleNovaOrdem}
                className="flex items-center cursor-pointer justify-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-medium shadow-sm"
              >
                <FaPlus className="mr-2" /> Nova OS
              </button>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    OS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Veículo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrdens.length > 0 ? (
                  filteredOrdens.map((ordem, index) => (
                    <tr 
                      key={ordem.id} 
                      className={`hover:bg-gray-50 transition-colors duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">#{ordem.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaUser className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {ordem.cliente?.nome}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaCar className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <span className="text-sm text-gray-900 block">{ordem.veiculo?.modelo}</span>
                            <span className="text-xs text-gray-500 uppercase">{ordem.veiculo?.placa}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${ordem.funcionario ? 'text-gray-900' : 'text-gray-400'}`}>
                          {ordem.funcionario?.nome || 'Não atribuído'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(ordem.status)}`}>
                          {ordem.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(ordem.valorTotal)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {formatDate(ordem.dataAbertura)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleFaturar(ordem.id)}
                            className="inline-flex items-center p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 cursor-pointer"
                            title="Faturar OS"
                          >
                            <FaFileInvoiceDollar className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditarOrdem(ordem)}
                            className="inline-flex items-center p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 cursor-pointer"
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
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FaTools className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-400 mb-1">
                          {searchTerm ? 'Nenhuma ordem encontrada' : 'Nenhuma ordem de serviço'}
                        </p>
                        {searchTerm ? (
                          <p className="text-sm text-gray-500">
                            Tente ajustar os termos da busca
                          </p>
                        ) : (
                          <button
                            onClick={handleNovaOrdem}
                            className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Criar primeira ordem de serviço
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
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {filteredOrdens.length} de {ordens.length} ordem(ns)
                  {searchTerm && ' encontrada(s)'}
                </span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Limpar busca
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