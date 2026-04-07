'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Image as ImageIcon, CalendarDays,
  Building2, BookImage, LogOut, ChevronRight, Menu, X,
  Globe
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/admin/homepage',
    label: 'Gestión Homepage',
    icon: Globe,
    children: [
      { href: '/admin/homepage/slider', label: 'Slider Hero', icon: ImageIcon },
      { href: '/admin/homepage/eventos', label: 'Eventos', icon: CalendarDays },
      { href: '/admin/homepage/empresas', label: 'Impulso Nikkei', icon: Building2 },
      { href: '/admin/homepage/galeria', label: 'Galería Histórica', icon: BookImage },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [homepageOpen, setHomepageOpen] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + pathname)
      return
    }
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router, pathname])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-red-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-red-800 font-sans text-sm">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 z-30 flex flex-col transition-transform duration-300
          lg:translate-x-0 lg:sticky lg:top-0 lg:self-start
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: 'var(--color-nikkei-burgundy)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 shrink-0">
          <Image
            src="/assets/Logo-Nikkei.png"
            alt="Logo"
            width={36}
            height={36}
            className="rounded-full bg-white/90 p-0.5"
          />
          <div>
            <p className="text-white font-serif text-sm leading-tight">Panel Admin</p>
            <p className="text-amber-300/70 font-sans text-xs">Nikkei Sinaloa</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-white/50 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (!item.children) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-all duration-200
                    ${isActive(item.href, item.exact)
                      ? 'bg-white/15 text-white'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              )
            }

            return (
              <div key={item.href}>
                <button
                  onClick={() => setHomepageOpen(!homepageOpen)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-white/15 text-white'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <item.icon size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronRight
                    size={15}
                    className={`transition-transform duration-200 ${homepageOpen ? 'rotate-90' : ''}`}
                  />
                </button>

                {homepageOpen && (
                  <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-sans transition-all duration-200
                          ${pathname === child.href
                            ? 'bg-amber-400/20 text-amber-300'
                            : 'text-white/50 hover:bg-white/10 hover:text-white'
                          }`}
                      >
                        <child.icon size={15} />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="px-3 py-4 border-t border-white/10 space-y-2 shrink-0">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/10 transition-all font-sans"
          >
            <Globe size={15} />
            Ver sitio público
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-red-300 hover:bg-red-500/10 transition-all font-sans"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
          <div className="px-3 pt-1">
            <p className="text-white/30 text-[10px] font-sans truncate">{user.email}</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-800"
          >
            <Menu size={22} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-sans text-gray-500 min-w-0">
            <span className="text-red-800 font-semibold shrink-0">Admin</span>
            {pathname !== '/admin' && (
              <>
                <ChevronRight size={14} className="shrink-0" />
                <span className="truncate text-gray-700 capitalize">
                  {pathname.split('/').filter(Boolean).slice(1).join(' › ')}
                </span>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-800 text-xs font-semibold font-sans">
                  {user.email[0].toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-gray-600 font-sans hidden md:block">{user.email}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}