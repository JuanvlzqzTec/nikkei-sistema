'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Loader2, X, Check, Users, AlertCircle } from 'lucide-react'
import { registroApi } from '@/lib/registroApi'
import type { FamiliaPublica } from '@/app/registro-comunitario/_types'

interface Props {
  idFamiliaActual: number
  idFamiliaSeleccionada: number | null
  onSelect: (idFamilia: number | null) => void
}

export default function SelectorFamiliaSimple({
  idFamiliaActual,
  idFamiliaSeleccionada,
  onSelect,
}: Props) {
  const [familias, setFamilias] = useState<FamiliaPublica[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true)
        setError(false)
        const res = await registroApi.getFamiliasPublicas()
        setFamilias(res.data || [])
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const listaFiltrada = useMemo(() => {
    if (!busqueda.trim()) return familias
    const q = busqueda.toLowerCase().trim()
    return familias.filter((f) => {
      const campos = [f.apellido_jp, f.apellido_kanji, f.prefectura_origen]
      return campos.some((c) => c && c.toLowerCase().includes(q))
    })
  }, [familias, busqueda])

  const familiaSeleccionada = useMemo(
    () => familias.find((f) => f.id_familia === idFamiliaSeleccionada),
    [familias, idFamiliaSeleccionada]
  )

  // Si la seleccionada es la actual, mostramos un aviso
  const esActual = idFamiliaSeleccionada === idFamiliaActual

  if (familiaSeleccionada && !esActual) {
    return (
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Check size={20} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-sans text-sm text-amber-700 font-semibold uppercase tracking-wide mb-1">
              Nueva familia seleccionada
            </p>
            <p className="font-serif text-lg text-amber-900">
              Familia {familiaSeleccionada.apellido_jp}
              {familiaSeleccionada.apellido_kanji && (
                <span className="ml-2 text-base text-amber-700">
                  ({familiaSeleccionada.apellido_kanji})
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="mt-3 font-sans text-sm text-amber-800 hover:text-amber-900 underline underline-offset-2 cursor-pointer"
        >
          Cambiar a otra familia
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Buscador */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Busca el apellido de tu familia..."
          className="w-full text-base font-sans pl-11 pr-11 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
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

      {/* Estados */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-red-700" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-700 shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-red-700">
            No pudimos cargar las familias.
          </p>
        </div>
      ) : listaFiltrada.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="font-sans text-base text-gray-500">
            {busqueda
              ? 'No encontramos familias con ese nombre.'
              : 'No hay familias disponibles.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {listaFiltrada.map((familia) => {
            const esLaActual = familia.id_familia === idFamiliaActual
            return (
              <button
                key={familia.id_familia}
                type="button"
                onClick={() => onSelect(familia.id_familia)}
                disabled={esLaActual}
                className={`w-full text-left p-4 border-2 rounded-xl transition-all cursor-pointer ${
                  esLaActual
                    ? 'border-green-300 bg-green-50/50 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-red-400 hover:bg-amber-50/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-base text-gray-900">
                      Familia {familia.apellido_jp}
                      {familia.apellido_kanji && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({familia.apellido_kanji})
                        </span>
                      )}
                    </p>
                    {familia.prefectura_origen && (
                      <p className="font-sans text-sm text-gray-500 mt-0.5">
                        Origen: {familia.prefectura_origen}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 rounded-full shrink-0">
                    <Users size={11} className="text-amber-700" />
                    <span className="font-sans text-xs font-semibold text-amber-800">
                      {familia.total_miembros}
                    </span>
                  </div>
                </div>
                {esLaActual && (
                  <p className="font-sans text-xs text-green-700 mt-1 font-semibold">
                    ✓ Es tu familia actual
                  </p>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Aviso final */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
        <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
        <p className="font-sans text-sm text-amber-800 leading-relaxed">
          Si tu familia no aparece en la lista, por favor contacta a un
          administrador para registrarla.
        </p>
      </div>
    </div>
  )
}