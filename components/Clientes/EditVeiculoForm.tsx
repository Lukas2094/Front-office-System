'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { getSocket } from '@/lib/websocket';
import { FiX, FiSave, FiType, FiCalendar, FiHash, FiCode, FiSettings, FiFileText } from 'react-icons/fi';
import { FaCar, FaGauge, FaPalette } from 'react-icons/fa6';

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

  // Máscaras para os campos
  const aplicarMascaraPlaca = (valor: string) => {
    let placa = valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7);
    if (placa.length > 3) {
      placa = placa.slice(0, 3) + placa.slice(3);
    }
    return placa;
  };

  const aplicarMascaraChassi = (valor: string) => {
    return valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 17);
  };

  const aplicarMascaraQuilometragem = (valor: string) => {
    return valor.replace(/[^\d]/g, '');
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    let valorFormatado = value;

    switch (name) {
      case 'placa':
        valorFormatado = aplicarMascaraPlaca(value);
        break;
      case 'chassi':
        valorFormatado = aplicarMascaraChassi(value);
        break;
      case 'quilometragem':
        valorFormatado = aplicarMascaraQuilometragem(value);
        break;
      case 'ano':
        const ano = parseInt(value) || '';
        if (ano && (ano < 1900 || ano > 2030)) {
          return;
        }
        valorFormatado = value;
        break;
      default:
        valorFormatado = value;
    }

    setForm({ ...form, [name]: valorFormatado });
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

      if (Object.keys(submitData).length === 0) {
        onClose();
        return;
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl w-full max-w-2xl mx-2 sm:mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 sm:p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <FaCar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Editar Veículo</h2>
                <p className="text-blue-100 text-xs sm:text-sm">
                  {veiculo.placa} - {veiculo.marca} {veiculo.modelo}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
              disabled={loading}
            >
              <FiX size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Form - Container com scroll */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Coluna 1 */}
              <div className="space-y-3 sm:space-y-4">
                {/* Marca */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    <FiType className="inline w-4 h-4 mr-1 text-gray-400" />
                    Marca *
                  </label>
                  <div className="relative">
                    <input
                      name="marca"
                      placeholder="Ex: Volkswagen, Toyota, Honda..."
                      value={form.marca}
                      onChange={handleChange}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 text-sm sm:text-base"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <FiType className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Modelo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    <FaCar className="inline w-4 h-4 mr-1 text-gray-400" />
                    Modelo *
                  </label>
                  <div className="relative">
                    <input
                      name="modelo"
                      placeholder="Ex: Gol, Corolla, Civic..."
                      value={form.modelo}
                      onChange={handleChange}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 text-sm sm:text-base"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <FaCar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Ano */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    <FiCalendar className="inline w-4 h-4 mr-1 text-gray-400" />
                    Ano *
                  </label>
                  <div className="relative">
                    <input
                      name="ano"
                      type="number"
                      placeholder="Ex: 2023"
                      value={form.ano}
                      onChange={handleChange}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 text-sm sm:text-base"
                      min="1900"
                      max="2030"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna 2 */}
              <div className="space-y-3 sm:space-y-4">
                {/* Placa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    <FiHash className="inline w-4 h-4 mr-1 text-gray-400" />
                    Placa *
                  </label>
                  <div className="relative">
                    <input
                      name="placa"
                      placeholder="ABC1D23"
                      value={form.placa}
                      onChange={handleChange}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono uppercase disabled:bg-gray-50 text-sm sm:text-base"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <FiHash className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Formato: ABC1D23 ou ABC1234</p>
                </div>

                {/* Chassi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    <FiCode className="inline w-4 h-4 mr-1 text-gray-400" />
                    Chassi (VIN) *
                  </label>
                  <div className="relative">
                    <input
                      name="chassi"
                      placeholder="9BWZZZ377VT004251"
                      value={form.chassi}
                      onChange={handleChange}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono uppercase disabled:bg-gray-50 text-sm sm:text-base"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <FiCode className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">17 caracteres alfanuméricos</p>
                </div>

                {/* Cor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    <FaPalette className="inline w-4 h-4 mr-1 text-gray-400" />
                    Cor *
                  </label>
                  <div className="relative">
                    <input
                      name="cor"
                      placeholder="Ex: Preto, Branco, Prata..."
                      value={form.cor}
                      onChange={handleChange}
                      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 text-sm sm:text-base"
                      required
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <FaPalette className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Campos em linha única */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">
              {/* Motor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FiSettings className="inline w-4 h-4 mr-1 text-gray-400" />
                  Motor
                </label>
                <div className="relative">
                  <input
                    name="motor"
                    placeholder="Ex: 1.0 Flex, 2.0 Turbo..."
                    value={form.motor}
                    onChange={handleChange}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 text-sm sm:text-base"
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <FiSettings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Quilometragem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FaGauge className="inline w-4 h-4 mr-1 text-gray-400" />
                  Quilometragem
                </label>
                <div className="relative">
                  <input
                    name="quilometragem"
                    type="text"
                    placeholder="Ex: 50000"
                    value={form.quilometragem}
                    onChange={handleChange}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50 text-sm sm:text-base"
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <FaGauge className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Apenas números</p>
              </div>
            </div>

            {/* Observações */}
            <div className="mt-4 sm:mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                <FiFileText className="inline w-4 h-4 mr-1 text-gray-400" />
                Observações
              </label>
              <div className="relative">
                <textarea
                  name="observacoes"
                  placeholder="Observações sobre o veículo, detalhes, características especiais..."
                  value={form.observacoes}
                  onChange={handleChange}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none disabled:bg-gray-50 text-sm sm:text-base"
                  rows={3}
                  disabled={loading}
                />
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-start pointer-events-none">
                  <FiFileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                type="button"
                className="order-2 sm:order-1 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer disabled:opacity-50 text-sm sm:text-base"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="order-1 sm:order-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-medium cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base mb-2 sm:mb-0"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Atualizando...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Atualizar Veículo
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