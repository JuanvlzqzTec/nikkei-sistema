'use client'

import { useEffect, useState } from 'react'
import {
  Users, UserCheck, Home, CalendarDays, TrendingUp, Globe, Languages, BookOpen,
  BarChart2, PieChart, Activity
} from 'lucide-react'
import { estadisticasApi, type EstadisticasResponse } from '@/lib/estadisticasApi'

// Paleta

const GENERACION_LABEL: Record<string, string> = {
  issei: 'Issei (1ª)', nisei: 'Nisei (2ª)', sansei: 'Sansei (3ª)',
  yonsei: 'Yonsei (4ª)', gosei: 'Gosei (5ª)', roksei: 'Roksei (6ª)',
}
const GENERO_LABEL: Record<string, string> = {
  masculino: 'Masculino', femenino: 'Femenino',
  otro: 'Otro', prefiero_no_decir: 'Prefiere no decir', no_especificado: 'No especificado',
}
const JAPONES_LABEL: Record<string, string> = {
  ninguno: 'Ninguno', basico: 'Básico', intermedio: 'Intermedio',
  avanzado: 'Avanzado', nativo: 'Nativo', no_especificado: 'No especificado',
}
const TIPO_EVENTO_LABEL: Record<string, string> = {
  matsuri: 'Matsuri', reunion: 'Reunión', cultural: 'Cultural',
  deportivo: 'Deportivo', educativo: 'Educativo', empresarial: 'Empresarial', ceremonia: 'Ceremonia',
}
const STATUS_EVENTO_LABEL: Record<string, string> = {
  borrador: 'Borrador', publicado: 'Publicado', en_curso: 'En curso',
  finalizado: 'Finalizado', cancelado: 'Cancelado',
}

const COLORS = [
  '#991b1b', '#b45309', '#1d4ed8', '#15803d', '#7e22ce',
  '#0e7490', '#be185d', '#713f12',
]

