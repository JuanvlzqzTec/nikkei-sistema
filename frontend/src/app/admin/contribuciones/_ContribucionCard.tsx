'use client'

import { useState } from 'react'
import {
  ChevronDown,
  Check,
  X,
  Mail,
  Phone,
  Calendar,
  Loader2,
  MessageSquare,
} from 'lucide-react'
import type { ContribucionAdmin } from '@/lib/contribucionesApi'

interface Props {
  contribucion: ContribucionAdmin
  onMarcar: (estado: 'atendida' | 'descartada', notaAdmin?: string) => Promise<void>
  procesando?: boolean
}

const ESTADO_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
  atendida: { bg: 'bg-green-100', text: 'text-green-700', label: 'Atendida' },
  descartada: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Descartada' },
}

function formatFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

export default function ContribucionCard({ contribucion, onMarcar, procesando }: Props) {
  const [expandido, setExpandido] = useState(false)
  const [accionPendiente, setAccionPendiente] = useState<'atendida' | 'descartada' | null>(null)
  const [notaAdmin, setNotaAdmin] = useState('')

  const persona = contribucion.persona
  const nombreCompleto = persona
    ? [persona.nombres, persona.apellido_paterno, persona.apellido_materno]
        .filter(Boolean)
        .join(' ')
    : '—'

  const estadoInfo = ESTADO_COLORS[contribucion.estado] ?? ESTADO_COLORS.pendiente

  const telefonoPreferido =
    contribucion.telefono_contacto || persona?.telefono_principal

  const confirmarAccion = async () => {
    if (!accionPendiente) return
    await onMarcar(accionPendiente, notaAdmin.trim() || undefined)
    setAccionPendiente(null)
    setNotaAdmin('')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 transition-all">
      {/* Cabecera */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-gray-50/50 transition-colors rounded-xl"
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <MessageSquare size={16} className="text-amber-700" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-xs font-sans font-semibold px-2 py-0.5 rounded-full ${estadoInfo.bg} ${estadoInfo.text}`}
              >
                {estadoInfo.label}
              </span>
            </div>
            <p className="font-sans font-semibold text-gray-800 truncate">
              {nombreCompleto}
            </p>
            <p className="font-sans text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
              <Mail size={11} />
              {contribucion.email}
            </p>
            <p className="font-sans text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Calendar size={11} />
              {formatFecha(contribucion.created_at)}
            </p>
          </div>
        </div>

        <ChevronDown
          size={18}
          className={`text-gray-400 shrink-0 mt-2 transition-transform duration-200 ${
            expandido ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Detalle */}
      {expandido && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          {/* Mensaje */}
          <div>
            <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Mensaje
            </p>
            <p className="font-sans text-base text-gray-700 leading-relaxed whitespace-pre-wrap p-4 bg-gray-50 rounded-lg border border-gray-100">
              {contribucion.mensaje}
            </p>
          </div>

          {/* Contacto */}
          {telefonoPreferido && (
            <div>
              <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Teléfono de contacto
              </p>
              <div className="flex items-center gap-2 text-sm font-sans text-gray-700">
                <Phone size={13} className="text-amber-600" />
                {telefonoPreferido}
                {contribucion.telefono_contacto && (
                  <span className="text-xs text-gray-400">(preferido)</span>
                )}
              </div>
            </div>
          )}

          {/* Nota admin existente */}
          {contribucion.nota_admin && contribucion.estado !== 'pendiente' && (
            <div>
              <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Nota administrativa
              </p>
              <p className="font-sans text-sm text-gray-600 italic p-3 bg-gray-50 rounded-lg border border-gray-100">
                {contribucion.nota_admin}
              </p>
            </div>
          )}

          {/* Confirmación de acción */}
          {accionPendiente && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 space-y-3">
              <p className="font-sans text-sm text-amber-900 font-semibold">
                Confirma marcar como{' '}
                <strong>
                  {accionPendiente === 'atendida' ? 'atendida' : 'descartada'}
                </strong>
              </p>
              <textarea
                value={notaAdmin}
                onChange={(e) => setNotaAdmin(e.target.value)}
                rows={3}
                placeholder="Agrega una nota interna (opcional)..."
                className="w-full text-sm font-sans px-3 py-2 border-2 border-amber-200 rounded-lg bg-white focus:border-amber-500 focus:outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setAccionPendiente(null)}
                  className="flex-1 px-4 py-2 text-sm font-sans text-gray-600 hover:text-gray-800 cursor-pointer"
                  disabled={procesando}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarAccion}
                  disabled={procesando}
                  className={`flex-1 px-4 py-2 text-sm font-sans font-semibold rounded-lg text-white cursor-pointer disabled:opacity-50 ${
                    accionPendiente === 'atendida'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {procesando ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Confirmar'}
                </button>
              </div>
            </div>
          )}

          {/* Botones de acción (solo si pendiente y no hay acción en curso) */}
          {contribucion.estado === 'pendiente' && !accionPendiente && (
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setAccionPendiente('atendida')}
                disabled={procesando}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-sans font-semibold cursor-pointer disabled:opacity-50"
              >
                <Check size={14} />
                Marcar como atendida
              </button>
              <button
                onClick={() => setAccionPendiente('descartada')}
                disabled={procesando}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 text-gray-700 hover:text-red-700 text-sm font-sans font-semibold cursor-pointer disabled:opacity-50"
              >
                <X size={14} />
                Descartar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}