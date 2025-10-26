// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify, JWTVerifyOptions } from 'jose'

// Rotas públicas que não exigem autenticação
const PUBLIC_PATHS = ['/login', '/usuarios/newusers', '/api/auth', '/favicon.ico', '/_next']

// Roles permitidas para cada rota (mesmo esquema da sidebar)
const ROUTE_ROLES: { [key: string]: number[] } = {
  '/': [1, 2, 3],                  // Dashboard
  '/clientes': [1, 2],             // Clientes
  '/veiculos': [1, 2, 3],          // Veículos
  '/ordens-servico': [1, 2, 3],    // Ordens Serviço
  '/agendamentos': [1, 2],         // Agendamentos
  '/usuarios': [1],                 // Usuários
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rotas públicas
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Pega token do cookie
  const cookieHeader = req.headers.get('cookie') || ''
  const token = cookieHeader
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1]

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não definido no .env')
    }

    // Transformando o segredo em Uint8Array (Edge Runtime exige)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)

    // Verifica token usando HS256
    const verifyOptions: JWTVerifyOptions = { algorithms: ['HS256'] }
    const { payload } = await jwtVerify(token, secret, verifyOptions)
    const cargoId = (payload as any).cargo_id

    // Checa se a rota exige roles
    for (const route in ROUTE_ROLES) {
      if (pathname.startsWith(route)) {
        if (!ROUTE_ROLES[route].includes(cargoId)) {
          // Bloqueia acesso e redireciona para dashboard
          return NextResponse.redirect(new URL('/unauthorized', req.url))
        }
      }
    }

    return NextResponse.next()
  } catch (err) {
    console.error('Erro ao validar token JWT:', err)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

// Aplica middleware em todas as rotas exceto públicas
export const config = {
  matcher: ['/:path*'],
}
