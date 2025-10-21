'use client';

import { useState, useRef, useEffect } from 'react';
import { FiMenu, FiBell, FiUser, FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi';
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
        const username = user.username;
        return username
            .split('.')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    };

    const getUserRole = () => {
        if (!user) return 'Usuário';

        // Mapeia cargo_id para nomes de cargo
        const cargoMap: { [key: number]: string } = {
            1: 'Administrador',
            2: 'Gerente',
            3: 'Mecânico',
            4: 'Recepcionista'
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


    if (loading) {
        return (
            <header className="bg-white shadow-sm border-b border-gray-200 z-30">
                <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                    <div className="flex items-center">
                        <button
                            onClick={onMenuClick}
                            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden transition-colors"
                        >
                            <FiMenu size={20} />
                        </button>
                        <div className="ml-4 lg:ml-0">
                            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
                        </div>
                    </div>
                    <div className="animate-pulse">
                        <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 z-30">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                {/* Left Section */}
                <div className="flex items-center">
                    {/* Mobile menu button */}
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden transition-colors"
                    >
                        <FiMenu size={20} />
                    </button>

                    {/* Page Title */}
                    <div className="ml-4 lg:ml-0">
                        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
                        <p className="text-sm text-gray-600 hidden sm:block">
                            Bem-vindo de volta, {getUserDisplayName()}
                        </p>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-3">
                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer">
                                <span className="text-white text-sm font-medium">
                                    {getUserInitials()}
                                </span>
                            </div>

                            <div className="hidden sm:block text-left cursor-pointer">
                                <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                                <p className="text-xs text-gray-600">{getUserRole()}</p>
                            </div>

                            <FiChevronDown
                                className={`hidden sm:block text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {/* User Dropdown Menu */}
                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <div className="p-2">
                                    <div className="px-3 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                                        <p className="text-xs text-gray-600 truncate">{user?.username}</p>
                                        <p className="text-xs text-gray-500">{getUserRole()}</p>
                                    </div>

                                    <div className="border-t border-gray-100 mt-2 pt-2">
                                        <button
                                            onClick={logout}
                                            className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md cursor-pointer"
                                        >
                                            <FiLogOut className="mr-2" />
                                            Sair
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}