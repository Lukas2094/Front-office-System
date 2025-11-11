// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export enum Cargo {
  PROPRIETARIO_MECANICO = 1,
  RECEPCIONISTA = 2,
  MECANICO_FUNCIONARIO = 3
}

interface TokenPayload {
  sub: number;
  nome: string;
  username: string;
  funcionario_id: number | null;
  cargo_id: number | null;
  iat: number;
  exp: number;
}

// Rotas que requerem autenticação (mesma ordem da sidebar)
const protectedRoutes = [
  '/',
  '/clientes',
  '/ordens-servico',
  '/agendamentos',
  '/usuarios',
  '/relatorios'
];

// Rotas públicas (acessíveis sem autenticação)
const publicRoutes = [
  '/login',
  '/unauthorized',
  '/usuarios/newusers',
  '/usuarios/reset-password'
];

// Configuração de permissões por cargo (EXATAMENTE igual à sidebar)
const rolePermissions: Record<Cargo, string[]> = {
  [Cargo.PROPRIETARIO_MECANICO]: [
    '/',              // Dashboard - roles: [1, 2, 3]
    '/clientes',      // Clientes - roles: [1, 2]
    '/ordens-servico', // Ordens Serviço - roles: [1, 2, 3]
    '/agendamentos',  // Agendamentos - roles: [1, 2]
    '/usuarios',      // Usuários - roles: [1]
    '/relatorios'     // Relatórios - roles: [1]
  ],
  [Cargo.RECEPCIONISTA]: [
    '/',              // Dashboard
    '/clientes',      // Clientes
    '/ordens-servico', // Ordens Serviço
    '/agendamentos',   // Agendamentos
    '/usuarios',     // Usuários
    '/relatorios'    // Relatórios
  ],
  [Cargo.MECANICO_FUNCIONARIO]: [
    '/',              // Dashboard
    '/ordens-servico' // Ordens Serviço
  ]
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar se a rota é pública
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // Verificar se a rota é protegida
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // Se é rota pública, permitir acesso direto
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Se não é rota protegida nem pública, permitir acesso
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Obter o token do cookie
  const token = request.cookies.get('token')?.value;

  // Se é rota protegida e não tem token, redirecionar para login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar token para rotas protegidas
  if (isProtectedRoute && token) {
    try {
      const payload = decodeToken(token);

      // Verificar se o cargo é válido
      if (!payload.cargo_id || !Object.values(Cargo).includes(payload.cargo_id as Cargo)) {
        console.log('Cargo inválido ou não encontrado no token');
        throw new Error('Cargo inválido');
      }

      // Verificar se o usuário tem permissão para acessar a rota
      const userRole = payload.cargo_id as Cargo;
      const allowedRoutes = rolePermissions[userRole] || [];

      const hasPermission = allowedRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
      );

      if (!hasPermission) {
        // Usuário não tem permissão, redirecionar para unauthorized
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Adicionar headers com informações do usuário
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.sub.toString());
      requestHeaders.set('x-user-role', payload.cargo_id.toString());
      requestHeaders.set('x-user-name', payload.nome);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

    } catch (error) {
      // Token inválido ou expirado
      console.error('Token verification failed:', error);

      // Redirecionar para login e limpar cookie inválido
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

// Função para decodificar o token sem verificar assinatura (apenas para desenvolvimento)
function decodeToken(token: string): TokenPayload {
  try {
    // Decodifica o payload do JWT (base64)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);

    // Verificar expiração
    const currentTime = Date.now() / 1000;
    if (payload.exp && payload.exp < currentTime) {
      throw new Error('Token expirado');
    }

    return payload as TokenPayload;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    throw new Error('Token inválido');
  }
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};