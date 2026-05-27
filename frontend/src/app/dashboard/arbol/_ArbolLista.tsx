'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { User, ChevronRight, Trash2, Loader2, Clock, X } from 'lucide-react'
import { genealogiaApi, type MiArbolResponse, type RelacionResumen } from '@/lib/genealogiaApi'
import { TIPO_RELACION_LABELS, NIVEL_GENERACION } from './_constants'

interface Props {
  arbol: MiArbolResponse
  onUpdated: () => void
}

interface GrupoRelaciones {
  titulo: string
  emoji: string
  relaciones: RelacionResumen[]
}

export default function ArbolLista({ arbol, onUpdated }: Props) {
  const [relacionActiva, setRelacionActiva] = useState<RelacionResumen | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState('')

  const grupos = useMemo<GrupoRelaciones[]>(() => {
    const mayores: RelacionResumen[] = []
    const mismaGen: RelacionResumen[] = []
    const menores: RelacionResumen[] = []

    for (const r of arbol.relaciones) {
      const nivel = NIVEL_GENERACION[r.tipo_relacion] ?? 0
      if (nivel > 0) mayores.push(r)
      else if (nivel < 0) menores.push(r)
      else mismaGen.push(r)
    }

    const result: GrupoRelaciones[] = []
    if (mayores.length > 0)
      result.push({ titulo: 'Generaciones mayores', emoji: '⬆️', relaciones: mayores })
    if (mismaGen.length > 0)
      result.push({ titulo: 'Mi generación', emoji: '↔️', relaciones: mismaGen })
    if (menores.length > 0)
      result.push({ titulo: 'Generaciones menores', emoji: '⬇️', relaciones: menores })
    return result
  }, [arbol.relaciones])

  const handleEliminar = async () => {
    if (!relacionActiva) return
    setEliminando(true)
    setError('')
    try {
      await genealogiaApi.eliminarRelacion(relacionActiva.id_genealogia)
      setRelacionActiva(null)
      onUpdated()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <>
      <div className="space-y-8">
        {grupos.map((grupo) => (
          <section key={grupo.titulo}>
            <h3 className="font-sans text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>{grupo.emoji}</span>
              {grupo.titulo}
              <span className="ml-auto text-xs text-gray-400 font-normal normal-case tracking-normal">
                {grupo.relaciones.length}{' '}
                {grupo.relaciones.length === 1 ? 'pariente' : 'parientes'}
              </span>
            </h3>
            <div className="space-y-2">
              {grupo.relaciones.map((r) => {
                const etiqueta = TIPO_RELACION_LABELS[r.tipo_relacion] ?? r.tipo_relacion
                return (
                  <button
                    key={r.id_genealogia}
                    onClick={() => setRelacionActiva(r)}
                    className={`w-full text-left p-4 bg-white rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 hover:shadow-sm ${
                      r.confirmado_ambas_partes
                        ? 'border-amber-100 hover:border-amber-300'
                        : 'border-amber-300 bg-amber-50/40 hover:border-amber-400'
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-amber-100 shrink-0">
                      {r.pariente.foto_perfil ? (
                        <Image
                          src={r.pariente.foto_perfil}
                          alt={r.pariente.nombre_completo}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={20} className="text-amber-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-xs font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          {etiqueta}
                        </span>
                        {!r.confirmado_ambas_partes && (
                          <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Clock size={10} />
                            {r.yo_soy_quien === 'persona'
                              ? 'Esperando confirmación'
                              : 'Por confirmar'}
                          </span>
                        )}
                      </div>
                      <p className="font-serif text-base text-gray-900 leading-tight truncate">
                        {r.pariente.nombre_completo}
                      </p>
                      <p className="font-sans text-xs text-gray-500 capitalize">
                        {r.pariente.generacion} · Familia {r.pariente.apellido_familia}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 shrink-0" />
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Modal detalle/eliminar */}
      {relacionActiva && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !eliminando && setRelacionActiva(null)}
          />
          <div className="relative z-10 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-sans text-sm text-red-700 font-bold uppercase tracking-wider mb-1">
                  {TIPO_RELACION_LABELS[relacionActiva.tipo_relacion] ??
                    relacionActiva.tipo_relacion}
                </p>
                <h3 className="font-serif text-xl text-gray-900 leading-tight">
                  {relacionActiva.pariente.nombre_completo}
                </h3>
                <p className="font-sans text-sm text-gray-500 capitalize mt-0.5">
                  {relacionActiva.pariente.generacion} · Familia{' '}
                  {relacionActiva.pariente.apellido_familia}
                </p>
              </div>
              <button
                onClick={() => setRelacionActiva(null)}
                disabled={eliminando}
                className="text-gray-400 hover:text-gray-700 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {!relacionActiva.confirmado_ambas_partes && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm font-sans text-amber-900">
                {relacionActiva.yo_soy_quien === 'persona'
                  ? 'Esta relación está esperando confirmación del otro lado.'
                  : 'Esta persona dice ser tu pariente. Ve a "Pendientes" para confirmar.'}
              </div>
            )}

            {relacionActiva.notas && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <p className="font-sans text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Notas
                </p>
                <p className="font-sans text-sm text-gray-700 italic">
                  &ldquo;{relacionActiva.notas}&rdquo;
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-sm font-sans text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => setRelacionActiva(null)}
                disabled={eliminando}
                className="flex-1 min-h-12 px-5 py-2.5 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-sans font-semibold text-base rounded-xl cursor-pointer disabled:opacity-50"
              >
                Cerrar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminando}
                className="flex-1 min-h-12 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-sans font-semibold text-base rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {eliminando ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Eliminar relación
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}