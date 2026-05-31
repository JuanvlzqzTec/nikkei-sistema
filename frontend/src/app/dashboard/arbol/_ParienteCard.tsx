'use client'

import { useState } from 'react'
import Image from 'next/image'
import { User, Trash2, Loader2, X, Clock, Check } from 'lucide-react'
import { genealogiaApi, type RelacionResumen } from '@/lib/genealogiaApi'

interface Props {
  relacion: RelacionResumen
  etiqueta: string
  onUpdated: () => void
}

export default function ParienteCard({ relacion, etiqueta, onUpdated }: Props) {
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState('')

  const handleEliminar = async () => {
    setEliminando(true)
    setError('')
    try {
      await genealogiaApi.eliminarRelacion(relacion.id_genealogia)
      onUpdated()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
      setEliminando(false)
    }
  }

  return (
    <div
      className={`bg-white rounded-xl border-2 transition-all ${
        relacion.confirmado_ambas_partes
          ? 'border-amber-100 hover:border-amber-300'
          : 'border-amber-300 bg-amber-50/40'
      }`}
    >
      <div className="p-4 flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-amber-100 shrink-0">
          {relacion.pariente.foto_perfil ? (
            <Image src={relacion.pariente.foto_perfil} alt={relacion.pariente.nombre_completo} fill className="object-cover" />
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
            {!relacion.confirmado_ambas_partes && (
              <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                <Clock size={10} />
                {relacion.yo_soy_quien === 'persona' ? 'Esperando confirmación' : 'Por confirmar'}
              </span>
            )}
          </div>
          <p className="font-serif text-base text-gray-900 leading-tight truncate">
            {relacion.pariente.nombre_completo}
          </p>
          <p className="font-sans text-xs text-gray-500 capitalize">
            {relacion.pariente.generacion} · Familia {relacion.pariente.apellido_familia}
          </p>
        </div>

        <button
          onClick={() => setConfirmandoEliminar(true)}
          disabled={eliminando}
          className="p-2 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          title="Eliminar relación"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {confirmandoEliminar && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
          <p className="font-sans text-sm text-gray-700">
            ¿Eliminar a <strong>{relacion.pariente.nombre_completo}</strong> como tu <strong>{etiqueta.toLowerCase()}</strong>?
          </p>
          {error && (
            <p className="font-sans text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmandoEliminar(false)}
              disabled={eliminando}
              className="flex-1 px-3 py-2 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-sans font-semibold text-sm rounded-lg cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleEliminar}
              disabled={eliminando}
              className="flex-1 px-3 py-2 bg-red-700 hover:bg-red-800 text-white font-sans font-semibold text-sm rounded-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {eliminando ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Sí, eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}