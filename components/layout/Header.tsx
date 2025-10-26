'use client';

import { useState, useRef, useEffect } from 'react';
import { FiMenu, FiBell, FiUser, FiLogOut, FiSettings, FiChevronDown, FiHelpCircle } from 'react-icons/fi';
import { useUser } from '@/hooks/useUser';

interface HeaderProps {
    onMenuClick: () => void;
    title?: string;
}

export default function Header({ onMenuClick, title = 'Dashboard' }: HeaderProps) {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    const { user, loading, logout } = useUser();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getUserDisplayName = () => {
        if (!user) return 'Usuário';
        const nome = user.nome;
        return nome
            .split('.')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    };

    const getUserRole = () => {
        if (!user) return 'Usuário';

        // Mapeia cargo_id para nomes de cargo
        const cargoMap: { [key: number]: string } = {
            1: 'Proprietário/Mecânico',
            2: 'Recepcionista',
            3: 'Mecânico Funcionário',
        };

        return user.cargo_id ? cargoMap[user.cargo_id] || 'Usuário' : 'Usuário';
    };

    const getUserInitials = () => {
        if (!user) return 'U';

        const displayName = getUserDisplayName();
        return displayName
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleColor = () => {
        if (!user) return 'bg-gray-500';
        
        const roleColors: { [key: number]: string } = {
            1: 'bg-gradient-to-r from-orange-500 to-amber-500', // Proprietário
            2: 'bg-gradient-to-r from-blue-500 to-cyan-500',   // Recepcionista
            3: 'bg-gradient-to-r from-green-500 to-emerald-500', // Mecânico
        };

        return user?.cargo_id ? roleColors[user.cargo_id] : 'bg-gradient-to-r from-gray-500 to-gray-600';
    };

    if (loading) {
        return (
            <header className="bg-white shadow-lg border-b border-gray-100 z-40">
                <div className="flex items-center justify-between h-20 px-6 lg:px-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onMenuClick}
                            className="p-3 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 lg:hidden transition-all duration-200"
                        >
                            <FiMenu size={22} />
                        </button>
                        <div className="ml-2 lg:ml-0">
                            <div className="w-32 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                            <div className="w-48 h-4 bg-gray-100 rounded mt-1 animate-pulse"></div>
                        </div>
                    </div>
                    <div className="animate-pulse">
                        <div className="w-40 h-10 bg-gray-200 rounded-xl"></div>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="bg-white shadow-lg border-b border-gray-100 z-40">
            <div className="flex items-center justify-between h-20 px-6 lg:px-8">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                    {/* Mobile menu button */}
                    <button
                        onClick={onMenuClick}
                        className="p-3 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 lg:hidden transition-all duration-200 shadow-sm"
                    >
                        <FiMenu size={22} />
                    </button>

                    {/* Page Title & Welcome */}
                    <div className="ml-2 lg:ml-0">
                        <h1 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                            {title}
                        </h1>
                        <p className="text-sm text-gray-500 hidden sm:flex items-center gap-1 mt-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            Olá, <span className="font-semibold text-gray-700">{getUserDisplayName()}</span> - {getUserRole()}
                        </p>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    {/* <div className="relative" ref={notificationsRef}>
                        <button
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                            className="relative p-3 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group"
                        >
                            <FiBell size={20} />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-sm">
                                3
                            </div>
                        </button>

                        {notificationsOpen && (
                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-800">Notificações</h3>
                                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">3 novas</span>
                                    </div>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                            
                                    <div className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                                        <p className="text-sm font-medium text-gray-800">Nova ordem de serviço</p>
                                        <p className="text-xs text-gray-500 mt-1">Cliente: João Silva - Veículo: Gol</p>
                                        <span className="text-xs text-blue-600 mt-2 inline-block">Há 5 minutos</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 border-t border-gray-100">
                                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 cursor-pointer">
                                        Ver todas as notificações
                                    </button>
                                </div>
                            </div>
                        )}
                    </div> */}

                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex cursor-pointer items-center space-x-3 p-2 rounded-2xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200 group"
                        >
                            <div className={`w-12 h-12 ${getRoleColor()} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                                <span className="text-white text-sm font-bold">
                                    {getUserInitials()}
                                </span>
                            </div>

                            <div className="hidden lg:block text-left">
                                <p className="text-sm font-semibold text-gray-800">{getUserDisplayName()}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    {getUserRole()}
                                </p>
                            </div>

                            <FiChevronDown
                                className={`hidden lg:block text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''
                                    }`}
                                size={16}
                            />
                        </button>

                        {/* User Dropdown Menu */}
                        {userMenuOpen && (
                            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                                {/* User Info Header */}
                                {/* <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 cursor-pointer">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-12 h-12 ${getRoleColor()} rounded-xl flex items-center justify-center shadow-md`}>
                                            <span className="text-white text-sm font-bold">
                                                {getUserInitials()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{getUserDisplayName()}</p>
                                            <p className="text-xs text-gray-600 truncate">{user?.nome}</p>
                                            <p className="text-xs text-gray-500 mt-1">{getUserRole()}</p>
                                        </div>
                                    </div>
                                </div> */}

                                {/* Menu Items */}
                                <div className="p-2">
                                    {/* <button className="flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group">
                                        <FiUser className="mr-3 text-gray-400 group-hover:text-blue-500" size={16} />
                                        Meu Perfil
                                    </button>
                                    
                                    <button className="flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group">
                                        <FiSettings className="mr-3 text-gray-400 group-hover:text-blue-500" size={16} />
                                        Configurações
                                    </button>
                                    
                                    <button className="flex items-center w-full px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group">
                                        <FiHelpCircle className="mr-3 text-gray-400 group-hover:text-blue-500" size={16} />
                                        Ajuda & Suporte
                                    </button> */}

                                    <div className="border-t border-gray-100 my-2"></div>

                                    <button
                                        onClick={logout}
                                        className="flex items-center w-full px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl cursor-pointer transition-colors group"
                                    >
                                        <FiLogOut className="mr-3" size={16} />
                                        Sair do Sistema
                                    </button>
                                </div>

                                {/* Footer */}
                                <div className="p-3 bg-gray-50 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 text-center">
                                        Sistema OficinaTech
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}