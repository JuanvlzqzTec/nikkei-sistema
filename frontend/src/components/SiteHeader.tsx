'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LogIn, UserPlus, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

interface Props {
  variant?: 'home' | 'page'
}

const NAV_ITEMS = [
  { label: 'Sobre Nosotros',      hash: 'sobre-nosotros' },
  { label: 'Eventos',             hash: 'eventos'        },
  { label: 'Directorio Comercial',hash: 'directorio'     },
  { label: 'Galería Histórica',   hash: 'galeria'        },
]

export default function SiteHeader({ variant = 'page' }: Props) {

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const { isAuthenticated, user } = useAuthStore()

  return (
    <header className="header-container shadow-sm border-b border-red-800/30">
      <div className="w-full px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Logo */}
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

          {/* Botones derecha */}
          <div className="header-buttons-container">
            {/* Auth */}
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

            {/* Navegación */}
            <div className="flex items-center justify-end mt-1 gap-2 flex-wrap">
              {NAV_ITEMS.map(({ label, hash }) =>
                variant === 'home' ? (
                  <button
                    key={hash}
                    onClick={() => scrollToSection(hash)}
                    className="header-nav-button"
                  >
                    {label}
                  </button>
                ) : (
                  <Link
                    key={hash}
                    href={`/#${hash}`}
                    className="header-nav-button"
                  >
                    {label}
                  </Link>
                )
              )}
              {/* Contacto — pendiente en ambos variants */}
              <Link href="/contacto" className="header-nav-button">
                Contacto
              </Link>
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}