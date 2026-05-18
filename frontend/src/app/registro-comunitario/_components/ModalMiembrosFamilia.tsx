'use client'

import { useEffect, useState } from 'react'
import { X, Check, Loader2, Users, AlertCircle } from 'lucide-react'
import { registroApi } from '@/lib/registroApi'
import type { FamiliaPublica, MiembroPublico } from '../_types'
import { GENERACIONES } from '../_constants'

interface Props {
  familia: FamiliaPublica
  onClose: () => void
  onConfirmar: () => void
}

export default function ModalMiembrosFamilia({
  familia,
  onClose,
  onConfirmar,
}: Props) {
  const [miembros, setMiembros] = useState<MiembroPublico[]>([])
  const [totalMiembros, setTotalMiembros] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true)
        setError(false)
        const res = await registroApi.getMiembrosPublicos(familia.id_familia)
        setMiembros(res.miembros_publicos || [])
        setTotalMiembros(res.total_miembros || 0)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [familia.id_familia])

  // Cerrar con Escape + bloquear scroll del body
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const miembrosOcultos = totalMiembros - miembros.length
  const labelGeneracion = (gen: string) =>
    GENERACIONES.find((g) => g.value === gen)?.label ?? gen

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <p className="font-sans text-sm text-gray-500 uppercase tracking-wide mb-1">
              ¿Es esta tu familia?
            </p>
            <h3 className="font-serif text-2xl text-red-800 leading-tight">
              Familia {familia.apellido_jp}
              {familia.apellido_kanji && (
                <span className="ml-2 text-lg text-gray-500">
                  ({familia.apellido_kanji})
                </span>
              )}
            </h3>
            {familia.prefectura_origen && (
              <p className="font-sans text-base text-gray-600 mt-1">
                Origen: {familia.prefectura_origen}, Japón
                {familia.anio_llegada_mexico &&
                  ` · Llegó a México en ${familia.anio_llegada_mexico}`}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 size={28} className="animate-spin text-red-700" />
              <p className="font-sans text-base text-gray-500">
                Cargando miembros...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-red-700 shrink-0 mt-0.5"
              />
              <p className="font-sans text-base text-red-700">
                No pudimos cargar los miembros de esta familia. Intenta de
                nuevo más tarde.
              </p>
            </div>
          ) : (
            <>
              {/* Resumen de visibilidad */}
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                <Users size={20} className="text-amber-700 shrink-0" />
                <div className="text-base font-sans text-amber-900">
                  Esta familia tiene{' '}
                  <strong>{totalMiembros}</strong>{' '}
                  {totalMiembros === 1 ? 'miembro' : 'miembros'} en total.
                  {miembrosOcultos > 0 && (
                    <span className="block text-sm text-amber-700 mt-1">
                      {miembros.length} aparecen aquí, {miembrosOcultos} prefieren
                      mantener su nombre privado.
                    </span>
                  )}
                </div>
              </div>

              {/* Lista de miembros */}
              {miembros.length === 0 ? (
                <div className="text-center py-8 px-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="font-sans text-base text-gray-600 leading-relaxed">
                    Ninguno de los miembros de esta familia ha aceptado aparecer
                    públicamente. Si estás seguro de que es tu familia, puedes
                    continuar.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {miembros.map((m) => {
                    const nombreCompleto = [
                      m.nombres,
                      m.apellido_paterno,
                      m.apellido_materno,
                    ]
                      .filter(Boolean)
                      .join(' ')
                    return (
                      <li
                        key={m.id_persona}
                        className="flex items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg"
                      >
                        <span className="font-sans text-base text-gray-800 font-medium">
                          {nombreCompleto}
                        </span>
                        <span className="font-sans text-sm text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full shrink-0">
                          {labelGeneracion(m.generacion)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}
        </div>

        {/* Footer con botones */}
        <div className="px-6 py-5 border-t border-gray-100 space-y-3 shrink-0">
          <button
            type="button"
            onClick={onConfirmar}
            disabled={loading || error}
            className="w-full min-h-14 px-6 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-sans font-semibold text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check size={20} />
            Sí, esta es mi familia
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-12 px-6 py-2.5 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-sans font-semibold text-base rounded-xl transition-all duration-200 cursor-pointer"
          >
            No, regresar
          </button>
        </div>
      </div>
    </div>
  )
}