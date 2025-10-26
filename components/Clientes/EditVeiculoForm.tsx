'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { getSocket } from '@/lib/websocket';

export default function EditVeiculoForm({ veiculo, onUpdated, onClose }: any) {
  const [form, setForm] = useState({
    marca: '',
    modelo: '',
    ano: '',
    placa: '',
    chassi: '',
    cor: '',
    motor: '',
    quilometragem: '',
    observacoes: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (veiculo) {
      setForm({
        marca: veiculo.marca || '',
        modelo: veiculo.modelo || '',
        ano: veiculo.ano?.toString() || '',
        placa: veiculo.placa || '',
        chassi: veiculo.chassi || '',
        cor: veiculo.cor || '',
        motor: veiculo.motor || '',
        quilometragem: veiculo.quilometragem?.toString() || '',
        observacoes: veiculo.observacoes || '',
      });
    }
  }, [veiculo]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData: any = {};
      if (form.marca !== veiculo.marca) submitData.marca = form.marca;
      if (form.modelo !== veiculo.modelo) submitData.modelo = form.modelo;
      if (Number(form.ano) !== veiculo.ano) submitData.ano = Number(form.ano);
      if (form.placa !== veiculo.placa) submitData.placa = form.placa;
      if (form.chassi !== veiculo.chassi) submitData.chassi = form.chassi;
      if (form.cor !== veiculo.cor) submitData.cor = form.cor;
      if (form.motor !== veiculo.motor) submitData.motor = form.motor || undefined;
      if (Number(form.quilometragem) !== veiculo.quilometragem) {
        submitData.quilometragem = form.quilometragem ? Number(form.quilometragem) : undefined;
      }
      if (form.observacoes !== veiculo.observacoes) {
        submitData.observacoes = form.observacoes || undefined;
      }

      const response = await api.put(`/veiculos/${veiculo.id}`, submitData);

      const socket = getSocket(); 
      socket.emit('veiculoAtualizado', response.data);
      socket.emit('atualizarListaVeiculosCliente', {
        clienteId: veiculo.cliente.id || veiculo.cliente_id,
        veiculo: response.data
      });

      onUpdated();
      onClose();
      
    } catch (error: any) {
      console.error('Erro ao atualizar veículo:', error);
      
      if (error.response) {
        alert(`Erro ${error.response.status}: ${error.response.data?.message || 'Erro ao atualizar veículo'}`);
      } else if (error.request) {
        alert('Erro de conexão. Verifique se o servidor está rodando.');
      } else {
        alert('Erro ao atualizar veículo: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!veiculo) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Editar Veículo</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coluna 1 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <input
                  name="marca"
                  placeholder="Ex: Volkswagen"
                  value={form.marca}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo *
                </label>
                <input
                  name="modelo"
                  placeholder="Ex: Gol"
                  value={form.modelo}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ano *
                </label>
                <input
                  name="ano"
                  type="number"
                  placeholder="Ex: 2023"
                  value={form.ano}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="1900"
                  max="2030"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa *
                </label>
                <input
                  name="placa"
                  placeholder="Ex: ABC1D23"
                  value={form.placa}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chassi *
                </label>
                <input
                  name="chassi"
                  placeholder="Ex: 9BWZZZ377VT004251"
                  value={form.chassi}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Coluna 2 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor *
                </label>
                <input
                  name="cor"
                  placeholder="Ex: Preto"
                  value={form.cor}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motor
                </label>
                <input
                  name="motor"
                  placeholder="Ex: 1.0 Flex"
                  value={form.motor}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quilometragem
                </label>
                <input
                  name="quilometragem"
                  placeholder="Ex: 50000"
                  value={form.quilometragem}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Observações - Full width */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              name="observacoes"
              placeholder="Observações sobre o veículo..."
              value={form.observacoes}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              type="button"
              className="px-6 py-2 border border-gray-300 text-white bg-red-500 cursor-pointer rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 cursor-pointer text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Atualizando...
                </>
              ) : (
                'Atualizar Veículo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}