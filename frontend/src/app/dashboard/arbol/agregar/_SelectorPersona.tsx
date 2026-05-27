'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Search, Loader2, X, User, Check, Plus } from 'lucide-react'
import { genealogiaApi, type PersonaResumen } from '@/lib/genealogiaApi'

interface Props {
  idFamiliaMia: number
  seleccionada: PersonaResumen | null
  onSelect: (p: PersonaResumen | null) => void
  onSolicitarCrearNueva: () => void
}

type Ambito = 'mi_familia' | 'todas'

export default function SelectorPersona({
  idFamiliaMia,
  seleccionada,
  onSelect,
  onSolicitarCrearNueva,
}: Props) {
  const [ambito, setAmbito] = useState<Ambito>('mi_familia')
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState<PersonaResumen[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (seleccionada) return
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true)
        setError('')
        const params: { q?: string; idFamilia?: number } = {}
        if (busqueda.trim()) params.q = busqueda.trim()
        if (ambito === 'mi_familia') params.idFamilia = idFamiliaMia
        const res = await genealogiaApi.buscarPersonas(params)
        setResultados(res.data || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al buscar')
        setResultados([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [busqueda, ambito, idFamiliaMia, seleccionada])

  if (seleccionada) {
    return (
      <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-amber-100 shrink-0">
            {seleccionada.foto_perfil ? (
              <Image
                src={seleccionada.foto_perfil}
                alt={seleccionada.nombre_completo}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={20} className="text-amber-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm text-green-700 font-semibold uppercase tracking-wide mb-0.5">
              Pariente seleccionado
            </p>
            <p className="font-serif text-lg text-green-900 truncate">
              {seleccionada.nombre_completo}
            </p>
            <p className="font-sans text-sm text-green-700 capitalize">
              {seleccionada.generacion} · Familia {seleccionada.apellido_familia}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-green-700 hover:text-green-900 cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toggle ámbito */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setAmbito('mi_familia')}
          className={`px-4 py-2 rounded-lg text-sm font-sans font-semibold transition-all cursor-pointer ${
            ambito === 'mi_familia'
              ? 'bg-white shadow-sm text-red-800'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Mi familia
        </button>
        <button
          type="button"
          onClick={() => setAmbito('todas')}
          className={`px-4 py-2 rounded-lg text-sm font-sans font-semibold transition-all cursor-pointer ${
            ambito === 'todas'
              ? 'bg-white shadow-sm text-red-800'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Buscar en todas
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={
            ambito === 'mi_familia'
              ? 'Busca en tu familia...'
              : 'Busca por nombre en toda la comunidad...'
          }
          className="w-full text-base font-sans pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => setBusqueda('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-red-700" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-sm font-sans text-red-700">
          {error}
        </div>
      ) : resultados.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl px-4">
          <p className="font-sans text-base text-gray-500 mb-1">
            {busqueda
              ? 'No encontramos personas con ese nombre.'
              : ambito === 'mi_familia'
                ? 'No hay otras personas registradas en tu familia.'
                : 'Escribe un nombre para buscar.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {resultados.map((p) => (
            <button
              key={p.id_persona}
              type="button"
              onClick={() => onSelect(p)}
              className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-red-400 hover:bg-amber-50/30 transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-amber-100 shrink-0">
                {p.foto_perfil ? (
                  <Image src={p.foto_perfil} alt={p.nombre_completo} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={16} className="text-amber-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-gray-900 truncate">
                  {p.nombre_completo}
                </p>
                <p className="font-sans text-xs text-gray-500 capitalize">
                  {p.generacion} · Familia {p.apellido_familia}
                </p>
              </div>
              <Check
                size={16}
                className="text-gray-300 group-hover:text-red-700 shrink-0"
              />
            </button>
          ))}
        </div>
      )}

      {/* Crear persona histórica */}
      <button
        type="button"
        onClick={onSolicitarCrearNueva}
        className="w-full p-4 bg-white border-2 border-dashed border-amber-400 hover:border-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <Plus size={18} className="text-amber-700" />
        <span className="font-sans text-base font-semibold text-amber-800">
          Registrar a un pariente que no aparece
        </span>
      </button>
    </div>
  )
}