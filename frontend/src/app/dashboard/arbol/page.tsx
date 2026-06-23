'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2, Users, Plus, Sparkles, GitBranch } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { genealogiaApi, type MiArbolResponse, type RelacionResumen } from '@/lib/genealogiaApi'
import { TIPO_RELACION_LABELS } from './_constants'
import ParienteCard from './_ParienteCard'
import DashboardFooter from '@/app/dashboard/_DashboardFooter'

// Grupos por categoría de relación
const GRUPO_INMEDIATA = ['padre', 'madre', 'esposo', 'esposa', 'hijo', 'hija', 'hermano', 'hermana']
const GRUPO_MAYORES = ['abuelo', 'abuela', 'tio', 'tia', 'suegro', 'suegra']
const GRUPO_MENORES = ['nieto', 'nieta', 'sobrino', 'sobrina', 'yerno', 'nuera']
const GRUPO_OTROS = ['primo', 'prima', 'cuniado', 'cuniada']

function clasificar(tipo: string): 'inmediata' | 'mayores' | 'menores' | 'otros' {
  if (GRUPO_INMEDIATA.includes(tipo)) return 'inmediata'
  if (GRUPO_MAYORES.includes(tipo)) return 'mayores'
  if (GRUPO_MENORES.includes(tipo)) return 'menores'
  return 'otros'
}

export default function MisParientesPage() {
  const router = useRouter()
  const { isAuthenticated, user, checkAuth } = useAuthStore()
  const [arbol, setArbol] = useState<MiArbolResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendientesCount, setPendientesCount] = useState(0)

  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [a, p] = await Promise.all([
        genealogiaApi.getMiArbol(),
        genealogiaApi.getPendientesConfirmacion().catch(() => ({ count: 0, data: [] })),
      ])
      setArbol(a)
      setPendientesCount(p.count)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No pudimos cargar tus parientes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) checkAuth()
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

  // Agrupar relaciones
  const grupos = {
    inmediata: [] as RelacionResumen[],
    mayores: [] as RelacionResumen[],
    menores: [] as RelacionResumen[],
    otros: [] as RelacionResumen[],
  }
  if (arbol) {
    for (const rel of arbol.relaciones) {
      grupos[clasificar(rel.tipo_relacion)].push(rel)
    }
  }

  const totalParientes = arbol?.relaciones.length ?? 0

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)' }}
    >
      <header className="bg-white/80 backdrop-blur-sm border-b border-red-800/15 shadow-sm sticky top-0 z-10 p-3">
        <div className="container-nikkei py-4 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/assets/Logo-Nikkei.png" alt="Asociación Nikkei" width={44} height={44} className="rounded-full" priority />
            <div className="hidden sm:block">
              <p className="font-serif text-red-800 text-base leading-tight">Mis parientes</p>
              <p className="font-sans text-xs text-red-600/70">Nikkei Culiacán AC</p>
            </div>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 text-base font-sans text-red-700 hover:text-red-900 font-semibold cursor-pointer">
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Volver al dashboard</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </div>
      </header>

      <main className="container-nikkei py-10 lg:py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <h1 className="font-serif text-4xl sm:text-5xl text-red-800 leading-tight pt-3">家族</h1>
            <h2 className="font-serif text-2xl text-red-700">Mis parientes</h2>
            <div className="mx-auto h-1 w-24 rounded-full bg-linear-to-r from-red-600 to-amber-400" />
            <p className="font-sans text-lg text-red-600/80 max-w-xl mx-auto">
              Tus conexiones familiares dentro de la comunidad Nikkei.
            </p>
          </div>

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

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Link
              href="/dashboard/arbol/agregar"
              className="inline-flex items-center justify-center gap-2 min-h-13 px-6 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus size={18} />
              Agregar pariente
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 size={32} className="animate-spin text-red-700" />
              <p className="font-sans text-base text-gray-600">Cargando...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-red-200">
              <p className="font-sans text-base text-red-700 mb-4">{error}</p>
              <button onClick={cargar} className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-sans font-semibold rounded-xl cursor-pointer">
                Intentar de nuevo
              </button>
            </div>
          ) : totalParientes === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-amber-300 px-6">
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <GitBranch size={36} className="text-amber-400" />
              </div>
              <h3 className="font-serif text-2xl text-red-800 mb-2">Aún no tienes parientes registrados</h3>
              <p className="font-sans text-base text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
                Empieza a conectar con tu familia agregando a tus padres, hijos, hermanos o cualquier otro pariente.
              </p>
              <Link
                href="/dashboard/arbol/agregar"
                className="inline-flex items-center gap-2 min-h-13 px-6 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-sans font-semibold text-base rounded-xl shadow-md cursor-pointer"
              >
                <Plus size={18} />
                Agregar mi primer pariente
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center gap-2 text-sm font-sans text-gray-500">
                <Users size={14} />
                <span>{totalParientes} {totalParientes === 1 ? 'pariente' : 'parientes'} en total</span>
              </div>

              {grupos.inmediata.length > 0 && (
                <GrupoSeccion titulo="Familia inmediata" descripcion="Padres, hermanos, hijos y pareja" relaciones={grupos.inmediata} onUpdated={cargar} />
              )}
              {grupos.mayores.length > 0 && (
                <GrupoSeccion titulo="Generaciones mayores" descripcion="Abuelos, tíos y suegros" relaciones={grupos.mayores} onUpdated={cargar} />
              )}
              {grupos.menores.length > 0 && (
                <GrupoSeccion titulo="Generaciones menores" descripcion="Nietos, sobrinos, yerno y nuera" relaciones={grupos.menores} onUpdated={cargar} />
              )}
              {grupos.otros.length > 0 && (
                <GrupoSeccion titulo="Otros parientes" descripcion="Primos y cuñados" relaciones={grupos.otros} onUpdated={cargar} />
              )}
            </div>
          )}
        </div>

        <DashboardFooter />
      </main>
    </div>
  )
}

function GrupoSeccion({
  titulo,
  descripcion,
  relaciones,
  onUpdated,
}: {
  titulo: string
  descripcion: string
  relaciones: RelacionResumen[]
  onUpdated: () => void
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-serif text-xl text-red-800">{titulo}</h3>
        <p className="font-sans text-sm text-gray-500">{descripcion}</p>
      </div>
      <div className="space-y-2">
        {relaciones.map((rel) => (
          <ParienteCard
            key={rel.id_genealogia}
            relacion={rel}
            etiqueta={TIPO_RELACION_LABELS[rel.tipo_relacion] ?? rel.tipo_relacion}
            onUpdated={onUpdated}
          />
        ))}
      </div>
    </section>
  )
}