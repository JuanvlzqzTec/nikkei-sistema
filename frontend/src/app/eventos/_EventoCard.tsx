import Image from 'next/image'
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react'
import { type Evento, TIPO_LABELS, TIPO_COLORS, formatFecha, esFuturo } from './_types'

interface Props {
  evento: Evento
  onClick: () => void
}

export default function EventoCard({ evento, onClick }: Props) {
  const futuro = esFuturo(evento)

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Imagen */}
      <div className="relative h-48 bg-linear-to-br from-amber-50 to-orange-100 overflow-hidden shrink-0">
        {evento.imagen_evento ? (
          <>
            <Image
              src={evento.imagen_evento}
              alt={evento.titulo}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar size={40} className="text-amber-300/50" />
          </div>
        )}

        {/* Badge tipo */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${TIPO_COLORS[evento.tipo_evento] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {TIPO_LABELS[evento.tipo_evento] ?? evento.tipo_evento}
          </span>
        </div>

        {/* Badge estado */}
        {!futuro && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-sans px-2.5 py-1 rounded-full bg-black/40 text-white/80 backdrop-blur-sm">
              Finalizado
            </span>
          </div>
        )}

        {evento.status === 'en_curso' && futuro && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/90 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-sans text-white font-semibold">En curso</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Fecha */}
        <div className="flex items-center gap-2 text-sm font-sans text-amber-700 font-semibold">
          <Calendar size={13} />
          {formatFecha(evento.fecha_inicio, {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>

        {/* Título */}
        <h3 className="font-serif text-gray-900 text-xl leading-snug group-hover:text-red-800 transition-colors line-clamp-2">
          {evento.titulo}
        </h3>

        {/* Descripción */}
        {evento.descripcion && (
          <p className="text-base font-sans text-gray-500 leading-relaxed line-clamp-2 flex-1">
            {evento.descripcion}
          </p>
        )}

        {/* Pie */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            {(evento.ubicacion || evento.ciudad) && (
              <span className="flex items-center gap-1 text-sm font-sans text-gray-400">
                <MapPin size={11} />
                {evento.ciudad ?? evento.ubicacion}
              </span>
            )}
            {evento.capacidad_maxima && (
              <span className="flex items-center gap-1 text-sm font-sans text-gray-400">
                <Users size={11} />
                {evento.capacidad_maxima} personas
              </span>
            )}
          </div>

          <span className="flex items-center gap-1 text-sm font-sans font-semibold text-red-700 group-hover:gap-2 transition-all">
            Ver detalles <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </button>
  )
}