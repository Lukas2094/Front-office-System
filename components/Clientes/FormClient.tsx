'use client';

import { useState } from 'react';
import { getSocket } from '@/lib/websocket';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // const socket = getSocket();
    // socket.emit('createCliente', form);
    onCreated(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 space-y-4 animate-fadeIn"
      >
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
          Cadastrar Novo Cliente
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-sm text-gray-600">Nome</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Ex: João da Silva"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Tipo</label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="PF">Pessoa Física</option>
              <option value="PJ">Pessoa Jurídica</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">CPF/CNPJ</label>
            <input
              name="cpf_cnpj"
              value={form.cpf_cnpj}
              onChange={handleChange}
              placeholder="000.000.000-00"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Telefone</label>
            <input
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="exemplo@email.com"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Cidade</label>
            <input
              name="cidade"
              value={form.cidade}
              onChange={handleChange}
              placeholder="Ex: São Paulo"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Estado</label>
            <input
              name="estado"
              value={form.estado}
              onChange={handleChange}
              placeholder="Ex: SP"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">CEP</label>
            <input
              name="cep"
              value={form.cep}
              onChange={handleChange}
              placeholder="00000-000"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm text-gray-600">Endereço</label>
            <input
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              placeholder="Rua, número, bairro"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-white bg-red-500 border rounded-lg hover:bg-red-600 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
