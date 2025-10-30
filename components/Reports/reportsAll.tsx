'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { FiFileText, FiDollarSign, FiTrendingUp, FiFilter, FiDownload, FiCalendar, FiBarChart2, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

export default function Reports() {
    const [abaAtiva, setAbaAtiva] = useState<'ordens' | 'financeiro' | 'produtividade'>('ordens');
    const [dados, setDados] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filtro, setFiltro] = useState({
        dataInicio: '',
        dataFim: '',
    });

    const abas = [
        { key: 'ordens' as const, label: 'Ordens de Serviço', icon: FiFileText, color: 'blue' },
        { key: 'financeiro' as const, label: 'Financeiro', icon: FiDollarSign, color: 'green' },
        // { key: 'produtividade' as const, label: 'Produtividade', icon: FiTrendingUp, color: 'purple' },
    ];

    // Funções de máscara
    const mascaras = {
        // Máscara para placa de veículo (ABC-1D23)
        placa: (valor: string): string => {
            if (!valor) return '-';

            const placaLimpa = String(valor).toUpperCase().replace(/[^A-Z0-9]/g, '');

            if (placaLimpa.length === 7) {
                // Formato Mercosul: ABC1D23 → ABC-1D23
                return `${placaLimpa.slice(0, 3)}-${placaLimpa.slice(3)}`;
            } else if (placaLimpa.length <= 7) {
                // Formato antigo ou incompleto
                return placaLimpa;
            }

            return valor;
        },

        // Máscara para status (capitaliza e traduz)
        status: (valor: string): string => {
            if (!valor) return '-';

            const statusMap: Record<string, string> = {
                'pendente': 'Pendente',
                'confirmado': 'Confirmado',
                'concluido': 'Concluído',
                'cancelado': 'Cancelado',
                'active': 'Ativo',
                'inactive': 'Inativo',
                'completed': 'Concluído',
                'pending': 'Pendente',
                'cancelled': 'Cancelado'
            };

            const valorLower = String(valor).toLowerCase().trim();
            return statusMap[valorLower] || String(valor).charAt(0).toUpperCase() + String(valor).slice(1);
        },

        // Máscara para data (DD/MM/AAAA)
        data: (valor: any): string => {
            if (!valor) return '-';

            try {
                // Tenta converter para Date
                const data = new Date(valor);

                // Verifica se é uma data válida
                if (isNaN(data.getTime())) {
                    return String(valor);
                }

                // Formata para DD/MM/AAAA
                return data.toLocaleDateString('pt-BR');
            } catch {
                return String(valor);
            }
        },

        // Máscara para data e hora (DD/MM/AAAA HH:MM)
        dataHora: (valor: any): string => {
            if (!valor) return '-';

            try {
                const data = new Date(valor);

                if (isNaN(data.getTime())) {
                    return String(valor);
                }

                return data.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch {
                return String(valor);
            }
        },

        // Máscara para valor em reais (R$ 1.234,56)
        real: (valor: any): string => {
            if (valor === null || valor === undefined || valor === '') return '-';

            // Converte para número
            const numero = typeof valor === 'string' ?
                parseFloat(valor.replace(/[^\d,-]/g, '').replace(',', '.')) :
                Number(valor);

            if (isNaN(numero)) {
                return String(valor);
            }

            // Formata como moeda brasileira
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(numero);
        },

        // Máscara para números com separadores (1.234,56)
        numero: (valor: any): string => {
            if (valor === null || valor === undefined || valor === '') return '-';

            const numero = typeof valor === 'string' ?
                parseFloat(valor.replace(/[^\d,-]/g, '').replace(',', '.')) :
                Number(valor);

            if (isNaN(numero)) {
                return String(valor);
            }

            return new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numero);
        }
    };

    // Função segura para formatar valores com máscaras inteligentes
    // Função segura para formatar valores com máscaras inteligentes
    const formatarValor = (valor: any, chave: string = ''): string => {
        if (valor === null || valor === undefined || valor === '') return '-';

        const chaveLower = chave.toLowerCase().trim();

        // 🚗 Placa de veículo
        if (chaveLower.includes('placa')) {
            const placa = String(valor).toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (placa.length === 7) {
                return `${placa.slice(0, 3)}-${placa.slice(3)}`;
            }
            return placa || '-';
        }

        // 📊 Status formatado
        if (chaveLower.includes('status') || chaveLower.includes('situacao')) {
            const map: Record<string, string> = {
                'pendente': 'Pendente',
                'em_andamento': 'Em Andamento',
                'andamento': 'Em Andamento',
                'concluido': 'Concluído',
                'concluida': 'Concluída',
                'faturado': 'Faturado',
                'cancelado': 'Cancelado',
                'cancelada': 'Cancelada',
                'ativo': 'Ativo',
                'inativo': 'Inativo',
                'finalizado': 'Finalizado',
                'completed': 'Concluído',
                'pending': 'Pendente',
                'cancelled': 'Cancelado',
            };

            const normalized = String(valor).toLowerCase().trim();
            return map[normalized] || normalized.charAt(0).toUpperCase() + normalized.slice(1);
        }

        // 📅 Data com hora
        if (chaveLower.includes('data') && (chaveLower.includes('hora') || chaveLower.includes('atualizacao'))) {
            const data = new Date(valor);
            if (!isNaN(data.getTime())) {
                return data.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            return String(valor);
        }

        // 📆 Somente data
        if (chaveLower.includes('data')) {
            const data = new Date(valor);
            if (!isNaN(data.getTime())) {
                return data.toLocaleDateString('pt-BR');
            }
            return String(valor);
        }

        // 💰 Valores monetários
        if (chaveLower.includes('valor') || chaveLower.includes('preco') || chaveLower.includes('total') || chaveLower.includes('custo')) {
            const numero = parseFloat(String(valor).replace(/[^\d,-]/g, '').replace(',', '.'));
            if (!isNaN(numero)) {
                return numero.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                });
            }
            return String(valor);
        }

        // 🔢 Quantidade ou número genérico
        if (chaveLower.includes('quantidade') || chaveLower.includes('qtd') || chaveLower.includes('numero') || chaveLower.includes('num')) {
            const numero = parseFloat(String(valor).replace(/[^\d,-]/g, '').replace(',', '.'));
            if (!isNaN(numero)) {
                return numero.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
            }
            return String(valor);
        }

        // ⚙️ Booleanos
        if (typeof valor === 'boolean') {
            return valor ? 'Sim' : 'Não';
        }

        // 🔣 Texto genérico
        const texto = String(valor).trim();
        return texto || '-';
    };


    // Função segura para obter chaves dos dados
    const obterChavesDados = (): string[] => {
        if (!Array.isArray(dados) || dados.length === 0) {
            return [];
        }

        const primeiroItem = dados[0];
        if (!primeiroItem || typeof primeiroItem !== 'object') {
            return [];
        }

        return Object.keys(primeiroItem).filter(key => key !== null && key !== undefined);
    };

    const fetchRelatorio = async () => {
        setLoading(true);
        setError(null);
        try {
            const filtroLimpo: Record<string, string> = {};
            Object.entries(filtro).forEach(([key, value]) => {
                if (value && value.trim()) {
                    filtroLimpo[key] = value;
                }
            });

            const query = new URLSearchParams(filtroLimpo).toString();
            const res = await api.get(`/relatorios/${abaAtiva}?${query}`);

            // Verificação segura dos dados retornados
            if (res.data && Array.isArray(res.data)) {
                setDados(res.data);
            } else {
                setDados([]);
                setError('Formato de dados inválido retornado pelo servidor');
            }
        } catch (error: any) {
            console.error('Erro ao buscar relatório:', error);
            setDados([]);
            setError(error.response?.data?.message || 'Erro ao carregar relatório. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRelatorio();
    }, [abaAtiva]);




    const exportar = async (formato: 'xlsx' | 'csv' | 'json') => {
        try {
            const filtroLimpo: Record<string, string> = {};
            Object.entries(filtro).forEach(([key, value]) => {
                if (value && String(value).trim()) {
                    filtroLimpo[key] = value;
                }
            });

            const query = new URLSearchParams({ ...filtroLimpo, formato }).toString();
            const rota = `/relatorios/${abaAtiva}`.replace(/\s+/g, '');
            const res = await api.get(`${rota}?${query}`, {
                responseType: formato === 'json' ? 'json' : 'blob',
            });

            if (formato === 'json') {
                console.log('Relatório JSON:', res.data);
                return;
            }

            const nomeAba = abaAtiva
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^a-zA-Z0-9-_]/g, '')
                .replace(/[-_]+$/g, ''); // Remove traços e underlines no final

            const dataHoje = new Date().toISOString().split('T')[0];
            const nomeArquivo = `relatorio-${nomeAba}-${dataHoje}.${formato}`;

            const blob = new Blob([res.data], {
                type:
                    formato === 'xlsx'
                        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        : 'text/csv',
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = nomeArquivo;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao exportar:', error);
            setError('Erro ao exportar relatório. Verifique sua conexão.');
        }
    };



    const abaAtual = abas.find(aba => aba.key === abaAtiva);
    const chavesDados = obterChavesDados();
    const temDados = Array.isArray(dados) && dados.length > 0 && chavesDados.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white p-3 rounded-2xl shadow-xl border border-blue-100">
                            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-3 rounded-xl shadow-lg">
                                <FiBarChart2 className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Relatórios
                            </h1>
                            <p className="text-gray-600 mt-1">Analise e exporte dados do sistema</p>
                        </div>
                    </div>

                    {/* Estatísticas Rápidas */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-100">
                            <div className="text-2xl font-bold text-gray-800">
                                {Array.isArray(dados) ? dados.length : 0}
                            </div>
                            <div className="text-sm text-gray-600">Registros</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Container Principal */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200/60 backdrop-blur-sm">
                {/* Abas Estilizadas */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30">
                    <div className="flex px-6">
                        {abas.map((aba) => {
                            const Icon = aba.icon;
                            const isActive = abaAtiva === aba.key;
                            return (
                                <button
                                    key={aba.key}
                                    onClick={() => setAbaAtiva(aba.key)}
                                    className={`flex items-center cursor-pointer space-x-3 px-6 py-4 font-semibold transition-all duration-300 border-b-2 relative group ${isActive
                                        ? `border-${aba.color}-600 text-${aba.color}-600 bg-white shadow-sm`
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? `text-${aba.color}-600` : 'text-gray-400'}`} />
                                    <span>{aba.label}</span>
                                    {isActive && (
                                        <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-${aba.color}-600 to-${aba.color}-400`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6">
                    {/* Alertas de Erro */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
                            <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <div>
                                <p className="text-red-800 font-medium">Erro</p>
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                            <button
                                onClick={() => setError(null)}
                                className="ml-auto text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                            >
                                <FiAlertCircle className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Filtros Modernos */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <FiFilter className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
                            </div>
                            <button
                                onClick={() => setFiltro({ dataInicio: '', dataFim: '' })}
                                className="text-sm bg-gray-500 p-2 rounded-2xl font-bold text-white transition-colors cursor-pointer"
                            >
                                Limpar filtros
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                                    <FiCalendar className="w-4 h-4 text-blue-500" />
                                    <span>Data Início</span>
                                </label>
                                <input
                                    type="date"
                                    value={filtro.dataInicio || ''}
                                    onChange={(e) => setFiltro({ ...filtro, dataInicio: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                                    <FiCalendar className="w-4 h-4 text-blue-500" />
                                    <span>Data Fim</span>
                                </label>
                                <input
                                    type="date"
                                    value={filtro.dataFim || ''}
                                    onChange={(e) => setFiltro({ ...filtro, dataFim: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={fetchRelatorio}
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r cursor-pointer from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <FiRefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Carregando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiFilter className="w-4 h-4" />
                                            <span>Aplicar Filtros</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Botões de Exportação */}
                    {temDados && (
                        <div className="flex flex-wrap gap-3 mb-6">
                            <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-700">Exportar:</span>
                                <button
                                    onClick={() => exportar('xlsx')}
                                    disabled={!temDados}
                                    className="flex items-center cursor-pointer space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiDownload className="w-4 h-4" />
                                    <span>Excel</span>
                                </button>
                                <button
                                    onClick={() => exportar('csv')}
                                    disabled={!temDados}
                                    className="flex items-center cursor-pointer space-x-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-xl font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiDownload className="w-4 h-4" />
                                    <span>CSV</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tabela Moderna */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <FiRefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                                    <p className="text-gray-600">Carregando dados...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">Erro ao carregar dados</h3>
                                    <p className="text-gray-500 max-w-md">{error}</p>
                                    <button
                                        onClick={fetchRelatorio}
                                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Tentar Novamente
                                    </button>
                                </div>
                            </div>
                        ) : temDados ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30">
                                            <tr>
                                                {chavesDados.map((key) => (
                                                    <th
                                                        key={key}
                                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200"
                                                    >
                                                        {key.split('_').map(word =>
                                                            word.charAt(0).toUpperCase() + word.slice(1)
                                                        ).join(' ')}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {dados.map((item, i) => (
                                                <tr
                                                    key={i}
                                                    className="hover:bg-blue-50/30 transition-colors duration-150"
                                                >
                                                    {chavesDados.map((key, j) => (
                                                        <td
                                                            key={j}
                                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                                                        >
                                                            <div
                                                                className="max-w-xs truncate"
                                                                title={formatarValor(item[key], key)}
                                                            >
                                                                {formatarValor(item[key], key)}
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Resumo */}
                                <div className="mt-4 text-sm text-gray-500 flex items-center space-x-4 px-6 pb-4">
                                    <span>Total de registros: <strong className="text-gray-700">{dados.length}</strong></span>
                                    <span>•</span>
                                    <span>Relatório: <strong className="text-gray-700">{abaAtual?.label}</strong></span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-700 mb-1">
                                    Nenhum dado encontrado
                                </h3>
                                <p className="text-gray-500">
                                    Tente ajustar os filtros ou verificar as datas selecionadas.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}