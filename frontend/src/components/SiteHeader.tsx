'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { LogIn, UserPlus, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

interface Props {
  variant?: 'home' | 'page'
}

const NAV_ITEMS = [
  { label: 'Sobre Nosotros', hash: 'sobre-nosotros' },
  { label: 'Eventos', hash: 'eventos' },
  { label: 'Directorio Comercial', hash: 'directorio' },
  { label: 'Galería Histórica', hash: 'galeria' },
]

export default function SiteHeader({ variant = 'page' }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, user } = useAuthStore()

  const scrollToSection = (id: string) => {
    setMenuOpen(false)
    setTimeout(() => {
      const el = document.getElementById(id)
      if (!el) return
      const headerHeight = document.querySelector('header')?.offsetHeight || 0
      const isMobile = window.innerWidth < 768
      const offset = isMobile ? headerHeight : 0
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }, 300)
  }

  return (
    <header className="header-container shadow-sm border-b border-red-800/30">
      <div className="w-full px-4">

        {/* Barra principal */}
        <div className="flex items-center justify-between py-2 md:py-0 md:flex-col">

          {/* Logo + hamburguesa (móvil) */}
          <div className="flex items-center justify-between w-full md:hidden">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/assets/Logo-Nikkei.png"
                alt="Logo OJN"
                width={48}
                height={48}
                className="rounded-full"
                priority
              />
              <div>
                <p className="header-logo-text-main text-sm leading-tight">シナロア日系青年協会</p>
                <p className="header-logo-text-sub text-[10px]">Asociación Nikkei, Culiacán</p>
              </div>
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-red-800 hover:bg-red-50 transition-colors"
            >
              <div className="relative w-5.5 h-5.5">
                <span className={`absolute left-0 block h-0.5 w-full bg-red-800 rounded-full transition-all duration-300 ${menuOpen ? 'top-2.25 rotate-45' : 'top-0'}`} />
                <span className={`absolute left-0 top-2.25 block h-0.5 w-full bg-red-800 rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'}`} />
                <span className={`absolute left-0 block h-0.5 w-full bg-red-800 rounded-full transition-all duration-300 ${menuOpen ? 'top-2.25 -rotate-45' : 'top-4.5'}`} />
              </div>
            </button>
          </div>

          {/* Logo desktop */}
          <div className="hidden md:flex items-center justify-between w-full">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/assets/Logo-Nikkei.png"
                alt="Logo OJN"
                width={75}
                height={75}
                className="rounded-full"
                priority
              />
              <div>
                <h1 className="header-logo-text-main">シナロア日系青年協会</h1>
                <p className="header-logo-text-sub">Asociación Nikkei, Culiacán</p>
              </div>
            </Link>

            {/* Auth + nav desktop */}
            <div className="header-buttons-container">
              <div className="header-buttons-top" style={{ padding: '0.1px 0.5px' }}>
                {isAuthenticated ? (
                  <Link href={user?.role === 'admin' ? '/admin' : '/dashboard'}>
                    <Button variant="ghost" className="header-auth-button group">
                      <LayoutDashboard size={18} className="text-nikkei-burgundy" />
                      <span>Volver al Dashboard</span>
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button variant="ghost" className="header-auth-button group">
                        <UserPlus size={18} className="text-nikkei-burgundy" />
                        <span>Registrarse</span>
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="ghost" className="header-auth-button group">
                        <LogIn size={18} className="text-nikkei-burgundy" />
                        <span>Iniciar Sesión</span>
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              <div className="flex items-center justify-end mt-1 gap-2 flex-wrap">
                {NAV_ITEMS.map(({ label, hash }) =>
                  variant === 'home' ? (
                    <button key={hash} onClick={() => scrollToSection(hash)} className="header-nav-button">
                      {label}
                    </button>
                  ) : (
                    <Link key={hash} href={`/#${hash}`} className="header-nav-button">
                      {label}
                    </Link>
                  )
                )}
                <Link href="/contacto" className="header-nav-button">Contacto</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`} style={{ overflow: menuOpen ? 'visible' : 'hidden' }}>
          <div className="border-t border-red-800/15 py-3 space-y-1">

            {/* Auth móvil */}
            <div className="flex gap-2 pb-3 border-b border-red-800/10 px-1">
              {isAuthenticated ? (
                <Link
                  href={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 btn-nikkei text-sm"
                >
                  <LayoutDashboard size={15} />
                  Mi Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 btn-nikkei text-xs"
                  >
                    <UserPlus size={14} />
                    Registrarse
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border-2 border-red-800 text-red-800 hover:bg-red-800 hover:text-white rounded-lg text-sm font-sans font-semibold transition-all duration-300"
                  >
                    <LogIn size={14} />
                    Iniciar Sesión
                  </Link>
                </>
              )}
            </div>

            {/* Nav móvil */}
            {NAV_ITEMS.map(({ label, hash }) =>
              variant === 'home' ? (
                <button
                  key={hash}
                  onClick={() => scrollToSection(hash)}
                  className="w-full text-left px-3 py-2.5 text-sm font-sans text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {label}
                </button>
              ) : (
                <Link
                  key={hash}
                  href={`/#${hash}`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-sans text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {label}
                </Link>
              )
            )}
            <Link
              href="/contacto"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-sans text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            >
              Contacto
            </Link>
          </div>
        </div>

      </div>
    </header>
  )
}