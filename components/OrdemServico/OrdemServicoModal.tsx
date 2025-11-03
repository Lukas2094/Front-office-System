'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/websocket';
import api from '@/lib/api';
import { FiX, FiUser, FiTruck, FiUserCheck, FiClipboard, FiDollarSign, FiSave, FiFileText, FiTool, FiPlus, FiCalendar } from 'react-icons/fi';
import ServicosOsList from '../ServicosOS/ServicosOsList';
import ServicoOsModal from '../ServicosOS/ServicoOsModal';

interface OrdemServicoModalProps {
  onClose: () => void;
  onSaved: () => void;
  ordem?: any;
}

export default function OrdemServicoModal({ onClose, onSaved, ordem }: OrdemServicoModalProps) {
  const isEdit = !!ordem;

  const [form, setForm] = useState({
    cliente_id: ordem?.cliente?.id || '',
    veiculo_id: ordem?.veiculo?.id || '',
    funcionario_id: ordem?.funcionario?.id || '',
    status: ordem?.status || 'aberta',
    observacoes: ordem?.observacoes || '',
    valor_total: ordem?.valorTotal || 0,
  });

  const [clientes, setClientes] = useState<any[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [loadingVeiculos, setLoadingVeiculos] = useState(false);
  const [showServicosModal, setShowServicosModal] = useState(false);
  const [servicoModalData, setServicoModalData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/clientes'), api.get('/funcionarios')])
      .then(([resC, resF]) => {
        setClientes(resC.data);
        setFuncionarios(resF.data);

        if (isEdit && ordem?.cliente?.id) {
          loadVeiculosByCliente(ordem.cliente.id);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (form.cliente_id) {
      loadVeiculosByCliente(form.cliente_id);
    }
  }, [form.cliente_id]);

  const loadVeiculosByCliente = async (clienteId: string | number) => {
    try {
      setLoadingVeiculos(true);
      const res = await api.get(`/clientes/${clienteId}/veiculos`);
      setVeiculos(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar veículos do cliente:', err);
      setVeiculos([]);
    } finally {
      setLoadingVeiculos(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    const numericFields = ['cliente_id', 'veiculo_id', 'funcionario_id', 'valor_total'];

    setForm((prev) => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? value === '' ? '' : Number(value)
        : value,
      // Quando muda o cliente, limpa o veículo selecionado
      ...(name === 'cliente_id' ? { veiculo_id: '' } : {}),
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        cliente_id: Number(form.cliente_id),
        veiculo_id: Number(form.veiculo_id),
        funcionario_id: form.funcionario_id ? Number(form.funcionario_id) : null,
        valor_total: Number(form.valor_total),
      };

      if (isNaN(payload.cliente_id) || isNaN(payload.veiculo_id) || payload.veiculo_id === 0) {
        alert('Selecione cliente e veículo válidos.');
        return;
      }

      let response;
      if (isEdit) {
        response = await api.put(`/ordens-servico/${ordem.id}`, payload);
        console.log('✅ Ordem atualizada:', response.data);

        const socket = getSocket('/ordens');
        socket.emit('updateOrdem', {
          id: ordem.id,
          data: payload
        });
        console.log('📤 WebSocket: updateOrdem emitido');

      } else {
        response = await api.post('/ordens-servico', payload);
        console.log('✅ Ordem criada:', response.data);

        const socket = getSocket('/ordens');
        socket.emit('createOrdem', payload);
        console.log('📤 WebSocket: createOrdem emitido');
      }

      onSaved();
      onClose();

    } catch (error) {
      console.error('Erro ao salvar ordem de serviço:', error);
      alert('Erro ao salvar OS. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleNovoServico = () => {
    const novoServicoData = {
      ordem_id: ordem.id,
      descricao: '',
      quantidade: 1,
      valor_unitario: 0,
      tipo: 'servico'
    };

    setServicoModalData(novoServicoData);
    setShowServicosModal(true);
  };

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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FiTool className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  {isEdit ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm">
                  {isEdit ? `OS #${ordem.id} - ${ordem.cliente?.nome}` : 'Criar nova ordem de serviço'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-105"
            >
              <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Grid de Campos Principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* CLIENTE */}
              <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Cliente *</span>
                </label>
                <div className="relative">
                  <select
                    name="cliente_id"
                    value={form.cliente_id}
                    onChange={handleChange}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white text-sm font-medium"
                    required
                  >
                    <option value="">Selecione o cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome} {c.cpf_cnpj ? `- ${c.cpf_cnpj}` : ''}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FiUser className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* VEÍCULO */}
              <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FiTruck className="w-4 h-4 text-orange-600" />
                  </div>
                  <span>Veículo *</span>
                </label>
                <div className="relative">
                  <select
                    name="veiculo_id"
                    value={form.veiculo_id}
                    onChange={handleChange}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white text-sm font-medium disabled:bg-gray-100 disabled:text-gray-500"
                    required
                    disabled={!form.cliente_id || loadingVeiculos}
                  >
                    <option value="">Selecione um veículo</option>
                    {!form.cliente_id && <option value="">Selecione um cliente primeiro</option>}
                    {loadingVeiculos && <option value="">Carregando veículos...</option>}
                    {!loadingVeiculos && form.cliente_id && veiculos.length === 0 && (
                      <option value="">Nenhum veículo cadastrado</option>
                    )}
                    {!loadingVeiculos &&
                      veiculos.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.marca} {v.modelo} - {v.placa.toUpperCase()}
                        </option>
                      ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FiTruck className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                {loadingVeiculos && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Carregando veículos...
                  </div>
                )}
              </div>

              {/* FUNCIONÁRIO */}
              <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiUserCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <span>Responsável</span>
                </label>
                <div className="relative">
                  <select
                    name="funcionario_id"
                    value={form.funcionario_id}
                    onChange={handleChange}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white text-sm font-medium"
                  >
                    <option value="">Sem responsável</option>
                    {funcionarios.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nome}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FiUserCheck className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* STATUS */}
              <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiClipboard className="w-4 h-4 text-purple-600" />
                  </div>
                  <span>Status</span>
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={`w-full pl-4 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none text-sm font-medium ${getStatusColor(form.status)}`}
                  >
                    <option value="aberta">🟦 Aberta</option>
                    <option value="em_andamento">🟨 Em Andamento</option>
                    <option value="concluida">🟩 Concluída</option>
                    <option value="faturada">🟪 Faturada</option>
                    <option value="cancelada">🟥 Cancelada</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FiClipboard className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* OBSERVAÇÕES */}
            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FiFileText className="w-4 h-4 text-gray-600" />
                </div>
                <span>Observações</span>
              </label>
              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-sm bg-white"
                placeholder="Descreva os serviços a serem realizados, observações importantes, problemas identificados..."
              />
            </div>

            {/* VALOR TOTAL */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <FiDollarSign className="w-4 h-4 text-white" />
                </div>
                <span>Valor Total</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="valor_total"
                  value={form.valor_total}
                  onChange={handleChange}
                  className="w-full pl-12 pr-24 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white text-sm font-semibold"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-green-600 font-bold">R$</span>
                </div>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-green-600 text-sm font-medium">
                    {form.valor_total ? formatCurrency(Number(form.valor_total)) : '0,00'}
                  </span>
                </div>
              </div>
            </div>

            {/* BOTÕES */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 font-semibold cursor-pointer hover:shadow-lg transform hover:scale-105 active:scale-95"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-semibold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">
                      {isEdit ? 'Salvando...' : 'Criando...'}
                    </span>
                    <span className="sm:hidden">Processando...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    <span>{isEdit ? 'Salvar Alterações' : 'Criar Ordem'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* SEÇÃO DE SERVIÇOS DA OS */}
          {isEdit && (
            <div className="border-t border-gray-200 mx-4 sm:mx-6 pt-6">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 sm:p-6 border border-amber-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <FiTool className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">Serviços da OS</h3>
                      <p className="text-amber-700 text-sm">Gerencie os serviços desta ordem</p>
                    </div>
                  </div>
                  <button
                    onClick={handleNovoServico}
                    className="flex items-center cursor-pointer justify-center bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  >
                    <FiPlus className="mr-2 w-4 h-4" />
                    <span>Adicionar Serviço</span>
                  </button>
                </div>

                <ServicosOsList ordemId={ordem.id} />
              </div>
            </div>
          )}
        </div>
      </div>

      {showServicosModal && servicoModalData && (
        <ServicoOsModal
          data={servicoModalData}
          onClose={() => {
            setShowServicosModal(false);
            setServicoModalData(null);
          }}
          onSaved={() => {
            console.log('✅ Serviço salvo - WebSocket vai atualizar a lista');
            setShowServicosModal(false);
            setServicoModalData(null);
          }}
        />
      )}
    </div>
  );
}