'use client';

import api from '@/lib/api';
import { useState } from 'react';
import { FiX, FiSave, FiType, FiCalendar, FiHash, FiCode, FiSettings, FiFileText } from 'react-icons/fi';
import { FaPallet, FaGauge, FaCarRear } from "react-icons/fa6";

export default function VeiculoForm({ clienteId, onCreated, onClose }: any) {
  const [form, setForm] = useState({
    cliente_id: clienteId,
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

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...form,
        cliente_id: Number(clienteId),
        ano: Number(form.ano),
        quilometragem: form.quilometragem ? Number(form.quilometragem) : undefined,
        motor: form.motor || undefined,
        observacoes: form.observacoes || undefined,
      };

      const response = await api.post('/veiculos', submitData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      onCreated();
      onClose();

      return response.data;

    } catch (error: any) {
      console.error('Erro ao criar veículo:', error);

      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        alert(`Erro ${error.response.status}: ${error.response.data?.message || 'Erro ao criar veículo'}`);
      } else if (error.request) {
        console.error('Sem resposta do servidor:', error.request);
        alert('Erro de conexão. Verifique se o servidor está rodando.');
      } else {
        console.error('Erro:', error.message);
        alert('Erro ao criar veículo: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl my-4 sm:my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <FaCarRear className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Novo Veículo</h2>
                <p className="text-blue-100 text-xs sm:text-sm">Cadastre um novo veículo para o cliente</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded sm:rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
              disabled={loading}
            >
              <FiX size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Marca */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FiType className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                  Marca *
                </label>
                <div className="relative">
                  <input
                    name="marca"
                    placeholder="Ex: Volkswagen, Ford, Chevrolet..."
                    value={form.marca}
                    onChange={handleChange}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base disabled:bg-gray-50"
                    required
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <FiType className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Modelo */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FaCarRear className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                  Modelo *
                </label>
                <div className="relative">
                  <input
                    name="modelo"
                    placeholder="Ex: Gol, Onix, HB20..."
                    value={form.modelo}
                    onChange={handleChange}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base disabled:bg-gray-50"
                    required
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <FaCarRear className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Ano */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FiCalendar className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                  Ano *
                </label>
                <div className="relative">
                  <input
                    name="ano"
                    type="number"
                    placeholder="Ex: 2023"
                    value={form.ano}
                    onChange={handleChange}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base disabled:bg-gray-50"
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

              {/* Placa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FiHash className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                  Placa *
                </label>
                <div className="relative">
                  <input
                    name="placa"
                    placeholder="Ex: ABC1D23"
                    value={form.placa}
                    onChange={handleChange}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base uppercase disabled:bg-gray-50"
                    required
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <FiHash className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Chassi */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FiCode className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                  Chassi *
                </label>
                <div className="relative">
                  <input
                    name="chassi"
                    placeholder="Ex: 9BWZZZ377VT004251"
                    value={form.chassi}
                    onChange={handleChange}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base uppercase disabled:bg-gray-50"
                    required
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <FiCode className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Cor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FaPallet className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                  Cor *
                </label>
                <div className="relative">
                  <input
                    name="cor"
                    placeholder="Ex: Preto, Branco, Prata..."
                    value={form.cor}
                    onChange={handleChange}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base disabled:bg-gray-50"
                    required
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <FaPallet className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Motor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FiSettings className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                  Motor
                </label>
                <div className="relative">
                  <input
                    name="motor"
                    placeholder="Ex: 1.0 Flex, 2.0 Turbo..."
                    value={form.motor}
                    onChange={handleChange}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base disabled:bg-gray-50"
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <FiSettings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Quilometragem */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FaGauge className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                  Quilometragem
                </label>
                <div className="relative">
                  <input
                    name="quilometragem"
                    type="number"
                    placeholder="Ex: 50000"
                    value={form.quilometragem}
                    onChange={handleChange}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base disabled:bg-gray-50"
                    min="0"
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <FaGauge className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                <FiFileText className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                Observações
              </label>
              <div className="relative">
                <textarea
                  name="observacoes"
                  placeholder="Observações sobre o veículo, detalhes, características especiais..."
                  value={form.observacoes}
                  onChange={handleChange}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base resize-none disabled:bg-gray-50"
                  rows={3}
                  disabled={loading}
                />
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-start pointer-events-none">
                  <FiFileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              type="button"
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer text-sm sm:text-base order-2 sm:order-1 disabled:opacity-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-200 font-medium cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base order-1 sm:order-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Cadastrando...
                </>
              ) : (
                <>
                  <FiSave className="w-3 h-3 sm:w-4 sm:h-4" />
                  Cadastrar Veículo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}