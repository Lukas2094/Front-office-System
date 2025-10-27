'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/websocket';
import api from '@/lib/api';
import { FiX, FiUser, FiTruck, FiUserCheck, FiClipboard, FiDollarSign, FiSave, FiFileText } from 'react-icons/fi';

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
  const [loading, setLoading] = useState(false);

  const socket = getSocket('/ordens');

  // Carrega clientes e funcionários
  useEffect(() => {
    Promise.all([api.get('/clientes'), api.get('/funcionarios')])
      .then(([resC, resF]) => {
        setClientes(resC.data);
        setFuncionarios(resF.data);
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

    // Se for cliente, limpa veículo
    if (name === 'cliente_id') {
      setForm((prev) => ({
        ...prev,
        cliente_id: value,
        veiculo_id: '',
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Converte apenas aqui
      const payload = {
        ...form,
        cliente_id: form.cliente_id ? Number(form.cliente_id) : null,
        veiculo_id: form.veiculo_id ? Number(form.veiculo_id) : null,
        funcionario_id: form.funcionario_id ? Number(form.funcionario_id) : null,
        valor_total: Number(form.valor_total) || 0,
      };

      if (!payload.cliente_id || !payload.veiculo_id) {
        alert('Selecione cliente e veículo válidos.');
        return;
      }

      if (isEdit) {
        await api.put(`/ordens-servico/${ordem.id}`, payload);
      } else {
        await api.post('/ordens-servico', payload);
      }

      socket.emit('refreshList');
      onSaved();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar ordem de serviço:', error);
      alert('Erro ao salvar OS. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <FiFileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {isEdit ? 'Editar OS' : 'Nova OS'}
                </h2>
                <p className="text-blue-100 text-xs">
                  {isEdit ? 'Atualize os dados' : 'Criar nova ordem de serviço'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <FiX size={14} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-4">
          <div className="space-y-4">
            {/* CLIENTE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiUser className="inline w-3 h-3 mr-1 text-gray-400" />
                Cliente *
              </label>
              <div className="relative">
                <select
                  name="cliente_id"
                  value={form.cliente_id}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white text-sm"
                  required
                >
                  <option value="">Selecione o cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <FiUser className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* VEÍCULO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiTruck className="inline w-3 h-3 mr-1 text-gray-400" />
                Veículo *
              </label>
              <div className="relative">
                <select
                  name="veiculo_id"
                  value={form.veiculo_id}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white text-sm disabled:bg-gray-50 disabled:text-gray-500"
                  required
                  disabled={!form.cliente_id || loadingVeiculos}
                >
                  {!form.cliente_id && <option>Selecione um cliente primeiro</option>}
                  {loadingVeiculos && <option>Carregando veículos...</option>}
                  {!loadingVeiculos && form.cliente_id && veiculos.length === 0 && (
                    <option>Nenhum veículo cadastrado</option>
                  )}
                  {!loadingVeiculos &&
                    veiculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.marca} {v.modelo} - {v.placa.toUpperCase()}
                      </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <FiTruck className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* FUNCIONÁRIO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiUserCheck className="inline w-3 h-3 mr-1 text-gray-400" />
                Funcionário
              </label>
              <div className="relative">
                <select
                  name="funcionario_id"
                  value={form.funcionario_id}
                  onChange={handleChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white text-sm"
                >
                  <option value="">Sem responsável</option>
                  {funcionarios.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <FiUserCheck className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* STATUS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiClipboard className="inline w-3 h-3 mr-1 text-gray-400" />
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white text-sm ${getStatusColor(form.status)}`}
              >
                <option value="aberta">Aberta</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluida">Concluída</option>
                <option value="faturada">Faturada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          {/* OBSERVAÇÕES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiFileText className="inline w-3 h-3 mr-1 text-gray-400" />
              Observações
            </label>
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-sm"
              placeholder="Descreva os serviços..."
            />
          </div>

          {/* VALOR TOTAL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiDollarSign className="inline w-3 h-3 mr-1 text-gray-400" />
              Valor Total (R$)
            </label>
            <div className="relative">
              <input
                type="number"
                name="valor_total"
                value={form.valor_total}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                min="0"
                step="0.01"
                placeholder="0,00"
              />
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">R$</span>
              </div>
            </div>
          </div>

          {/* BOTÕES */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-white bg-red-500 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm cursor-pointer"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-medium text-sm cursor-pointer flex items-center gap-1 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <FiSave className="w-3 h-3" />
                  {isEdit ? 'Salvar' : 'Criar OS'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}