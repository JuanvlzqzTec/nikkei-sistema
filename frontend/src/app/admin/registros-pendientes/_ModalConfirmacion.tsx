'use client'

import { useEffect, useState } from 'react'
import { X, Check, AlertTriangle, Loader2 } from 'lucide-react'

interface Props {
  modo: 'aprobar' | 'rechazar'
  nombrePersona: string
  emailUsuario: string
  familiaEsNueva?: boolean
  apellidoFamilia?: string
  onConfirm: (motivo?: string) => Promise<void>
  onClose: () => void
}

export default function ModalConfirmacion({
  modo,
  nombrePersona,
  emailUsuario,
  familiaEsNueva,
  apellidoFamilia,
  onConfirm,
  onClose,
}: Props) {
  const [motivo, setMotivo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Bloquear scroll del body + ESC para cerrar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose, submitting])

  const handleConfirm = async () => {
    setSubmitting(true)
    setError('')
    try {
      await onConfirm(modo === 'rechazar' ? motivo.trim() : undefined)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al procesar la solicitud')
      setSubmitting(false)
    }
  }

  const esAprobar = modo === 'aprobar'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !submitting && onClose()}
      />

      {/* Panel */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                esAprobar
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {esAprobar ? <Check size={18} /> : <AlertTriangle size={18} />}
            </div>
            <h2 className="font-serif text-gray-900 text-lg leading-tight pt-1">
              {esAprobar ? '¿Aprobar este registro?' : '¿Rechazar este registro?'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Resumen de quién */}
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-1">
            <p className="font-sans text-sm text-gray-500">
              {esAprobar ? 'Vas a aprobar a:' : 'Vas a rechazar a:'}
            </p>
            <p className="font-sans font-semibold text-gray-800">
              {nombrePersona}
            </p>
            <p className="font-sans text-xs text-gray-400">{emailUsuario}</p>
          </div>

          {/* Aviso de familia nueva (solo en aprobar) */}
          {esAprobar && familiaEsNueva && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <p className="text-sm font-sans text-amber-800 leading-relaxed">
                Esta acción también <strong>aprobará la familia nueva</strong>
                {apellidoFamilia ? ` "${apellidoFamilia}"` : ''} para que aparezca
                en el directorio público.
              </p>
            </div>
          )}

          {/* Mensaje de aprobación */}
          {esAprobar && (
            <p className="text-sm font-sans text-gray-600 leading-relaxed">
              El usuario será activado como miembro de la comunidad y podrá
              participar plenamente en eventos y actividades.
            </p>
          )}

          {/* Campo motivo (solo en rechazar) */}
          {!esAprobar && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">
                Motivo del rechazo
                <span className="font-normal text-gray-400 ml-1">(opcional)</span>
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={4}
                placeholder="Ej: Información incompleta, datos incorrectos, familia ya registrada..."
                disabled={submitting}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 resize-none disabled:opacity-50"
                maxLength={500}
              />
              <p className="text-xs text-gray-400 font-sans mt-1">
                Este motivo se guardará para referencia interna.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <X size={14} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-sans">{error}</p>
            </div>
          )}
        </div>

        {/* Footer botones */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-sans text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className={`px-5 py-2 text-sm font-sans font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              esAprobar
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : esAprobar ? (
              <Check size={15} />
            ) : (
              <X size={15} />
            )}
            {esAprobar ? 'Sí, aprobar' : 'Sí, rechazar'}
          </button>
        </div>
      </div>
    </div>
  )
}