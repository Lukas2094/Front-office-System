'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
FiHome,
FiUsers,
FiTruck,
FiFileText,
FiCalendar,
FiChevronLeft,
FiChevronRight,
FiTool
} from 'react-icons/fi';
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
{ icon: FiTruck, label: 'Veículos', href: '/veiculos', color: 'text-purple-400', roles: [1, 2, 3] },
{ icon: FiFileText, label: 'Ordens Serviço', href: '/ordens-servico', color: 'text-orange-400', roles: [1, 2, 3] },
{ icon: FiCalendar, label: 'Agendamentos', href: '/agendamentos', color: 'text-pink-400', roles: [1, 2] },
{ icon: FiUsers, label: 'Usuários', href: '/usuarios', color: 'text-cyan-400', roles: [1] },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
const pathname = usePathname();
const [collapsed, setCollapsed] = useState(true);
const [isHovered, setIsHovered] = useState(false);
const { user } = useUser();

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

    return (
    <>
    {isOpen && ( <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onToggle}
        />
    )}


    <div
        className={`
        fixed inset-y-0 left-0 z-50 flex flex-col
        bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700
        border-r border-gray-700 shadow-xl
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
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {isSidebarExpanded ? (
            <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <FiTool className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">OficinaPro</span>
            </div>
        ) : (
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto">
            <FiTool className="w-6 h-6 text-white" />
            </div>
        )}

        <button
            onClick={onToggle}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
        >
            {isOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
        </button>
        </div>

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
                relative flex items-center rounded-lg transition-all duration-200 group
                ${isActive
                    ? 'bg-yellow-500/10 text-yellow-400 border-r-2 border-yellow-400'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
                ${isSidebarExpanded ? 'px-3 py-2' : 'justify-center px-3 py-2'}
                `}
                title={!isSidebarExpanded ? item.label : ''}
            >
                <Icon
                className={`
                    ${item.color}
                    ${isActive ? 'scale-110' : ''}
                    text-2xl transition-transform duration-200
                `}
                />
                {isSidebarExpanded && (
                <span className="ml-4 font-medium transition-all duration-200 text-base">
                    {item.label}
                </span>
                )}
            </Link>
            );
        })}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-gray-700 ${isSidebarExpanded ? '' : 'text-center'}`}>
        {isSidebarExpanded ? (
            <div className="text-sm text-gray-400">
            <div className="font-medium text-gray-300">{cargoNome}</div>
            <div>Sistema Oficina v1.0.0</div>
            </div>
        ) : (
            <div className="text-xs text-gray-500 font-medium">v1.0</div>
        )}
        </div>
    </div>
    </>


    );
}
