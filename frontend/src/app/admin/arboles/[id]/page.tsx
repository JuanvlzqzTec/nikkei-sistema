'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, ArrowLeft, Users, Eye, EyeOff, User, Clock, Sparkles } from 'lucide-react'
import { adminArbolesApi, type ArbolFamiliaResponse, type ArbolPersona, type ArbolRelacion } from '@/lib/adminArbolesApi'
import { TIPO_RELACION_LABELS } from '@/app/dashboard/arbol/_constants'

// Orden de generaciones
const ORDEN_GENERACION: Record<string, number> = {
  issei: 1, nisei: 2, sansei: 3, yonsei: 4, gosei: 5, roksei: 6,
}

// Tipo inverso por género (igual lógica que en backend)
function tipoInversoConGenero(tipo: string, generoOtro?: string | null): string {
  const esFem = generoOtro === 'femenino'
  const map: Record<string, string> = {
    padre: esFem ? 'hija' : 'hijo',
    madre: esFem ? 'hija' : 'hijo',
    hijo: esFem ? 'madre' : 'padre',
    hija: esFem ? 'madre' : 'padre',
    abuelo: esFem ? 'nieta' : 'nieto',
    abuela: esFem ? 'nieta' : 'nieto',
    nieto: esFem ? 'abuela' : 'abuelo',
    nieta: esFem ? 'abuela' : 'abuelo',
    esposo: 'esposa',
    esposa: 'esposo',
    hermano: esFem ? 'hermana' : 'hermano',
    hermana: esFem ? 'hermana' : 'hermano',
    tio: esFem ? 'sobrina' : 'sobrino',
    tia: esFem ? 'sobrina' : 'sobrino',
    sobrino: esFem ? 'tia' : 'tio',
    sobrina: esFem ? 'tia' : 'tio',
    primo: esFem ? 'prima' : 'primo',
    prima: esFem ? 'prima' : 'primo',
    yerno: esFem ? 'suegra' : 'suegro',
    nuera: esFem ? 'suegra' : 'suegro',
    suegro: esFem ? 'nuera' : 'yerno',
    suegra: esFem ? 'nuera' : 'yerno',
    cuniado: esFem ? 'cuniada' : 'cuniado',
    cuniada: esFem ? 'cuniada' : 'cuniado',
  }
  return map[tipo] ?? tipo
}

