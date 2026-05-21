'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  MapPin,
  ArrowRight,
  Loader2,
  Clock,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Evento {
  id_evento: number
  titulo: string
  descripcion?: string
  tipo_evento: string
  fecha_inicio: string
  ubicacion?: string
  ciudad?: string
  imagen_evento?: string
}

const TIPO_LABELS: Record<string, string> = {
  matsuri: 'Matsuri',
  reunion: 'Reunión',
  cultural: 'Cultural',
  deportivo: 'Deportivo',
  educativo: 'Educativo',
  empresarial: 'Empresarial',
  ceremonia: 'Ceremonia',
}

const TIPO_COLORS: Record<string, string> = {
  matsuri: 'bg-red-100 text-red-700',
  reunion: 'bg-amber-100 text-amber-700',
  cultural: 'bg-orange-100 text-orange-700',
  deportivo: 'bg-green-100 text-green-700',
  educativo: 'bg-blue-100 text-blue-700',
  empresarial: 'bg-purple-100 text-purple-700',
  ceremonia: 'bg-rose-100 text-rose-700',
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    timeZone: 'America/Mazatlan',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', {
    timeZone: 'America/Mazatlan',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ProximosEventos() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true)
        setError(false)
        const res = await fetch(`${API_URL}/api/v1/eventos/proximos?limite=3`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setEventos(data.data || [])
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-red-700" />
          <h2 className="font-serif text-2xl text-red-800">
            Próximos eventos
          </h2>
        </div>
        <div className="flex justify-center py-12 bg-white/60 rounded-2xl border border-amber-100">
          <Loader2 size={28} className="animate-spin text-red-700" />
        </div>
      </section>
    )
  }

  if (error || eventos.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-red-700" />
          <h2 className="font-serif text-2xl text-red-800">
            Próximos eventos
          </h2>
        </div>
        <Link
          href="/eventos"
          className="font-sans text-base text-red-700 hover:text-red-900 font-semibold flex items-center gap-1 transition-colors group"
        >
          Ver todos
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventos.map((evento) => (
          <Link
            key={evento.id_evento}
            href="/eventos"
            className="group bg-white rounded-2xl border border-amber-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Imagen o placeholder */}
            <div className="relative h-36 bg-linear-to-br from-amber-50 to-orange-100 overflow-hidden shrink-0">
              {evento.imagen_evento ? (
                <Image
                  src={evento.imagen_evento}
                  alt={evento.titulo}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar size={32} className="text-amber-300/60" />
                </div>
              )}

              {/* Badge tipo */}
              <span
                className={`absolute top-3 left-3 text-xs font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  TIPO_COLORS[evento.tipo_evento] ?? 'bg-gray-100 text-gray-700'
                }`}
              >
                {TIPO_LABELS[evento.tipo_evento] ?? evento.tipo_evento}
              </span>
            </div>

            {/* Contenido */}
            <div className="p-4 flex flex-col gap-2 flex-1">
              <h3 className="font-serif text-lg text-gray-900 leading-tight group-hover:text-red-800 transition-colors line-clamp-2">
                {evento.titulo}
              </h3>

              <div className="flex items-center gap-1.5 text-sm font-sans text-amber-700 font-semibold">
                <Calendar size={13} />
                <span className="capitalize">{formatFecha(evento.fecha_inicio)}</span>
              </div>

              <div className="flex items-center gap-1.5 text-sm font-sans text-gray-500">
                <Clock size={13} />
                <span>{formatHora(evento.fecha_inicio)} hrs</span>
              </div>

              {(evento.ubicacion || evento.ciudad) && (
                <div className="flex items-center gap-1.5 text-sm font-sans text-gray-500">
                  <MapPin size={13} />
                  <span className="truncate">
                    {evento.ubicacion ?? evento.ciudad}
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}