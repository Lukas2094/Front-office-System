'use client';

import { useState, useMemo } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function VeiculoTable({ veiculos, onEdit }: any) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar veículos baseado no termo de busca
  const filteredVeiculos = useMemo(() => {
    if (!searchTerm.trim()) return veiculos;

    const term = searchTerm.toLowerCase().trim();
    
    return veiculos.filter((veiculo: any) => 
      veiculo.placa.toLowerCase().includes(term) ||
      veiculo.chassi.toLowerCase().includes(term) ||
      veiculo.marca.toLowerCase().includes(term) ||
      veiculo.modelo.toLowerCase().includes(term) ||
      (veiculo.cor && veiculo.cor.toLowerCase().includes(term))
    );
  }, [veiculos, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Barra de Busca */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por placa, chassi, marca, modelo ou cor..."
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
          <div className="text-sm text-gray-600 whitespace-nowrap">
            {filteredVeiculos.length} de {veiculos.length} veículo(s)
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Marca
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Modelo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ano
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Placa
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Quilometragem
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Cor
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVeiculos.length > 0 ? (
              filteredVeiculos.map((v: any, index: number) => (
                <tr 
                  key={v.id} 
                  className={`hover:bg-gray-50 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {v.marca}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">
                      {v.modelo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">
                      {v.ano}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase">
                      {v.placa}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {v.quilometragem ? `${v.quilometragem.toLocaleString()} km` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2 border border-gray-300 shadow-sm"
                        style={{ 
                          backgroundColor: v.cor?.toLowerCase() === 'branco' ? '#f8f9fa' : 
                                         v.cor?.toLowerCase() === 'preto' ? '#212529' :
                                         v.cor?.toLowerCase() === 'vermelho' ? '#dc3545' :
                                         v.cor?.toLowerCase() === 'azul' ? '#007bff' :
                                         v.cor?.toLowerCase() === 'verde' ? '#28a745' :
                                         v.cor?.toLowerCase() === 'amarelo' ? '#ffc107' :
                                         v.cor?.toLowerCase() === 'cinza' ? '#6c757d' :
                                         v.cor?.toLowerCase() === 'prata' ? '#e9ecef' :
                                         '#6c757d'
                        }}
                      ></div>
                      <span className="text-sm text-gray-700 capitalize font-medium">
                        {v.cor}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onEdit(v)}
                      className="inline-flex items-center cursor-pointer px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      title="Editar veículo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <FaSearch className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-lg font-medium text-gray-400 mb-1">
                      {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
                    </p>
                    {searchTerm && (
                      <p className="text-sm text-gray-500">
                        Tente buscar por placa, chassi, marca, modelo ou cor
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}