export default function AdminArbolFamiliaPage() {
  const params = useParams<{ id: string }>()
  const idFamilia = parseInt(params.id, 10)

  const [arbol, setArbol] = useState<ArbolFamiliaResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNaN(idFamilia)) return
    const cargar = async () => {
      try {
        setLoading(true)
        const res = await adminArbolesApi.getArbolFamilia(idFamilia)
        setArbol(res)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error al cargar familia')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [idFamilia])

  // Procesar miembros con sus relaciones agrupadas
  const miembrosConRelaciones = useMemo(() => {
    if (!arbol) return []

    const personasMap = new Map<number, ArbolPersona>()
    arbol.personas.forEach((p) => personasMap.set(p.id_persona, p))

    // Solo miembros de ESTA familia
    const miembros = arbol.personas.filter((p) => p.id_familia === arbol.familia.id_familia)

    type RelacionDescrita = {
      id_genealogia: number
      etiqueta: string
      otroNombre: string
      otraFamilia: string
      esExterno: boolean
      confirmada: boolean
    }

    const resultado = miembros.map((m) => {
      const rels: RelacionDescrita[] = []

      for (const r of arbol.relaciones) {
        let idOtro: number
        let tipoDesdeMiembro: string

        if (r.id_persona === m.id_persona) {
          idOtro = r.id_pariente
          tipoDesdeMiembro = r.tipo_relacion
        } else if (r.id_pariente === m.id_persona) {
          idOtro = r.id_persona
          // necesitamos el género del miembro (que es "el otro" en esta perspectiva)
          tipoDesdeMiembro = tipoInversoConGenero(r.tipo_relacion, undefined)
        } else {
          continue
        }

        const otraPersona = personasMap.get(idOtro)
        if (!otraPersona) continue

        rels.push({
          id_genealogia: r.id_genealogia,
          etiqueta: TIPO_RELACION_LABELS[tipoDesdeMiembro] ?? tipoDesdeMiembro,
          otroNombre: otraPersona.nombre_completo,
          otraFamilia: otraPersona.apellido_familia,
          esExterno: otraPersona.id_familia !== arbol.familia.id_familia,
          confirmada: r.confirmado_ambas_partes,
        })
      }

      return { persona: m, relaciones: rels }
    })

    // Ordenar por generación y luego por nombre
    resultado.sort((a, b) => {
      const ga = ORDEN_GENERACION[a.persona.generacion] ?? 99
      const gb = ORDEN_GENERACION[b.persona.generacion] ?? 99
      if (ga !== gb) return ga - gb
      return a.persona.nombre_completo.localeCompare(b.persona.nombre_completo)
    })

    return resultado
  }, [arbol])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-red-800" size={32} />
      </div>
    )
  }

  if (error || !arbol) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Link href="/admin/arboles" className="inline-flex items-center gap-2 text-sm font-sans text-red-700 hover:text-red-900">
          <ArrowLeft size={15} /> Volver a familias
        </Link>
        <div className="text-center py-16 bg-white rounded-xl border border-red-200">
          <p className="font-sans text-red-700">{error || 'No se pudo cargar la familia'}</p>
        </div>
      </div>
    )
  }

  const miembrosTotal = miembrosConRelaciones.length
  const miembrosPublicos = arbol.personas.filter((p) => p.id_familia === arbol.familia.id_familia && p.es_publico).length
  const miembrosActivos = arbol.personas.filter((p) => p.id_familia === arbol.familia.id_familia && p.es_miembro_activo).length

  return (
    <div className="space-y-5 max-w-4xl">
      <Link href="/admin/arboles" className="inline-flex items-center gap-2 text-sm font-sans text-red-700 hover:text-red-900 cursor-pointer">
        <ArrowLeft size={15} /> Volver a familias
      </Link>

      <div>
        <h1 className="text-2xl font-serif text-gray-900">
          Familia {arbol.familia.apellido_jp}
          {arbol.familia.apellido_kanji && (
            <span className="ml-2 text-lg text-gray-400">({arbol.familia.apellido_kanji})</span>
          )}
        </h1>
        {arbol.familia.prefectura_origen && (
          <p className="text-sm text-gray-500 font-sans mt-0.5">
            Origen: {arbol.familia.prefectura_origen}
            {arbol.familia.anio_llegada_mexico && ` · Llegó a México en ${arbol.familia.anio_llegada_mexico}`}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Users size={16} />} label="Total miembros" value={miembrosTotal} />
        <StatCard icon={<Eye size={16} />} label="Públicos" value={miembrosPublicos} />
        <StatCard icon={<EyeOff size={16} />} label="Privados" value={miembrosTotal - miembrosPublicos} />
        <StatCard icon={<Sparkles size={16} />} label="Activos" value={miembrosActivos} />
      </div>

      <p className="text-xs text-gray-400 font-sans">Vista de solo lectura</p>

      {miembrosConRelaciones.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-sm text-gray-400 font-sans">Esta familia no tiene miembros registrados todavía.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(
            miembrosConRelaciones.reduce((acc, item) => {
              const gen = item.persona.generacion
              if (!acc[gen]) acc[gen] = []
              acc[gen].push(item)
              return acc
            }, {} as Record<string, typeof miembrosConRelaciones>)
          )
            .sort(([a], [b]) => (ORDEN_GENERACION[a] ?? 99) - (ORDEN_GENERACION[b] ?? 99))
            .map(([generacion, miembros]) => (
              <section key={generacion}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-serif text-lg text-red-800 capitalize">{generacion}</h3>
                  <span className="text-xs font-sans text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {miembros.length} {miembros.length === 1 ? 'miembro' : 'miembros'}
                  </span>
                  <div className="flex-1 h-px bg-amber-100" />
                </div>
                <div className="space-y-2">
                  {miembros.map(({ persona, relaciones }) => (
                    <MiembroCard key={persona.id_persona} persona={persona} relaciones={relaciones} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="font-serif text-xl text-gray-900 leading-none">{value}</p>
        <p className="font-sans text-xs text-gray-500 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  )
}

type RelacionItem = {
  id_genealogia: number
  etiqueta: string
  otroNombre: string
  otraFamilia: string
  esExterno: boolean
  confirmada: boolean
}

function MiembroCard({ persona, relaciones }: { persona: ArbolPersona; relaciones: RelacionItem[] }) {
  const [expandido, setExpandido] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-amber-50/30 transition-colors cursor-pointer"
      >
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-amber-100 shrink-0">
          {persona.foto_perfil ? (
            <Image src={persona.foto_perfil} alt={persona.nombre_completo} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={20} className="text-amber-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-xs font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {persona.generacion}
            </span>
            {!persona.es_publico && (
              <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                <EyeOff size={9} />
                Privado
              </span>
            )}
            {!persona.es_miembro_activo && (
              <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                Inactivo
              </span>
            )}
          </div>
          <p className="font-serif text-base text-gray-900 leading-tight">{persona.nombre_completo}</p>
          <p className="font-sans text-xs text-gray-500">
            {relaciones.length} {relaciones.length === 1 ? 'relación registrada' : 'relaciones registradas'}
          </p>
        </div>

        <span className={`text-gray-300 text-xs transition-transform ${expandido ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {expandido && (
        <div className="px-5 pb-4 border-t border-gray-100 pt-3 space-y-2">
          {relaciones.length === 0 ? (
            <p className="font-sans text-sm text-gray-400 italic">Sin relaciones registradas.</p>
          ) : (
            relaciones.map((r) => (
              <div key={r.id_genealogia} className="flex items-center gap-2 text-sm font-sans">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0">
                  {r.etiqueta}
                </span>
                <span className="text-gray-800 truncate flex-1">
                  {r.otroNombre}
                  {r.esExterno && (
                    <span className="text-xs text-amber-700 ml-1">(Familia {r.otraFamilia})</span>
                  )}
                </span>
                {!r.confirmada && (
                  <span className="text-xs text-amber-700 flex items-center gap-1 shrink-0">
                    <Clock size={10} />
                    Pendiente
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}