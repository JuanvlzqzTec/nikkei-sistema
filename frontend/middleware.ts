import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger rutas /admin
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // El rol lo verifica el componente cliente (el JWT está en cookie httpOnly)
    // Para verificación server-side del rol necesitaríamos llamar al backend
    // Por ahora dejamos la verificación de rol al layout de /admin
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}