'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Calendar, MapPin, Users, Phone, ExternalLink, Ticket, Clock } from 'lucide-react'
import ModalRegistroEvento from './_ModalRegistroEvento'
import {
  type Evento,
  TIPO_LABELS, TIPO_BADGE_SOLID,
  formatFecha, formatHora, esFuturo,
} from './_types'

interface Props {
  evento: Evento
  onClose: () => void
}

export default function EventoModal({ evento, onClose }: Props) {
  const futuro = esFuturo(evento)
  const [showRegistro, setShowRegistro] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-xl my-10 overflow-hidden">

        {/* Imagen */}
        <div className="relative h-52 bg-linear-to-br from-amber-50 to-orange-100">
          {evento.imagen_evento ? (
            <>
              <Image src={evento.imagen_evento} alt={evento.titulo} fill className="object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Calendar size={48} className="text-amber-300/50" />
            </div>
          )}

          <span className={`absolute top-4 left-4 text-[11px] font-sans font-bold uppercase tracking-wider px-3 py-1 rounded-full ${TIPO_BADGE_SOLID[evento.tipo_evento] ?? 'bg-gray-700 text-white'}`}>
            {TIPO_LABELS[evento.tipo_evento] ?? evento.tipo_evento}
          </span>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/25 hover:bg-black/45 text-white flex items-center justify-center transition-colors"
          >
            <X size={15} />
          </button>

          {evento.imagen_evento && (
            <h2 className="absolute bottom-4 left-5 right-5 text-white font-serif text-xl leading-tight drop-shadow">
              {evento.titulo}
            </h2>
          )}
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-5">

          {!evento.imagen_evento && (
            <h2 className="font-serif text-xl text-gray-900 leading-tight">{evento.titulo}</h2>
          )}

          {/* Metadatos en línea */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 text-base font-sans text-gray-600">
              <Calendar size={14} className="text-amber-600 shrink-0" />
              <span>
                Evento inicia el {formatFecha(evento.fecha_inicio, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}
                <span className="text-gray-400">{formatHora(evento.fecha_inicio)} hrs</span>
              </span>
            </div>

            {evento.fecha_fin && (
              <div className="flex items-center gap-2.5 text-base font-sans text-gray-600">
                <Clock size={14} className="text-amber-600 shrink-0" />
                <span>
                  Hasta el {formatFecha(evento.fecha_fin, { weekday: 'long', day: 'numeric', month: 'long' })}
                  {' · '}
                  <span className="text-gray-400">{formatHora(evento.fecha_fin)} hrs</span>
                </span>
              </div>
            )}

            {(evento.ubicacion || evento.ciudad) && (
              <div className="flex items-start gap-2.5 text-base font-sans text-gray-600">
                <MapPin size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  {[evento.ubicacion, evento.ciudad].filter(Boolean).join(', ')}
                  {evento.direccion && (
                    <span className="text-gray-400 block text-xs mt-0.5">{evento.direccion}</span>
                  )}
                </span>
              </div>
            )}

            {evento.capacidad_maxima && (
              <div className="flex items-center gap-2.5 text-base font-sans text-gray-600">
                <Users size={14} className="text-amber-600 shrink-0" />
                <span>Capacidad: {evento.capacidad_maxima} personas</span>
              </div>
            )}
          </div>

          {evento.descripcion && <div className="h-px bg-gray-100" />}

          {evento.descripcion && (
            <p className="text-sm font-sans text-gray-600 leading-relaxed">
              {evento.descripcion}
            </p>
          )}

          {evento.requisitos && (
            <>
              <div className="h-px bg-gray-100" />
              <div>
                <p className="text-sm font-sans font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Requisitos
                </p>
                <p className="text-sm font-sans text-gray-600 leading-relaxed">
                  {evento.requisitos}
                </p>
              </div>
            </>
          )}

          {(evento.contacto_organizador || evento.link_transmision) && (
            <>
              <div className="h-px bg-gray-100" />
              <div className="flex flex-col gap-2">
                {evento.contacto_organizador && (
                  <div className="flex items-center gap-2.5 text-base font-sans text-gray-600">
                    <Phone size={14} className="text-gray-400 shrink-0" />
                    <span>{evento.contacto_organizador}</span>
                  </div>
                )}
                {evento.link_transmision && (
                  <a
                    href={evento.link_transmision}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-base font-sans text-red-700 hover:text-red-900 transition-colors"
                  >
                    <ExternalLink size={14} className="shrink-0" />
                    <span className="underline underline-offset-2 truncate">Ver transmisión en vivo</span>
                  </a>
                )}
              </div>
            </>
          )}

          {futuro && evento.requiere_registro && (
            <>
              <button
                onClick={() => setShowRegistro(true)}
                className="w-full btn-nikkei py-3 text-base flex items-center justify-center gap-2 mt-1"
              >
                <Ticket size={17} />
                Registrarme para este evento
              </button>
              {showRegistro && (
                <ModalRegistroEvento
                  evento={evento}
                  onClose={() => setShowRegistro(false)}
                />
              )}
            </>
          )}

          {!futuro && (
            <p className="text-center text-xs font-sans text-gray-400">
              Este evento ya finalizó
            </p>
          )}
        </div>
      </div>
    </div>
  )
}