// Componentes
function KPICard({ icon: Icon, label, value, sub, accent = false }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; accent?: boolean
}) {
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-3 ${accent ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-serif font-semibold text-gray-900">{value}</p>
        <p className="text-sm font-sans font-semibold text-gray-700 mt-0.5">{label}</p>
        {sub && <p className="text-xs font-sans text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <h2 className="text-base font-sans font-semibold text-gray-800">{title}</h2>
        {sub && <p className="text-xs font-sans text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

// Barra horizontal proporcional
function BarraHorizontal({ label, value, total, color }: {
  label: string; value: number; total: number; color: string
}) {
  const v = Number(value) || 0
  const t = Number(total) || 1
  const pct = Math.round((v / t) * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-sans">
        <span className="text-gray-700 font-medium truncate max-w-[60%]">{label}</span>
        <span className="text-gray-500">{v} <span className="text-gray-400">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

// Gráfica de línea simple (SVG)
function LineChart({ data, color = '#991b1b' }: { data: { mes: string; total: number }[]; color?: string }) {
  if (!data.length) return <p className="text-xs text-gray-400 font-sans py-4 text-center">Sin datos</p>

  const maxVal = Math.max(...data.map(d => d.total), 1)
  const W = 560; const H = 120; const PAD = 20
  const step = (W - PAD * 2) / Math.max(data.length - 1, 1)

  const points = data.map((d, i) => ({
    x: PAD + i * step,
    y: H - PAD - ((d.total / maxVal) * (H - PAD * 2)),
    ...d,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${points[points.length - 1].x} ${H - PAD} L ${PAD} ${H - PAD} Z`

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280 }}>
        {/* Área */}
        <path d={areaD} fill={color} fillOpacity="0.08" />
        {/* Línea */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Puntos + tooltip via title */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={color} />
            <title>{p.mes}: {p.total}</title>
          </g>
        ))}
        {/* Etiquetas eje X */}
        {points.filter((_, i) => data.length <= 6 || i % Math.ceil(data.length / 6) === 0).map((p, i) => (
          <text key={i} x={p.x} y={H - 2} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {p.mes.slice(5)}
          </text>
        ))}
      </svg>
    </div>
  )
}

// Gráfica de barras verticales (SVG)
function BarChart({ data, color = '#991b1b', labelMap }: {
  data: { clave: string; total: number }[]
  color?: string
  labelMap?: Record<string, string>
}) {
  if (!data.length) return <p className="text-xs text-gray-400 font-sans py-4 text-center">Sin datos</p>

  const maxVal = Math.max(...data.map(d => Number(d.total) || 0), 1)
  const W = 560; const H = 140; const PAD_T = 22; const PAD_B = 40; const PAD_X = 10
  const barW = Math.min(40, (W - PAD_X * 2) / data.length - 8)
  const step = (W - PAD_X * 2) / data.length

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280 }}>
        {data.map((d, i) => {
            const val = Number(d.total) || 0
            const barH = Math.max(0, ((val / maxVal) * (H - PAD_T - PAD_B)))
            const x = PAD_X + i * step + step / 2
            const y = H - PAD_B - barH
            return (
                <g key={i}>
                <rect x={x - barW / 2} y={y} width={barW} height={barH} rx="4" fill={color} fillOpacity="0.85" />
                <text x={x} y={y - 4} textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600">{val}</text>
                <text x={x} y={H - 5} textAnchor="middle" fontSize="8.5" fill="#9ca3af">
                    {String(labelMap?.[d.clave] ?? d.clave ?? '').slice(0, 10)}
                </text>
                <title>{labelMap?.[d.clave] ?? d.clave}: {val}</title>
                </g>
            )
            })}
      </svg>
    </div>
  )
}

// Tarjeta de completitud de perfil
function CompletitudCard({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  const color = pct >= 70 ? '#15803d' : pct >= 40 ? '#b45309' : '#991b1b'
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-xs font-sans font-medium text-gray-700">{label}</p>
        <p className="text-sm font-serif font-semibold" style={{ color }}>{pct}%</p>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <p className="text-[11px] font-sans text-gray-400">{value} de {total} miembros</p>
    </div>
  )
}

// Skeleton
function Skeleton() {
  return (
    <div className="space-y-8 max-w-6xl animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
      </div>
      <div className="h-64 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}

// Pagina principal

export default function EstadisticasPage() {
  const [data, setData] = useState<EstadisticasResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    estadisticasApi.get()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton />
  if (error || !data) return (
    <div className="text-center py-20">
      <p className="text-gray-500 font-sans">No se pudieron cargar las estadísticas.</p>
      <button onClick={() => window.location.reload()} className="mt-3 text-sm text-red-700 underline cursor-pointer">
        Reintentar
      </button>
    </div>
  )

  const { comunidad: c, eventos: ev, usuarios: us } = data
  const totalPersonas = c.total_personas || 1 // evitar division/0

  return (
    <div className="space-y-10 max-w-6xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif text-gray-900">Estadísticas de la Comunidad</h1>
        <p className="text-sm text-gray-400 font-sans mt-1">
          Actualizado: {new Date(data.generado_en).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}
        </p>
      </div>

      {/* KPIs generales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Users} label="Personas registradas" value={c.total_personas} accent />
        <KPICard icon={UserCheck} label="Miembros activos" value={c.miembros_activos}
          sub={`${totalPersonas > 0 ? Math.round((c.miembros_activos / totalPersonas) * 100) : 0}% del padrón`} />
        <KPICard icon={Home} label="Familias aprobadas" value={c.total_familias} />
        <KPICard icon={CalendarDays} label="Eventos creados" value={ev.total} />
      </div>

      {/* Crecimiento usuarios */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SectionTitle icon={TrendingUp} title="Registros de usuarios nuevos" sub="Últimos 12 meses" />
        <LineChart data={us.mensuales} color="#991b1b" />
      </div>

      {/* Distribucion comunidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Generación */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionTitle icon={BookOpen} title="Distribución por generación" />
          <div className="space-y-3">
            {c.por_generacion.map((d, i) => (
                <BarraHorizontal
                    key={`gen-${i}-${d.clave}`}
                    label={GENERACION_LABEL[d.clave] ?? d.clave}
                    value={Number(d.total)}
                    total={Number(totalPersonas)}
                    color={COLORS[i % COLORS.length]}
                />
                ))}
            {!c.por_generacion.length && <p className="text-xs text-gray-400">Sin datos</p>}
          </div>
        </div>

        {/* Género */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionTitle icon={PieChart} title="Distribución por género" />
          <div className="space-y-3">
            {c.por_genero.map((d, i) => (
                <BarraHorizontal
                    key={`gen-${i}-${d.clave}`}
                    label={GENERO_LABEL[d.clave] ?? d.clave}
                    value={Number(d.total)}
                    total={Number(totalPersonas)}
                    color={COLORS[i % COLORS.length]}
                />
                ))}
          </div>
        </div>
      </div>

      {/* Rangos de edad */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SectionTitle icon={Users} title="Distribución por rangos de edad"
          sub="Solo personas con fecha de nacimiento registrada" />
        <BarChart
            data={(c.rangos_edad ?? []).map(d => ({ clave: d.rango ?? 'N/A', total: d.total ?? 0 }))}
            color="#b45309"
            />
      </div>

      {/* Nivel de Japones y ciudad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionTitle icon={Languages} title="Nivel de japonés" />
          <div className="space-y-3">
            {c.por_nivel_japones.map((d, i) => (
                <BarraHorizontal
                    key={`nj-${i}-${d.clave}`}
                    label={JAPONES_LABEL[d.clave] ?? d.clave}
                    value={Number(d.total)}
                    total={Number(totalPersonas)}
                    color={COLORS[i % COLORS.length]}
                />
                ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionTitle icon={Globe} title="Ciudad de residencia" sub="Top 8" />
          <div className="space-y-3">
            {c.por_ciudad.map((d, i) => (
                <BarraHorizontal
                    key={`ciudad-${i}-${d.clave}`}
                    label={d.clave}
                    value={Number(d.total)}
                    total={Number(totalPersonas)}
                    color={COLORS[i % COLORS.length]}
                />
                ))}
          </div>
        </div>
      </div>

      {/* Incorporaciones mensuales */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SectionTitle icon={Activity} title="Incorporaciones de miembros aprobados" sub="Últimos 12 meses" />
        <LineChart data={c.incorporaciones} color="#15803d" />
      </div>

      {/* Completitud de perfiles */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SectionTitle icon={UserCheck} title="Completitud de perfiles"
          sub="Porcentaje de miembros con cada campo registrado" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <CompletitudCard label="Con teléfono" value={c.con_telefono} total={totalPersonas} />
          <CompletitudCard label="Con foto de perfil" value={c.con_foto} total={totalPersonas} />
          <CompletitudCard label="Con fecha de nacimiento" value={c.con_fecha_nacimiento} total={totalPersonas} />
          <CompletitudCard label="En directorio público" value={c.aceptan_directorio} total={totalPersonas} />
        </div>
      </div>

      {/* Seccion eventos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionTitle icon={CalendarDays} title="Eventos por tipo" />
          <BarChart data={ev.por_tipo} color="#991b1b" labelMap={TIPO_EVENTO_LABEL} />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionTitle icon={BarChart2} title="Eventos por status" />
          <BarChart data={ev.por_status} color="#1d4ed8" labelMap={STATUS_EVENTO_LABEL} />
        </div>
      </div>

      {/* Participaciones mensuales */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SectionTitle icon={TrendingUp} title="Participaciones en eventos" sub="Últimos 12 meses (registros individuales)" />
        <LineChart data={ev.participaciones_mensuales} color="#7e22ce" />
      </div>

      {/* Top 5 eventos */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SectionTitle icon={CalendarDays} title="Top 5 eventos por asistencia total" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-4 text-xs text-gray-400 font-semibold uppercase tracking-wide">Evento</th>
                <th className="text-left py-2 pr-4 text-xs text-gray-400 font-semibold uppercase tracking-wide hidden sm:table-cell">Tipo</th>
                <th className="text-left py-2 pr-4 text-xs text-gray-400 font-semibold uppercase tracking-wide hidden md:table-cell">Fecha</th>
                <th className="text-right py-2 pr-4 text-xs text-gray-400 font-semibold uppercase tracking-wide">Registros</th>
                <th className="text-right py-2 text-xs text-gray-400 font-semibold uppercase tracking-wide">Total personas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ev.top_eventos.map((e, i) => (
                <tr key={e.id_evento} className="hover:bg-gray-50/50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-serif w-4 shrink-0">{i + 1}</span>
                      <span className="text-gray-800 font-medium leading-snug line-clamp-1">{e.titulo}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell">
                    <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium">
                      {TIPO_EVENTO_LABEL[e.tipo_evento] ?? e.tipo_evento}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-500 hidden md:table-cell text-xs">{e.fecha_inicio}</td>
                  <td className="py-3 pr-4 text-right font-semibold text-gray-700">{e.registros}</td>
                  <td className="py-3 text-right">
                    <span className="font-serif text-lg text-red-800">{e.total_personas}</span>
                  </td>
                </tr>
              ))}
              {!ev.top_eventos.length && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-xs">Sin datos de eventos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pie */}
      <div className="text-center pt-4 pb-8">
        <p className="font-serif text-4xl text-red-900/10 select-none">統計</p>
        <p className="text-xs font-sans text-gray-400 mt-1 uppercase tracking-wider">
          Asociación Nikkei · Culiacán, Sinaloa
        </p>
      </div>

    </div>
  )
}