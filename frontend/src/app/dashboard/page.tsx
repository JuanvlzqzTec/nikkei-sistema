'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, User, Lock, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { useAuthStore } from '@/store/authStore'

import BannerRegistroComunitario from './_BannerRegistroComunitario'
import SaludoBienvenida from './_SaludoBienvenida'
import ProximosEventos from './_ProximosEventos'
import MiNegocio from './_MiNegocio'
import BannerContribucion from './_BannerContribucion'
import DashboardFooter from './_DashboardFooter'

const ROL_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  admin: {
    label: 'Administrador',
    bg: 'bg-red-100',
    text: 'text-red-800',
  },
  miembro: {
    label: 'Miembro',
    bg: 'bg-green-100',
    text: 'text-green-800',
  },
  pendiente: {
    label: 'Pendiente',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
  },
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, checkAuth, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth()
    }
  }, [isAuthenticated, checkAuth])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!isAuthenticated || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background:
            'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)',
        }}
      >
        <div className="text-center max-w-md space-y-5">
          <h1 className="font-serif text-3xl text-red-800">
            Acceso restringido
          </h1>
          <p className="font-sans text-base text-red-600">
            Necesitas iniciar sesión para acceder a tu dashboard.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-sans font-semibold rounded-xl shadow-md transition-all duration-200"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  const registroCompletado = user.registro_estado === 'completado'
  const rolInfo = ROL_LABELS[user.role] ?? ROL_LABELS.pendiente

  return (
    <div
      className="min-h-screen bg-wave-pattern"
      style={{
        background:
          'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)',
      }}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-red-800/15 shadow-sm sticky top-0 z-10 p-3">
        <div className="container-nikkei py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/Logo-Nikkei.png"
              alt="Logo Asociación Nikkei"
              width={44}
              height={44}
              className="rounded-full"
              priority
            />
            <div>
              <p className="font-serif text-red-800 text-lg leading-tight">
                Dashboard Nikkei
              </p>
              <p className="font-sans text-xs text-red-600/70">
                Asociación de Culiacán
              </p>
            </div>
          </Link>

          <div className="header-buttons-top" style={{ padding: '0.1px 0.5px' }}>
              <Link href="/">
                <Button variant="ghost" className="header-auth-button group">
                  <Globe size={18} className="text-nikkei-burgundy" />
                  <span>Ver sitio público</span>
                </Button>
              </Link>

              <Button 
                onClick={handleLogout}
                variant="ghost" 
                className="header-auth-button group">
                <LogOut size={18} className="text-nikkei-burgundy" />
                <span>Cerrar sesión</span>
              </Button>
              
            </div>
          
        </div>
      </header>

      {/* Contenido */}
      <main className="container-nikkei py-10 lg:py-14">
        <div className="max-w-5xl mx-auto space-y-10">

          <SaludoBienvenida />

          <BannerRegistroComunitario />

          <ProximosEventos />

          {/* Bloques exclusivos para miembros completados */}
          {registroCompletado && (
            <>
              {/* Mi información */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <User size={20} className="text-red-700" />
                  <h2 className="font-serif text-2xl text-red-800">
                    Mi información
                  </h2>
                </div>

                <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 sm:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="font-sans text-sm text-gray-500 uppercase tracking-wide">
                        Nombre
                      </p>
                      <p className="font-serif text-xl text-gray-900">
                        {user.nombre_completo ?? '—'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-sans text-sm text-gray-500 uppercase tracking-wide">
                        Correo
                      </p>
                      <p className="font-sans text-base text-gray-700 break-all">
                        {user.email}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-sans text-sm text-gray-500 uppercase tracking-wide">
                        Rol en la comunidad
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-sans text-base font-medium ${rolInfo.bg} ${rolInfo.text}`}
                      >
                        {rolInfo.label}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="font-sans text-sm text-gray-500 uppercase tracking-wide">
                        Estado
                      </p>
                      <span className="inline-block px-3 py-1 rounded-full font-sans text-base font-medium bg-green-100 text-green-800">
                        ✅ Activo
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-amber-100">
                    <button
                      disabled
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 border-2 border-gray-200 text-gray-400 font-sans font-semibold text-base rounded-xl cursor-not-allowed"
                    >
                      <Lock size={15} />
                      Editar mi información
                      <span className="text-xs">(próximamente)</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Mi empresa / Mi trabajo */}
              <MiNegocio />

              {/* Banner contribuciones */}
              <BannerContribucion />

            </>
          )}

          {/* Cerrar sesión */}
          <section className="pt-6">
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto sm:mx-auto sm:flex inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-red-200 hover:border-red-400 hover:bg-red-50 text-red-700 font-sans font-semibold text-base rounded-xl transition-all duration-200 cursor-pointer"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </section>

          {/* Footer */}
          <DashboardFooter />
        </div>
      </main>
    </div>
  )
}