import { cookies } from 'next/headers';

export async function setAuthToken(token: string) {
    const cookieStore = await cookies(); // 👈 await obrigatório
    cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 dia
        path: '/',
    });
}

export async function getAuthToken() {
    const cookieStore = await cookies(); // 👈 await aqui também
    const token = cookieStore.get('auth_token');
    return token?.value || null;
}

export async function clearAuthToken() {
    const cookieStore = await cookies();
    cookieStore.set('auth_token', '', { maxAge: -1, path: '/' });
}
