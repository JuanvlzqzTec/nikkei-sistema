'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Image as ImageIcon, CalendarDays, Building2, BookImage, ChevronRight, UserCheck, MessageSquare } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface Stats {
  slider_items: number
  eventos: number
  empresas: number
  galeria_historica: number
  users: number
  registros_pendientes: number
}

const cards = [
  {
    href: '/admin/homepage/slider',
    icon: ImageIcon,
    label: 'Slider Hero',
    key: 'slider_items' as keyof Stats,
    desc: 'Imágenes del carrusel principal',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-100',
  },
  {
    href: '/admin/homepage/eventos',
    icon: CalendarDays,
    label: 'Eventos',
    key: 'eventos' as keyof Stats,
    desc: 'Los 2 próximos aparecen en homepage',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-100',
  },
  {
    href: '/admin/homepage/empresas',
    icon: Building2,
    label: 'Impulso Nikkei',
    key: 'empresas' as keyof Stats,
    desc: 'Directorio de empresas comunitarias',
    color: 'bg-green-50 text-green-700 border-green-200',
    iconBg: 'bg-green-100',
  },
  {
    href: '/admin/homepage/galeria',
    icon: BookImage,
    label: 'Galería Histórica',
    key: 'galeria_historica' as keyof Stats,
    desc: '3 destacados aparecen en homepage',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    iconBg: 'bg-rose-100',
  },
]

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [pendientesCount, setPendientesCount] = useState<number | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/api/v1/stats`)
      .then((r) => r.json())
      .then((d) => setStats(d.counts))
      .catch(console.error)
  }, [])

  useEffect(() => {
    import('@/lib/adminApi').then(({ registrosPendientesApi }) => {
      registrosPendientesApi
        .getPendientes()
        .then((r) => setPendientesCount(r.count))
        .catch(() => setPendientesCount(0))
    })
  }, [])

  const [contribucionesCount, setContribucionesCount] = useState<number | null>(null)
  useEffect(() => {
    import('@/lib/contribucionesApi').then(({ contribucionesAdminApi }) => {
      contribucionesAdminApi
        .getPendientes('pendiente')
        .then((r) => setContribucionesCount(r.count))
        .catch(() => setContribucionesCount(0))
    })
  }, [])

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif text-gray-900">Panel de Administración</h1>
        <p className="text-sm text-gray-500 font-sans mt-1">
          Gestiona el contenido que aparece en la página pública.
        </p>
      </div>

      {/* Card destacada: Registros pendientes */}
      <Link
        href="/admin/registros-pendientes"
        className={`group block rounded-xl border p-5 transition-all duration-200 hover:shadow-md ${
          pendientesCount && pendientesCount > 0
            ? 'bg-amber-50 border-amber-300 hover:border-amber-400'
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              pendientesCount && pendientesCount > 0
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <UserCheck size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-sans font-semibold text-gray-800">
              Registros Comunitarios
            </p>
            <p className="text-xs font-sans text-gray-500 mt-0.5">
              {pendientesCount === null
                ? 'Cargando...'
                : pendientesCount === 0
                ? 'No hay solicitudes pendientes'
                : `${pendientesCount} ${pendientesCount === 1 ? 'solicitud espera' : 'solicitudes esperan'} tu revisión`}
            </p>
          </div>
          {pendientesCount !== null && pendientesCount > 0 && (
            <div className="bg-amber-700 text-white text-2xl font-serif rounded-lg w-12 h-12 flex items-center justify-center shrink-0">
              {pendientesCount}
            </div>
          )}
          <ChevronRight
            size={16}
            className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </Link>

      <Link
        href="/admin/contribuciones"
        className={`group block rounded-xl border p-5 transition-all duration-200 hover:shadow-md ${
          contribucionesCount && contribucionesCount > 0
            ? 'bg-amber-50 border-amber-300 hover:border-amber-400'
            : 'bg-white border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              contribucionesCount && contribucionesCount > 0
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <MessageSquare size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-sans font-semibold text-gray-800">
              Contribuciones
            </p>
            <p className="text-xs font-sans text-gray-500 mt-0.5">
              {contribucionesCount === null
                ? 'Cargando...'
                : contribucionesCount === 0
                ? 'Sin contribuciones pendientes'
                : `${contribucionesCount} ${contribucionesCount === 1 ? 'contribución espera' : 'contribuciones esperan'} tu atención`}
            </p>
          </div>
          {contribucionesCount !== null && contribucionesCount > 0 && (
            <div className="bg-amber-700 text-white text-2xl font-serif rounded-lg w-12 h-12 flex items-center justify-center shrink-0">
              {contribucionesCount}
            </div>
          )}
          <ChevronRight
            size={16}
            className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </Link>

      {/* Cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 font-sans uppercase tracking-wide mb-4">
          Gestión del Homepage
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group rounded-xl border p-5 flex flex-col gap-4 hover:shadow-md transition-all duration-200 ${card.color}`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  <card.icon size={20} />
                </div>
                <ChevronRight
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                />
              </div>
              <div>
                <p className="text-2xl font-serif font-semibold">
                  {stats ? stats[card.key] : '—'}
                </p>
                <p className="text-sm font-sans font-semibold mt-0.5">{card.label}</p>
                <p className="text-xs font-sans opacity-70 mt-1 leading-relaxed">{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 font-sans mb-4">Recordatorios rápidos</h2>
        <ul className="space-y-2.5 text-sm font-sans text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Los <strong>2 eventos más próximos</strong> con status &quot;publicado&quot; aparecen automáticamente en el homepage.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Para <strong>Impulso Nikkei</strong>, solo empresas aprobadas pueden ser seleccionadas. Máximo 5 en homepage.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>Para <strong>Galería Histórica</strong>, marca exactamente 3 elementos como &quot;destacado&quot; para el homepage.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>El <strong>slider</strong> mostrará las imágenes activas en el orden que establezcas.</span>
          </li>
        </ul>
      </div>
    </div>
  )
}