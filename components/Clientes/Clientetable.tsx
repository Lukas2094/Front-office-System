'use client';

import { useState, useMemo } from 'react';
import VeiculosModal from './VeiculosModal';
import { FaCar, FaSearch, FaUser, FaBuilding, FaPhone, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa';

interface ClienteTableProps {
  clientes: any[];
}

export default function ClienteTable({ clientes }: ClienteTableProps) {
  const [selectedCliente, setSelectedCliente] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Funções de máscara
  const aplicarMascaraCPF_CNPJ = (valor: string) => {
    if (!valor) return '';

    const apenasNumeros = valor.replace(/\D/g, '');

    if (apenasNumeros.length <= 11) {
      // CPF: 000.000.000-00
      return apenasNumeros
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14);
    } else {
      // CNPJ: 00.000.000/0000-00
      return apenasNumeros
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 18);
    }
  };

  const aplicarMascaraTelefone = (valor: string) => {
    if (!valor) return '';

    const apenasNumeros = valor.replace(/\D/g, '');

    if (apenasNumeros.length <= 10) {
      // (00) 0000-0000
      return apenasNumeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 14);
    } else {
      // (00) 00000-0000
      return apenasNumeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15);
    }
  };

  const aplicarMascaraCEP = (valor: string) => {
    if (!valor) return '';

    return valor.replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  };

  // Filtrar clientes baseado no termo de busca
  const filteredClientes = useMemo(() => {
    if (!searchTerm.trim()) return clientes;

    const term = searchTerm.toLowerCase().trim();
    const termSemMascara = term.replace(/\D/g, '');

    return clientes.filter(cliente => {
      const camposBusca = [
        cliente.nome?.toLowerCase(),
        cliente.cpf_cnpj?.replace(/\D/g, ''),
        cliente.email?.toLowerCase(),
        cliente.telefone?.replace(/\D/g, ''),
        cliente.cidade?.toLowerCase(),
        cliente.estado?.toLowerCase()
      ].filter(Boolean);

      return camposBusca.some(campo =>
        campo.includes(term) || (termSemMascara && campo.includes(termSemMascara))
      );
    });
  }, [clientes, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="w-full overflow-hidden shadow-lg rounded-2xl bg-white border border-gray-100">
      {/* Header com Busca */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaUser className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clientes</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gerencie os clientes e seus veículos
              </p>
            </div>
          </div>

          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome, CPF/CNPJ, telefone, cidade..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
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
        </div>

        {/* Contador de resultados */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-2">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span className="px-2 py-1 bg-white rounded-lg border border-gray-200 font-medium">
              {filteredClientes.length} de {clientes.length} cliente(s)
            </span>
            {searchTerm && (
              <span className="text-gray-500">
                para "<span className="font-medium text-gray-700">{searchTerm}</span>"
              </span>
            )}
          </div>

          {searchTerm && (
            <button
              onClick={clearSearch}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpar busca
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 uppercase text-xs tracking-wider border-b border-gray-200">
              <th className="p-3 sm:p-4 text-left font-semibold rounded-tl-2xl">Cliente</th>
              <th className="p-3 sm:p-4 text-left font-semibold">Documento</th>
              <th className="p-3 sm:p-4 text-left font-semibold hidden lg:table-cell">Contato</th>
              <th className="p-3 sm:p-4 text-left font-semibold hidden xl:table-cell">Localização</th>
              <th className="p-3 sm:p-4 text-center font-semibold rounded-tr-2xl">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClientes.length > 0 ? (
              filteredClientes.map((cliente, index) => (
                <tr
                  key={cliente.id ?? `cliente-${index}`}
                  className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                >
                  {/* Coluna Cliente */}
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${cliente.tipo === 'PF'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-purple-100 text-purple-600'
                        }`}>
                        {cliente.tipo === 'PF' ? <FaUser className="h-3 w-3" /> : <FaBuilding className="h-3 w-3" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {cliente.nome}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cliente.tipo === 'PF'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}>
                            {cliente.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                          </span>
                          <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                            ID: {cliente.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Coluna Documento */}
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <FaIdCard className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="font-mono text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded border">
                        {aplicarMascaraCPF_CNPJ(cliente.cpf_cnpj)}
                      </span>
                    </div>
                  </td>

                  {/* Coluna Contato (oculta em mobile) */}
                  <td className="p-3 sm:p-4 hidden lg:table-cell">
                    <div className="space-y-1">
                      {cliente.telefone && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaPhone className="h-3 w-3 text-gray-400" />
                          <span className="text-sm font-medium">
                            {aplicarMascaraTelefone(cliente.telefone)}
                          </span>
                        </div>
                      )}
                      {cliente.email && (
                        <div className="text-sm text-gray-600 truncate max-w-[200px]" title={cliente.email}>
                          {cliente.email}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Coluna Localização (oculta em tablet) */}
                  <td className="p-3 sm:p-4 hidden xl:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {cliente.cidade || 'N/A'}{cliente.estado ? `, ${cliente.estado}` : ''}
                        </span>
                      </div>
                      {cliente.cep && (
                        <div className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border">
                          {aplicarMascaraCEP(cliente.cep)}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Coluna Ações */}
                  <td className="p-3 sm:p-4 text-center">
                    <button
                      onClick={() => setSelectedCliente(cliente)}
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                      <FaCar className="h-3 w-3" />
                      <span className="hidden sm:inline">Veículos</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 sm:p-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FaSearch className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {searchTerm
                        ? 'Tente ajustar os termos da busca ou limpar os filtros.'
                        : 'Comece cadastrando seu primeiro cliente.'
                      }
                    </p>
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Limpar busca
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filteredClientes.length > 0 && (
        <div className="px-4 sm:px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500">
            <span>
              Mostrando <strong>{filteredClientes.length}</strong> de <strong>{clientes.length}</strong> clientes
            </span>
            <div className="flex items-center gap-4 mt-1 sm:mt-0">
              <span className="hidden sm:inline">💡 Dica: Use a busca para filtrar rapidamente</span>
              <span className="sm:hidden">Toque em "Veículos" para gerenciar</span>
            </div>
          </div>
        </div>
      )}

      {selectedCliente && (
        <VeiculosModal
          cliente={selectedCliente}
          onClose={() => setSelectedCliente(null)}
        />
      )}
    </div>
  );
}