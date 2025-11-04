// hooks/useUser.ts
'use client';

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface UserData {
    sub: number;
    nome: string;
    username: string;
    funcionario_id: number | null;
    cargo_id: number | null;
    iat: number;
    exp: number;
}

// Permissões por cargo (EXATAMENTE igual ao middleware)
const rolePermissions: Record<number, string[]> = {
    1: ['/', '/clientes', '/ordens-servico', '/agendamentos', '/usuarios', '/relatorios'],
    2: ['/', '/clientes', '/ordens-servico', '/agendamentos'],
    3: ['/', '/ordens-servico']
};

export function useUser() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserFromToken = () => {
            try {
                const token = Cookies.get('token');
                // console.log('Token do cookie:', token ? 'Encontrado' : 'Não encontrado');

                if (!token) {
                    console.log('Nenhum token encontrado nos cookies');
                    setLoading(false);
                    return;
                }

                const decodedPayload = jwtDecode<UserData>(token);

                const currentTime = Date.now() / 1000;
                if (decodedPayload.exp && decodedPayload.exp < currentTime) {
                    console.log('Token expirado');
                    Cookies.remove('token');
                    setUser(null);
                } else {
                    setUser(decodedPayload);
                }

            } catch (error) {
                console.error('Erro ao decodificar token:', error);
                Cookies.remove('token');
            } finally {
                setLoading(false);
            }
        };

        getUserFromToken();
    }, []);

    const logout = () => {
        Cookies.remove('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    // Função para verificar permissões (igual ao middleware)
    const hasPermission = (route: string): boolean => {
        if (!user || !user.cargo_id) return false;

        const allowedRoutes = rolePermissions[user.cargo_id] || [];
        return allowedRoutes.some(allowedRoute =>
            route === allowedRoute || route.startsWith(allowedRoute + '/')
        );
    };

    return { user, loading, logout, hasPermission };
}