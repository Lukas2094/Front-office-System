'use client';

import { useState } from 'react';
import { getSocket } from '@/lib/websocket';
import { FiX, FiUser, FiUserCheck, FiMail, FiPhone, FiMapPin, FiHome, FiSave, FiFileText } from 'react-icons/fi';

export default function ClienteForm({ onClose, onCreated }: any) {
  const [form, setForm] = useState({
    nome: '',
    tipo: 'PF',
    cpf_cnpj: '',
    telefone: '',
    email: '',
    cidade: '',
    estado: '',
    cep: '',
    endereco: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simula um processamento rápido
      await new Promise(resolve => setTimeout(resolve, 500));

      // const socket = getSocket();
      // socket.emit('createCliente', form);
      onCreated(form);
      onClose();
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
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
                <FiUser className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Cadastrar Novo Cliente</h2>
                <p className="text-blue-100 text-xs sm:text-sm">Preencha os dados do cliente</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded sm:rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <FiX size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                <FiUser className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                Nome Completo *
              </label>
              <div className="relative">
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Ex: João da Silva"
                  required
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                />
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FiUserCheck className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                  Tipo de Pessoa *
                </label>
                <div className="relative">
                  <select
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white text-sm sm:text-base"
                  >
                    <option value="PF">Pessoa Física</option>
                    <option value="PJ">Pessoa Jurídica</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <FiUserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* CPF/CNPJ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FiFileText className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                  {form.tipo === 'PF' ? 'CPF' : 'CNPJ'} *
                </label>
                <div className="relative">
                  <input
                    name="cpf_cnpj"
                    value={form.cpf_cnpj}
                    onChange={handleChange}
                    placeholder={form.tipo === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                    required
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                  />
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <FiFileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FiPhone className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                  Telefone
                </label>
                <div className="relative">
                  <input
                    name="telefone"
                    value={form.telefone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                  />
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <FiPhone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FiMail className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="exemplo@email.com"
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                  />
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <FiMail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Cidade */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FiMapPin className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                  Cidade
                </label>
                <div className="relative">
                  <input
                    name="cidade"
                    value={form.cidade}
                    onChange={handleChange}
                    placeholder="Ex: São Paulo"
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                  />
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FiMapPin className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                  Estado
                </label>
                <input
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  placeholder="SP"
                  maxLength={2}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors uppercase text-sm sm:text-base"
                />
              </div>
            </div>

            {/* CEP */}
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                <FiMapPin className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                CEP
              </label>
              <input
                name="cep"
                value={form.cep}
                onChange={handleChange}
                placeholder="00000-000"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
              />
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                <FiHome className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                Endereço Completo
              </label>
              <div className="relative">
                <input
                  name="endereco"
                  value={form.endereco}
                  onChange={handleChange}
                  placeholder="Rua, número, bairro, complemento"
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                />
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <FiHome className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer text-sm sm:text-base order-2 sm:order-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-medium cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base order-1 sm:order-2"
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
                  Cadastrar Cliente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}