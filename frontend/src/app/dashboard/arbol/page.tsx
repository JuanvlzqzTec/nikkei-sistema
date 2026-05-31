'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2, GitBranch, Users, Plus, Sparkles } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { genealogiaApi, type ArbolFamiliarResponse } from '@/lib/genealogiaApi'
import ArbolView from './_ArbolView'
import DashboardFooter from '@/app/dashboard/_DashboardFooter'

export default function ArbolPage() {
  const router = useRouter()
  const { isAuthenticated, user, checkAuth } = useAuthStore()
  const [arbol, setArbol] = useState<ArbolFamiliarResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendientesCount, setPendientesCount] = useState(0)

  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [a, p] = await Promise.all([
        genealogiaApi.getArbolDeMiFamilia(),
        genealogiaApi.getPendientesConfirmacion().catch(() => ({ count: 0, data: [] })),
      ])
      setArbol(a)
      setPendientesCount(p.count)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No pudimos cargar tu árbol')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth()
    }
  }, [isAuthenticated, checkAuth])

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.registro_estado !== 'completado') {
        router.push('/dashboard')
        return
      }
      cargar()
    }
  }, [isAuthenticated, user, router, cargar])

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-red-700" />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)' }}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-red-800/15 shadow-sm sticky top-0 z-10 p-3">
        <div className="container-nikkei py-4 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/assets/Logo-Nikkei.png"
              alt="Asociación Nikkei"
              width={44}
              height={44}
              className="rounded-full"
              priority
            />
            <div className="hidden sm:block">
              <p className="font-serif text-red-800 text-base leading-tight">
                Mi árbol genealógico
              </p>
              <p className="font-sans text-xs text-red-600/70">
                Asociación Nikkei de Culiacán
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-base font-sans text-red-700 hover:text-red-900 font-semibold cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Volver al dashboard</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </div>
      </header>

      <main className="container-nikkei py-10 lg:py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Título */}
          <div className="text-center space-y-3">
            <h1 className="font-serif text-4xl sm:text-5xl text-red-800 leading-tight pt-3">
              家系図
            </h1>
            <h2 className="font-serif text-2xl text-red-700">Mi árbol genealógico</h2>
            <div className="mx-auto h-1 w-24 rounded-full bg-linear-to-r from-red-600 to-amber-400" />
            <p className="font-sans text-lg text-red-600/80 max-w-xl mx-auto">
              Reconecta con tu familia Nikkei a través de las generaciones.
            </p>
          </div>

          {/* Pendientes de confirmación */}
          {pendientesCount > 0 && (
            <Link
              href="/dashboard/arbol/pendientes"
              className="block bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                  <Sparkles size={22} />
                </div>
                <div className="flex-1">
                  <p className="font-serif text-lg text-amber-900">
                    Tienes {pendientesCount}{' '}
                    {pendientesCount === 1 ? 'relación pendiente' : 'relaciones pendientes'} de confirmar
                  </p>
                  <p className="font-sans text-sm text-amber-700 mt-0.5">
                    Alguien dice ser tu pariente — revisa y confirma.
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Link
              href="/dashboard/arbol/agregar"
              className="inline-flex items-center justify-center gap-2 min-h-13 px-6 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus size={18} />
              Agregar pariente
            </Link>
          </div>

          {/* Contenido */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 size={32} className="animate-spin text-red-700" />
              <p className="font-sans text-base text-gray-600">Cargando tu árbol...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-red-200">
              <p className="font-sans text-base text-red-700 mb-4">{error}</p>
              <button
                onClick={cargar}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-sans font-semibold rounded-xl cursor-pointer"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : !arbol || arbol.relaciones.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-amber-300 px-6">
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <GitBranch size={36} className="text-amber-400" />
              </div>
              <h3 className="font-serif text-2xl text-red-800 mb-2">
                Aún no tienes parientes registrados
              </h3>
              <p className="font-sans text-base text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
                Empieza a construir tu árbol genealógico agregando a tus padres, hijos,
                hermanos o cualquier otro pariente.
              </p>
              <Link
                href="/dashboard/arbol/agregar"
                className="inline-flex items-center gap-2 min-h-13 px-6 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus size={18} />
                Agregar mi primer pariente
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm font-sans text-gray-500 flex-wrap">
                <Users size={14} />
                <span>
                  {arbol.relaciones.length}{' '}
                  {arbol.relaciones.length === 1 ? 'relación registrada' : 'relaciones registradas'}
                </span>
                <span className="flex items-center gap-1.5 ml-3">
                  <span className="w-3 h-0.5 bg-red-700" />
                  Confirmada
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-600" />
                  Pendiente
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  Toca un vínculo para eliminarlo
                </span>
              </div>
              <ArbolView arbol={arbol} onUpdated={cargar} />
            </div>
          )}
        </div>

        <DashboardFooter />
      </main>
    </div>
  )
}