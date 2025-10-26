'use client';

import { useState, useMemo } from 'react';
import VeiculosModal from './VeiculosModal';
import { FaCar, FaSearch } from 'react-icons/fa';
import { Cliente } from '@/types/interfaces/Cliente';

interface ClienteTableProps {
  clientes: Cliente[];
}

export default function ClienteTable({ clientes }: ClienteTableProps) {
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar clientes baseado no termo de busca
  const filteredClientes = useMemo(() => {
    if (!searchTerm.trim()) return clientes;

    const term = searchTerm.toLowerCase().trim();
    
    return clientes.filter(cliente => 
      cliente.nome.toLowerCase().includes(term) ||
      cliente.cpf_cnpj.toLowerCase().includes(term) ||
      (cliente.email && cliente.email.toLowerCase().includes(term)) ||
      (cliente.telefone && cliente.telefone.includes(term))
    );
  }, [clientes, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="w-full overflow-hidden shadow-md rounded-xl bg-white">
      {/* Barra de Busca */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome, CPF/CNPJ, telefone ou email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Contador de resultados */}
        <div className="mt-2 text-sm text-gray-600">
          {filteredClientes.length} de {clientes.length} cliente(s) encontrado(s)
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs"
            >
              Limpar busca
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm text-gray-700">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-gray-700 uppercase text-xs tracking-wider">
              <th className="p-3 text-left rounded-tl-lg">ID</th>
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">CPF/CNPJ</th>
              <th className="p-3 text-left">Telefone</th>
              <th className="p-3 text-left">Cidade</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">CEP</th>
              <th className="p-3 text-center rounded-tr-lg">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredClientes.length > 0 ? (
              filteredClientes.map((c, index) => (
                <tr
                  key={c.id ?? `cliente-${index}`}
                  className={`border-t transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50`}
                >
                  <td className="p-3 font-medium text-gray-900">{c.id}</td>
                  <td className="p-3 font-medium text-gray-900">{c.nome}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      c.tipo === 'PF' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {c.tipo}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-sm">{c.cpf_cnpj}</td>
                  <td className="p-3">{c.telefone ?? '-'}</td>
                  <td className="p-3">{c.cidade ?? '-'}</td>
                  <td className="p-3">
                    {c.estado ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {c.estado}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="p-3">{c.cep ?? '-'}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedCliente(c)}
                      className="cursor-pointer inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition"
                    >
                      <FaCar className="text-blue-500" /> Veículos
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <FaSearch className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-lg font-medium text-gray-400">
                      {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                    </p>
                    {searchTerm && (
                      <p className="text-sm text-gray-500 mt-1">
                        Tente ajustar os termos da busca
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedCliente && (
        <VeiculosModal
          cliente={selectedCliente}
          onClose={() => setSelectedCliente(null)}
        />
      )}
    </div>
  );
}