'use client';

import { useState, useMemo } from 'react';
import { FaSearch, FaCar, FaEdit, FaTachometerAlt, FaPalette } from 'react-icons/fa';

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

  const getColorStyle = (cor: string) => {
    const colorMap: { [key: string]: string } = {
      'branco': '#f8f9fa',
      'preto': '#212529',
      'vermelho': '#dc3545',
      'azul': '#007bff',
      'verde': '#28a745',
      'amarelo': '#ffc107',
      'laranja': '#fd7e14',
      'roxo': '#6f42c1',
      'rosa': '#e83e8c',
      'cinza': '#6c757d',
      'prata': '#e9ecef',
      'dourado': '#ffd700',
      'marrom': '#8b4513',
      'bege': '#f5f5dc'
    };

    return colorMap[cor?.toLowerCase()] || '#6c757d';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header com Busca */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-sm">
              <FaCar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Veículos Cadastrados</h3>
              <p className="text-sm text-gray-600">Gerencie a frota de veículos dos clientes</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 min-w-[280px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por placa, chassi, marca, modelo ou cor..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80 backdrop-blur-sm"
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
            <div className="text-sm text-gray-600 whitespace-nowrap bg-white/60 px-3 py-2 rounded-lg border border-gray-200/50">
              <span className="font-medium text-gray-700">{filteredVeiculos.length}</span> de {veiculos.length} veículo(s)
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="ml-2 text-blue-600 hover:text-blue-800 font-medium text-xs"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FaCar className="w-3 h-3" />
                  Marca/Modelo
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ano
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Placa
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FaTachometerAlt className="w-3 h-3" />
                  Quilometragem
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FaPalette className="w-3 h-3" />
                  Cor
                </div>
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredVeiculos.length > 0 ? (
              filteredVeiculos.map((v: any, index: number) => (
                <tr
                  key={v.id}
                  className={`group hover:bg-blue-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shadow-sm">
                        <FaCar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {v.marca}
                        </div>
                        <div className="text-sm text-gray-600">
                          {v.modelo}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      {v.ano}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm uppercase tracking-wide">
                      {v.placa}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FaTachometerAlt className="w-3 h-3 text-gray-400" />
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        {v.quilometragem ? `${v.quilometragem.toLocaleString()} km` : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                        style={{
                          backgroundColor: getColorStyle(v.cor)
                        }}
                        title={v.cor}
                      ></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {v.cor}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => onEdit(v)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium text-sm transition-all duration-200 transform hover:scale-105 shadow-sm cursor-pointer group/btn"
                        title="Editar veículo"
                      >
                        <FaEdit className="w-3 h-3 group-hover/btn:scale-110 transition-transform" />
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                      <FaCar className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-xl font-medium text-gray-500 mb-2">
                      {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
                    </p>
                    <p className="text-sm text-gray-400 max-w-sm">
                      {searchTerm
                        ? 'Tente ajustar os termos da busca por placa, chassi, marca, modelo ou cor'
                        : 'Comece cadastrando o primeiro veículo para um cliente'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer com informações */}
      {filteredVeiculos.length > 0 && (
        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Mostrando <span className="font-semibold text-gray-700">{filteredVeiculos.length}</span> veículos
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Placa do veículo
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Quilometragem
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}