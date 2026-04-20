'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { type Evento, esFuturo } from './_types'
import EventoCard from './_EventoCard'
import EventoModal from './_EventoModal'
import SiteHeader from '@/components/SiteHeader'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Skeleton
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-100 rounded w-2/5" />
        <div className="h-5 bg-gray-100 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
      </div>
    </div>
  )
}

// Pagina
export default function EventosPage() {
  const [todos, setTodos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState<'proximos' | 'pasados'>('proximos')
  const [eventoActivo, setEventoActivo] = useState<Evento | null>(null)

  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)
      const res = await fetch(`${API_URL}/api/v1/eventos/`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      // Excluir borradores y cancelados
      const visibles = (data.data as Evento[]).filter(
        (e) => ['publicado', 'en_curso', 'finalizado'].includes(e.status)
      )
      setTodos(visibles)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const proximos = todos
    .filter((e) => esFuturo(e))
    .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())

  const pasados = todos
    .filter((e) => !esFuturo(e))
    .sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime())

  const lista = tab === 'proximos' ? proximos : pasados

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
              <div className="space-y-3 pt-2">
                <h1 className="text-4xl lg:text-5xl font-serif text-gray-900 leading-tight">
                  次回のイベント
                </h1>
                <h2 className="text-2xl font-serif text-red-800">
                  Eventos y Actividades
                </h2>
                <div className="w-16 h-0.5 bg-linear-to-r from-red-700 to-amber-400 rounded-full" />
                <p className="text-lg font-sans text-gray-600 max-w-lg">
                  Participa en nuestras actividades culturales, deportivas y comunitarias.
                  Mantente conectado con la comunidad Nikkei de Sinaloa.
                </p>
              </div>

              {/* Contadores */}
              {!loading && (
                <div className="flex gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-3xl font-serif text-red-800">{proximos.length}</p>
                    <p className="text-xs font-sans text-gray-500 uppercase tracking-wider">Próximos</p>
                  </div>
                  <div className="w-px bg-red-200" />
                  <div className="text-center">
                    <p className="text-3xl font-serif text-gray-400">{pasados.length}</p>
                    <p className="text-xs font-sans text-gray-500 uppercase tracking-wider">Pasados</p>
                  </div>
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

        {/* Tabs + grid */}
        <div className="bg-white">
        <div className="container-nikkei pt-8 pb-20">

          {/* Pestañas */}
          <div className="flex gap-1 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl w-fit mb-10 border border-white/80 shadow-sm">
            <button
              onClick={() => setTab('proximos')}
              className={`px-6 py-2.5 rounded-xl text-base font-sans font-semibold transition-all duration-200 flex items-center gap-2 ${
                tab === 'proximos'
                  ? 'bg-red-800 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <Calendar size={15} />
              Próximos
              {proximos.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tab === 'proximos' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
                }`}>
                  {proximos.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab('pasados')}
              className={`px-6 py-2.5 rounded-xl text-base font-sans font-semibold transition-all duration-200 flex items-center gap-2 ${
                tab === 'pasados'
                  ? 'bg-red-800 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <Clock size={15} />
              Pasados
              {pasados.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tab === 'pasados' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {pasados.length}
                </span>
              )}
            </button>
          </div>

          {/* Estados */}
          {error ? (
            <div className="text-center py-24">
              <p className="text-gray-400 font-sans mb-4">No se pudieron cargar los eventos.</p>
              <button
                onClick={cargar}
                className="text-red-700 font-sans text-sm underline cursor-pointer hover:text-red-900"
              >
                Intentar de nuevo
              </button>
            </div>

          ) : loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>

          ) : lista.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Calendar size={28} className="text-amber-400" />
              </div>
              <p className="font-serif text-xl text-gray-600 mb-2">
                {tab === 'proximos' ? 'No hay eventos próximos' : 'Sin eventos pasados'}
              </p>
              <p className="text-sm font-sans text-gray-400">
                {tab === 'proximos'
                  ? 'Pronto anunciaremos nuevas actividades. ¡Vuelve pronto!'
                  : 'Aquí aparecerán los eventos ya realizados.'}
              </p>
            </div>

          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lista.map((ev) => (
                <EventoCard
                  key={ev.id_evento}
                  evento={ev}
                  onClick={() => setEventoActivo(ev)}
                />
              ))}
            </div>
          )}

          {/* Pie decorativo */}
          {!loading && lista.length > 0 && (
            <div className="text-center mt-16 pt-12 border-t border-gray-100">
              <p className="font-serif text-4xl text-red-900/10 select-none">祭</p>
              <p className="text-xs font-sans text-gray-400 mt-2 uppercase tracking-wider">
                Asociación Nikkei · Culiacán, Sinaloa
              </p>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Modal — fuera del div principal para el z-index */}
      {eventoActivo && (
        <EventoModal
          evento={eventoActivo}
          onClose={() => setEventoActivo(null)}
        />
      )}
    </>
  )
}