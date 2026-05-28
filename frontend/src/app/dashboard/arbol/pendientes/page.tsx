'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2, Check, X, User, Sparkles, AlertCircle } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { genealogiaApi, type PendienteResumen } from '@/lib/genealogiaApi'
import { TIPO_RELACION_LABELS } from '../_constants'

export default function PendientesPage() {
  const router = useRouter()
  const { isAuthenticated, user, checkAuth } = useAuthStore()

  const [pendientes, setPendientes] = useState<PendienteResumen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [procesandoId, setProcesandoId] = useState<number | null>(null)

  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await genealogiaApi.getPendientesConfirmacion()
      setPendientes(res.data || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos cargar las pendientes')
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

  const handleConfirmar = async (id: number) => {
    setProcesandoId(id)
    try {
      await genealogiaApi.confirmarRelacion(id)
      setPendientes((prev) => prev.filter((p) => p.id_genealogia !== id))
      setSuccess('Relación confirmada. Ya aparece en tu árbol.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al confirmar')
    } finally {
      setProcesandoId(null)
    }
  }

  const handleRechazar = async (id: number) => {
    if (!confirm('¿Rechazar esta relación? Se eliminará permanentemente.')) return
    setProcesandoId(id)
    try {
      await genealogiaApi.eliminarRelacion(id)
      setPendientes((prev) => prev.filter((p) => p.id_genealogia !== id))
      setSuccess('Relación rechazada')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al rechazar')
    } finally {
      setProcesandoId(null)
    }
  }

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
      <header className="bg-white/80 backdrop-blur-sm border-b border-red-800/15 shadow-sm sticky top-0 z-10 p-3">
        <div className="container-nikkei py-4 flex items-center justify-between gap-4">
          <Link href="/dashboard/arbol" className="flex items-center gap-3">
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
                Confirmaciones pendientes
              </p>
              <p className="font-sans text-xs text-red-600/70">
                Asociación Nikkei de Sinaloa
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/arbol"
            className="flex items-center gap-2 text-base font-sans text-red-700 hover:text-red-900 font-semibold cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Volver al árbol</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </div>
      </header>

      <main className="container-nikkei py-10 lg:py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <h1 className="font-serif text-4xl text-red-800 leading-tight pt-3">
              Confirmaciones pendientes
            </h1>
            <div className="mx-auto h-1 w-24 rounded-full bg-linear-to-r from-red-600 to-amber-400" />
            <p className="font-sans text-lg text-red-600/80 max-w-xl mx-auto">
              Alguien dice ser tu pariente. Confirma o rechaza para mantener tu
              árbol al día.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-700 shrink-0 mt-0.5" />
              <p className="font-sans text-base text-red-900 flex-1">{error}</p>
              <button onClick={() => setError('')} className="text-red-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 flex items-start gap-3">
              <Check size={20} className="text-green-700 shrink-0 mt-0.5" />
              <p className="font-sans text-base text-green-900 flex-1">{success}</p>
              <button onClick={() => setSuccess('')} className="text-green-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-red-700" />
            </div>
          ) : pendientes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-3">
                <Check size={28} className="text-green-600" />
              </div>
              <p className="font-serif text-xl text-gray-700 mb-1">
                Sin confirmaciones pendientes
              </p>
              <p className="font-sans text-base text-gray-400">
                No tienes solicitudes de parentesco esperando tu respuesta.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendientes.map((p) => {
                const nombreCorto = p.solicitante.nombres.split(' ')[0]
                const etiquetaQueDicen = TIPO_RELACION_LABELS[p.tipo_relacion] ?? p.tipo_relacion
                const etiquetaQueSeria = TIPO_RELACION_LABELS[p.tipo_inverso] ?? p.tipo_inverso
                const procesando = procesandoId === p.id_genealogia

                return (
                  <div
                    key={p.id_genealogia}
                    className="bg-white rounded-2xl border-2 border-amber-200 p-5 space-y-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-amber-100 shrink-0">
                        {p.solicitante.foto_perfil ? (
                          <Image
                            src={p.solicitante.foto_perfil}
                            alt={p.solicitante.nombre_completo}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={22} className="text-amber-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="inline-flex items-center gap-1 text-xs font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            <Sparkles size={10} />
                            Pendiente
                          </span>
                        </div>
                        <p className="font-serif text-lg text-gray-900 leading-tight">
                          {p.solicitante.nombre_completo}
                        </p>
                        <p className="font-sans text-sm text-gray-500 capitalize mt-0.5">
                          {p.solicitante.generacion} · Familia{' '}
                          {p.solicitante.apellido_familia}
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="font-sans text-base text-amber-900 leading-relaxed">
                        <strong>{nombreCorto}</strong> dice que tú eres su{' '}
                        <strong>{etiquetaQueDicen.toLowerCase()}</strong>. Si confirmas, en tu árbol aparecerá como tu{' '}
                        <strong>{etiquetaQueSeria.toLowerCase()}</strong>.
                      </p>
                      {p.notas && (
                        <p className="font-sans text-sm text-amber-800 italic mt-2 pt-2 border-t border-amber-200">
                          &ldquo;{p.notas}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleRechazar(p.id_genealogia)}
                        disabled={procesando}
                        className="flex-1 min-h-12 px-4 py-2.5 bg-white border-2 border-red-300 hover:border-red-500 hover:bg-red-50 text-red-700 font-sans font-semibold text-base rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <X size={16} />
                        Rechazar
                      </button>
                      <button
                        onClick={() => handleConfirmar(p.id_genealogia)}
                        disabled={procesando}
                        className="flex-1 min-h-12 px-4 py-2.5 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-sans font-semibold text-base rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {procesando ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                        Confirmar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}