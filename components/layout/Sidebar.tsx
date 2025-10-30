'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    FiHome,
    FiUsers,
    FiFileText,
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiTool,
    FiLogOut,
} from 'react-icons/fi';
import { TbReportSearch } from "react-icons/tb";
import { useUser } from '@/hooks/useUser';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

interface MenuItem {
    icon: any;
    label: string;
    href: string;
    color: string;
    roles?: number[];
}

const allMenuItems: MenuItem[] = [
    { icon: FiHome, label: 'Dashboard', href: '/', color: 'text-blue-400', roles: [1, 2, 3] },
    { icon: FiUsers, label: 'Clientes', href: '/clientes', color: 'text-green-400', roles: [1, 2] },
    // { icon: FiTruck, label: 'Veículos', href: '/veiculos', color: 'text-purple-400', roles: [1, 2, 3] },
    { icon: FiFileText, label: 'Ordens Serviço', href: '/ordens-servico', color: 'text-orange-400', roles: [1, 2, 3] },
    { icon: FiCalendar, label: 'Agendamentos', href: '/agendamentos', color: 'text-pink-400', roles: [1, 2] },
    { icon: FiUsers, label: 'Usuários', href: '/usuarios', color: 'text-cyan-400', roles: [1] },
    { icon: TbReportSearch, label: 'Relatórios', href: '/relatorios', color: 'text-purple-400', roles: [1, 2] },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const { user, logout } = useUser();

    const sidebarWidth = collapsed && !isHovered ? 'w-20' : 'w-64';
    const isSidebarExpanded = !collapsed || isHovered;

    const cargoMap: { [key: number]: string } = {
        1: 'Proprietário/Mecânico',
        2: 'Recepcionista',
        3: 'Mecânico Funcionário',
    };

    const cargoNome = user?.cargo_id ? cargoMap[user.cargo_id] || 'Usuário' : 'Usuário';

    // Filtra os menus de acordo com o cargo_id do usuário logado
    const menuItems = allMenuItems.filter((item) =>
        item.roles ? item.roles.includes(user?.cargo_id ?? 0) : true
    );

    const getUserDisplayName = () => {
        if (!user) return 'Usuário';
        const nome = user.nome;
        return nome
            .split('.')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
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
        if (!user) return 'bg-gradient-to-r from-gray-500 to-gray-600';
        
        const roleColors: { [key: number]: string } = {
            1: 'bg-gradient-to-r from-orange-500 to-amber-500',
            2: 'bg-gradient-to-r from-blue-500 to-cyan-500',
            3: 'bg-gradient-to-r from-green-500 to-emerald-500',
        };

        return user.cargo_id != null
            ? roleColors[user.cargo_id] || 'bg-gradient-to-r from-gray-500 to-gray-600'
            : 'bg-gradient-to-r from-gray-500 to-gray-600';
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            <div
                className={`
                    fixed inset-y-0 left-0 z-50 flex flex-col
                    bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
                    border-r border-gray-700 shadow-2xl
                    text-gray-200
                    transition-all duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${sidebarWidth}
                    lg:translate-x-0 lg:static lg:inset-0
                `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    {isSidebarExpanded ? (
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                                <FiTool className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-bold text-white block">DayCar</span>
                                <span className="text-xs text-gray-400 block">Oficina</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                            <FiTool className="w-6 h-6 text-white" />
                        </div>
                    )}

                    <button
                        onClick={onToggle}
                        className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-800 text-gray-300 hover:text-white transition-all duration-200"
                    >
                        {isOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
                    </button>
                </div>

                {/* User Info */}
                {/* {isSidebarExpanded && user && (
                    <div className="px-4 py-4 border-b border-gray-700">
                        <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl">
                            <div className={`w-10 h-10 ${getRoleColor()} rounded-lg flex items-center justify-center shadow-md`}>
                                <span className="text-white text-sm font-bold">
                                    {getUserInitials()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {getUserDisplayName()}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                    {cargoNome}
                                </p>
                            </div>
                        </div>
                    </div>
                )} */}

                {/* Menu */}
                <nav
                    className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-none"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    <style jsx>{`
                        nav::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>

                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`
                                    relative flex items-center rounded-xl transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-yellow-500/20 text-yellow-400 border-r-2 border-yellow-400 shadow-lg'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md'}
                                    ${isSidebarExpanded ? 'px-4 py-3' : 'justify-center px-4 py-3'}
                                `}
                                title={!isSidebarExpanded ? item.label : ''}
                            >
                                <Icon
                                    className={`
                                        ${item.color}
                                        ${isActive ? 'scale-110' : ''}
                                        text-xl transition-transform duration-200
                                    `}
                                />
                                {isSidebarExpanded && (
                                    <span className="ml-4 font-medium transition-all duration-200 text-sm">
                                        {item.label}
                                    </span>
                                )}
                                
                                {/* Active indicator */}
                                {isActive && isSidebarExpanded && (
                                    <div className="absolute right-3 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer with Logout */}
                <div className={`p-4 border-t border-gray-700 space-y-3 ${isSidebarExpanded ? '' : 'text-center'}`}>
                    {/* Quick Actions */}
                    {/* {isSidebarExpanded && (
                        <div className="flex space-x-2 mb-3">
                            <button className="flex-1 flex items-center justify-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer">
                                <FiUser size={16} />
                            </button>
                            <button className="flex-1 flex items-center justify-center p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer">
                                <FiSettings size={16} />
                            </button>
                        </div>
                    )} */}

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className={`
                            w-full flex items-center rounded-xl transition-all duration-200 group cursor-pointer
                            bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300
                            border border-red-500/30 hover:border-red-400/50
                            ${isSidebarExpanded ? 'px-4 py-3 justify-start' : 'px-4 py-3 justify-center'}
                        `}
                    >
                        <FiLogOut className="text-xl" />
                        {isSidebarExpanded && (
                            <span className="ml-4 font-medium text-sm">
                                Sair
                            </span>
                        )}
                    </button>

                    {/* Version Info */}
                    <div className={`text-xs text-gray-500 ${isSidebarExpanded ? 'text-left' : 'text-center'}`}>
                        {isSidebarExpanded ? (
                            <div>
                                <div className="font-medium text-gray-400">Sistema Oficina</div>
                                <div>v1.0.0</div>
                            </div>
                        ) : (
                            <div className="font-medium">v1.0</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}