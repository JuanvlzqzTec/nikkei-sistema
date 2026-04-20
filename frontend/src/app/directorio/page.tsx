'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Building2, Search, X } from 'lucide-react'
import { type Empresa, getGirosUnicos } from './_types'
import EmpresaCard from './_EmpresaCard'
import EmpresaModal from './_EmpresaModal'
import SiteHeader from '@/components/SiteHeader'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Skeleton
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-36 bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  )
}

// Pagina
export default function DirectorioPage() {
  const [todas, setTodas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [empresaActiva, setEmpresaActiva] = useState<Empresa | null>(null)
  const [filtroGiro, setFiltroGiro] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)
      const res = await fetch(`${API_URL}/api/v1/empresas/`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      // Solo aprobadas que aceptan promoción en directorio
      const visibles = (data.data as Empresa[]).filter(
        (e) => e.status_aprobacion === 'aprobada' && e.acepta_promocion_directorio
      )
      setTodas(visibles)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const giros = useMemo(() => getGirosUnicos(todas), [todas])

  const lista = useMemo(() => {
    return todas.filter((e) => {
      const matchGiro = !filtroGiro || e.giro_comercial === filtroGiro
      const matchBusqueda = !busqueda ||
        e.nombre_empresa.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.giro_comercial?.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      return matchGiro && matchBusqueda
    })
  }, [todas, filtroGiro, busqueda])

  return (
    <>
      <SiteHeader variant="page" />

      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)' }}>

        {/* Header */}
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'radial-gradient(circle, #8B2635 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />

          <div className="relative z-10 container-nikkei pt-12 pb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-4xl lg:text-5xl font-serif text-gray-900 leading-tight pt-2">
                  日系ビジネスの推進
                </h1>
                <h2 className="text-2xl font-serif text-red-800">
                  Impulso Nikkei
                </h2>
                <div className="w-16 h-0.5 bg-linear-to-r from-red-700 to-amber-400 rounded-full" />
                <p className="text-lg font-sans text-gray-600 max-w-lg">
                  Descubre y apoya los emprendimientos de nuestra comunidad japonesa en Sinaloa.
                  Cada empresa representa el esfuerzo y el espíritu de nuestras familias Nikkei.
                </p>
              </div>

              {/* Contador */}
              {!loading && (
                <div className="flex gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-3xl font-serif text-red-800">{todas.length}</p>
                    <p className="text-xs font-sans text-gray-500 uppercase tracking-wider">Empresas</p>
                  </div>
                  {giros.length > 0 && (
                    <>
                      <div className="w-px bg-red-200" />
                      <div className="text-center">
                        <p className="text-3xl font-serif text-gray-400">{giros.length}</p>
                        <p className="text-xs font-sans text-gray-500 uppercase tracking-wider">Giros</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ola de transicion */}
        <div className="relative -mb-1">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 10 L0 35 Q360 65 720 35 Q1080 5 1440 35 L1440 60 L0 60 Z" fill="white"/>
          </svg>
        </div>

        {/* Contenido */}
        <div className="bg-white">
          <div className="container-nikkei pt-8 pb-20">

            {/* Buscador + filtro por giro */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              {/* Buscador */}
              <div className="relative flex-1 pt-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar empresa..."
                  className="w-full pl-10 pr-4 py-2.5 text-base font-sans border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 bg-white"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filtro por giro */}
              {giros.length > 0 && (
                <div className="flex gap-1.5 flex-wrap sm:flex-nowrap pt-1">
                  <button
                    onClick={() => setFiltroGiro('')}
                    className={`px-4 py-2.5 rounded-xl text-base font-sans font-semibold transition-all duration-200 whitespace-nowrap ${
                      filtroGiro === ''
                        ? 'bg-red-800 text-white shadow-sm'
                        : 'border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Todos
                  </button>
                  {giros.map((giro) => (
                    <button
                      key={giro}
                      onClick={() => setFiltroGiro(giro === filtroGiro ? '' : giro)}
                      className={`px-4 py-2.5 rounded-xl text-base font-sans font-semibold transition-all duration-200 whitespace-nowrap ${
                        filtroGiro === giro
                          ? 'bg-red-800 text-white shadow-sm'
                          : 'border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {giro}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Resultados */}
            {error ? (
              <div className="text-center py-24">
                <p className="text-gray-400 font-sans mb-4">No se pudo cargar el directorio.</p>
                <button
                  onClick={cargar}
                  className="text-red-700 font-sans text-sm underline cursor-pointer hover:text-red-900"
                >
                  Intentar de nuevo
                </button>
              </div>

            ) : loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
              </div>

            ) : lista.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Building2 size={28} className="text-amber-400" />
                </div>
                <p className="font-serif text-xl text-gray-600 mb-2">
                  {busqueda || filtroGiro ? 'Sin resultados' : 'Sin empresas registradas'}
                </p>
                <p className="text-sm font-sans text-gray-400">
                  {busqueda || filtroGiro
                    ? 'Prueba con otro término o quita los filtros.'
                    : 'Pronto aparecerán las empresas de nuestra comunidad.'}
                </p>
                {(busqueda || filtroGiro) && (
                  <button
                    onClick={() => { setBusqueda(''); setFiltroGiro('') }}
                    className="mt-4 text-red-700 font-sans text-sm underline cursor-pointer hover:text-red-900"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>

            ) : (
              <>
                {/* Contador de resultados si hay filtro activo */}
                {(busqueda || filtroGiro) && (
                  <p className="text-sm font-sans text-gray-400 mb-5">
                    {lista.length} {lista.length === 1 ? 'empresa encontrada' : 'empresas encontradas'}
                  </p>
                )}

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {lista.map((em) => (
                    <EmpresaCard
                      key={em.id_empresa}
                      empresa={em}
                      onClick={() => setEmpresaActiva(em)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* CTA — registra tu empresa */}
            {!loading && !error && (
              <div className="mt-16 pt-12 border-t border-gray-100 text-center">
                <p className="font-serif text-2xl text-gray-700 mb-2">
                  ¿Tienes una empresa Nikkei?
                </p>
                <p className="text-base font-sans text-gray-400 mb-6 max-w-md mx-auto">
                  Forma parte del directorio y conecta con la comunidad. El registro es gratuito y queda a tu criterio si deseas aparecer públicamente.
                </p>
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3 border-2 border-red-800 text-red-800 hover:bg-red-800 hover:text-white font-sans font-semibold rounded-xl transition-all duration-300 text-base"
                >
                  Registrar mi empresa
                </a>
                <p className="font-serif text-4xl text-red-900/10 select-none mt-10">商</p>
                <p className="text-xs font-sans text-gray-400 mt-2 uppercase tracking-wider">
                  Asociación Nikkei · Culiacán, Sinaloa
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {empresaActiva && (
        <EmpresaModal
          empresa={empresaActiva}
          onClose={() => setEmpresaActiva(null)}
        />
      )}
    </>
  )
}