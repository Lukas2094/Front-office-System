'use client';

import { useState } from 'react';
import api from '@/lib/api';
import Image from 'next/image';
import { FaKey, FaEye, FaEyeSlash, FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
    const [step, setStep] = useState<'request' | 'reset'>('request'); // 'request' ou 'reset'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    // Se tiver token na URL, vai direto para o passo de reset
    useState(() => {
        if (token) {
            setStep('reset');
        }
    });

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (!formData.email) {
            setMessage({ type: 'error', text: 'Por favor, informe seu email' });
            setLoading(false);
            return;
        }

        try {
            await api.post('/usuarios/request-password-reset', {
                email: formData.email
            });

            setMessage({
                type: 'success',
                text: 'Se o email existir em nosso sistema, você receberá um link para redefinição de senha.'
            });

            // Limpar email após sucesso
            setFormData(prev => ({ ...prev, email: '' }));

        } catch (error: any) {
            console.error('Erro ao solicitar reset:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Erro ao solicitar redefinição de senha. Tente novamente.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Validações
        if (formData.password.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres' });
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem' });
            setLoading(false);
            return;
        }

        if (!token) {
            setMessage({ type: 'error', text: 'Token de redefinição inválido' });
            setLoading(false);
            return;
        }

        try {
            await api.post('/usuarios/reset-password', {
                token,
                newPassword: formData.password
            });

            setMessage({
                type: 'success',
                text: 'Senha redefinida com sucesso! Redirecionando para o login...'
            });

            // Limpar formulário
            setFormData({ email: '', password: '', confirmPassword: '' });

            // Redirecionar após 2 segundos
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (error: any) {
            console.error('Erro ao redefinir senha:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Erro ao redefinir senha. Tente novamente.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const passwordStrength = {
        length: formData.password.length >= 6,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
    };

    const strengthScore = Object.values(passwordStrength).filter(Boolean).length;
    const strengthText = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'][strengthScore - 1] || '';
    const strengthColor = [
        'bg-red-500',
        'bg-orange-500',
        'bg-yellow-500',
        'bg-blue-500',
        'bg-green-500'
    ][strengthScore - 1] || 'bg-gray-200';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-start md:items-center justify-center p-4 py-8 md:py-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row my-auto">
                {/* Coluna Esquerda - Formulário */}
                <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-12 flex flex-col justify-center">
                    <div className="text-center mb-6 md:mb-8 w-full max-w-sm mx-auto">
                        <div className={`inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl shadow-lg mb-3 md:mb-4 ${step === 'request'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-700'
                                : 'bg-gradient-to-r from-green-600 to-emerald-700'
                            }`}>
                            {step === 'request' ? (
                                <FaEnvelope className="h-6 w-6 md:h-8 md:w-8 text-white" />
                            ) : (
                                <FaKey className="h-6 w-6 md:h-8 md:w-8 text-white" />
                            )}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                            {step === 'request' ? 'Recuperar Senha' : 'Redefinir Senha'}
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base">
                            {step === 'request'
                                ? 'Informe seu email para receber o link de redefinição'
                                : 'Crie uma nova senha para sua conta'
                            }
                        </p>
                    </div>

                    {step === 'request' ? (
                        // Formulário de Solicitação
                        <form onSubmit={handleRequestReset} className="w-full max-w-sm mx-auto space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            {message.text && (
                                <div className={`p-3 rounded-xl text-sm font-medium ${message.type === 'success'
                                        ? 'bg-green-50 text-green-800 border border-green-200'
                                        : 'bg-red-50 text-red-800 border border-red-200'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !formData.email}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Enviando...</span>
                                    </div>
                                ) : (
                                    'Enviar Link de Redefinição'
                                )}
                            </button>

                            <div className="text-center">
                                <a
                                    href="/login"
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                >
                                    ← Voltar para o login
                                </a>
                            </div>
                        </form>
                    ) : (
                        // Formulário de Redefinição
                        <form onSubmit={handleResetPassword} className="w-full max-w-sm mx-auto space-y-4">
                            {/* Campo Nova Senha */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Nova Senha
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pr-12"
                                        placeholder="Digite sua nova senha"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Indicador de Força da Senha */}
                            {formData.password && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-600">Força da senha:</span>
                                        <span className={`font-medium ${strengthScore <= 2 ? 'text-red-600' :
                                                strengthScore === 3 ? 'text-yellow-600' :
                                                    'text-green-600'
                                            }`}>
                                            {strengthText}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
                                            style={{ width: `${(strengthScore / 5) * 100}%` }}
                                        ></div>
                                    </div>

                                    {/* Requisitos da Senha */}
                                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                                        <div className="flex items-center space-x-1">
                                            <FaCheckCircle className={`w-3 h-3 ${passwordStrength.length ? 'text-green-500' : 'text-gray-300'}`} />
                                            <span>Mínimo 6 caracteres</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <FaCheckCircle className={`w-3 h-3 ${passwordStrength.uppercase ? 'text-green-500' : 'text-gray-300'}`} />
                                            <span>Letra maiúscula</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <FaCheckCircle className={`w-3 h-3 ${passwordStrength.lowercase ? 'text-green-500' : 'text-gray-300'}`} />
                                            <span>Letra minúscula</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <FaCheckCircle className={`w-3 h-3 ${passwordStrength.number ? 'text-green-500' : 'text-gray-300'}`} />
                                            <span>Número</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Campo Confirmar Senha */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirmar Nova Senha
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pr-12"
                                        placeholder="Confirme sua nova senha"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Mensagem de Feedback */}
                            {message.text && (
                                <div className={`p-3 rounded-xl text-sm font-medium ${message.type === 'success'
                                        ? 'bg-green-50 text-green-800 border border-green-200'
                                        : 'bg-red-50 text-red-800 border border-red-200'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            {/* Botão de Submit */}
                            <button
                                type="submit"
                                disabled={loading || !formData.password || !formData.confirmPassword}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Redefinindo...</span>
                                    </div>
                                ) : (
                                    'Redefinir Senha'
                                )}
                            </button>

                            <div className="text-center">
                                <a
                                    href="/login"
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                >
                                    ← Voltar para o login
                                </a>
                            </div>
                        </form>
                    )}
                </div>

                {/* Coluna Direita - Banner */}
                <div className={`hidden md:flex md:w-1/2 relative overflow-hidden ${step === 'request'
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700'
                        : 'bg-gradient-to-br from-green-600 to-emerald-700'
                    }`}>
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center text-center text-white p-6 lg:p-8 h-full w-full">
                        <div className="flex flex-col items-center justify-center h-full max-w-xs">
                            <div className="mb-6 lg:mb-8">
                                <Image
                                    src="https://i.ibb.co/R4TcWGWz/logo.png"
                                    alt="Logo Oficina"
                                    width={100}
                                    height={100}
                                    quality={100}
                                    className="mx-auto mb-3 lg:mb-4 drop-shadow-xl"
                                />
                            </div>

                            <h2 className="text-2xl lg:text-3xl font-bold mb-3 drop-shadow">
                                System Office
                            </h2>
                            <p className="text-blue-100 text-sm lg:text-base mb-6">
                                {step === 'request'
                                    ? 'Recuperação segura de acesso'
                                    : 'Sua segurança em primeiro lugar'
                                }
                            </p>

                            {/* Informações de segurança */}
                            <div className="space-y-3 text-left text-blue-100 text-sm">
                                <div className="flex items-center space-x-2">
                                    <FaCheckCircle className="w-4 h-4 text-blue-200" />
                                    <span>Processo seguro</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FaCheckCircle className="w-4 h-4 text-blue-200" />
                                    <span>Proteção de conta</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FaCheckCircle className="w-4 h-4 text-blue-200" />
                                    <span>Acesso criptografado</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Elementos decorativos */}
                    <div className="absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full -translate-y-12 lg:-translate-y-16 translate-x-12 lg:translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 lg:w-24 lg:h-24 bg-white/10 rounded-full translate-y-8 lg:translate-y-12 -translate-x-8 lg:-translate-x-12"></div>
                    <div className="absolute top-1/2 left-1/4 w-12 h-12 lg:w-16 lg:h-16 bg-white/5 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}