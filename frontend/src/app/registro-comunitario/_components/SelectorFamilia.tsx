'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Loader2, AlertCircle, RefreshCw, Plus, X, Check, Users } from 'lucide-react'
import { registroApi } from '@/lib/registroApi'
import type { FamiliaPublica, NuevaFamiliaData } from '../_types'
import ModalMiembrosFamilia from './ModalMiembrosFamilia'
import FormularioNuevaFamilia from './FormularioNuevaFamilia'

interface Props {
  idFamiliaSeleccionada: number | null
  nuevaFamilia: NuevaFamiliaData | null
  onSelectFamilia: (familia: FamiliaPublica) => void
  onCreateNueva: (data: NuevaFamiliaData) => void
  onClearSelection: () => void
  onFamiliasLoaded?: (familias: FamiliaPublica[]) => void
  error?: string
}

export default function SelectorFamilia({
  idFamiliaSeleccionada,
  nuevaFamilia,
  onSelectFamilia,
  onCreateNueva,
  onClearSelection,
  onFamiliasLoaded,
  error,
}: Props) {
  const [familias, setFamilias] = useState<FamiliaPublica[]>([])
  const [loading, setLoading] = useState(true)
  const [errorCarga, setErrorCarga] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [familiaModal, setFamiliaModal] = useState<FamiliaPublica | null>(null)
  const [mostrarFormularioNueva, setMostrarFormularioNueva] = useState(false)

  const cargar = async () => {
    try {
      setLoading(true)
      setErrorCarga(false)
      const res = await registroApi.getFamiliasPublicas()
      const data = res.data || []
      setFamilias(data)
      onFamiliasLoaded?.(data)
    } catch {
      setErrorCarga(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (nuevaFamilia) setMostrarFormularioNueva(true)
  }, [nuevaFamilia])

  const listaFiltrada = useMemo(() => {
    if (!busqueda.trim()) return familias
    const q = busqueda.toLowerCase().trim()
    return familias.filter((f) => {
      const campos = [
        f.apellido_jp,
        f.apellido_romanji,
        f.apellido_kanji,
        f.prefectura_origen,
        f.lugar_llegada,
      ]
      return campos.some((c) => c && c.toLowerCase().includes(q))
    })
  }, [familias, busqueda])

  const familiaSeleccionadaObj = useMemo(
    () => familias.find((f) => f.id_familia === idFamiliaSeleccionada) ?? null,
    [familias, idFamiliaSeleccionada]
  )

  const handleClickTarjeta = (familia: FamiliaPublica) => {
    setFamiliaModal(familia)
  }

  const handleConfirmarFamilia = () => {
    if (familiaModal) {
      onSelectFamilia(familiaModal)
      setMostrarFormularioNueva(false)
      setFamiliaModal(null)
    }
  }

  const handleAbrirFormularioNueva = () => {
    onClearSelection()
    setMostrarFormularioNueva(true)
  }

  const handleCancelarFormularioNueva = () => {
    setMostrarFormularioNueva(false)
    onClearSelection()
  }

  if (familiaSeleccionadaObj) {
    return (
      <div className="space-y-3">
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center shrink-0">
              <Check size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm text-green-700 font-semibold uppercase tracking-wide mb-1">
                Familia seleccionada
              </p>
              <p className="font-serif text-xl text-green-900">
                Familia {familiaSeleccionadaObj.apellido_jp}
                {familiaSeleccionadaObj.apellido_kanji && (
                  <span className="ml-2 text-lg text-green-700">
                    ({familiaSeleccionadaObj.apellido_kanji})
                  </span>
                )}
              </p>
              {familiaSeleccionadaObj.prefectura_origen && (
                <p className="font-sans text-base text-green-700 mt-1">
                  Origen: {familiaSeleccionadaObj.prefectura_origen}, Japón
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClearSelection}
            className="mt-4 font-sans text-base text-green-800 hover:text-green-900 underline underline-offset-2 cursor-pointer"
          >
            Cambiar familia
          </button>
        </div>
      </div>
    )
  }

  if (mostrarFormularioNueva) {
    return (
      <FormularioNuevaFamilia
        initialData={nuevaFamilia}
        onSubmit={(data) => {
          onCreateNueva(data)
        }}
        onCancel={handleCancelarFormularioNueva}
      />
    )
  }

  // Estado normal: selector con búsqueda + lista
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-700 shrink-0 mt-0.5" />
          <p className="font-sans text-base text-red-700">{error}</p>
        </div>
      )}

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
          placeholder="Busca tu apellido familiar..."
          className="w-full text-lg font-sans pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => setBusqueda('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Estados de la lista */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-red-700" />
        </div>
      ) : errorCarga ? (
        <div className="text-center py-12 bg-amber-50/60 border-2 border-amber-200 rounded-xl">
          <p className="font-sans text-base text-amber-900 mb-4">
            No pudimos cargar la lista de familias.
          </p>
          <button
            type="button"
            onClick={cargar}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-sans font-semibold rounded-xl cursor-pointer transition-colors"
          >
            <RefreshCw size={16} />
            Intentar de nuevo
          </button>
        </div>
      ) : listaFiltrada.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="font-sans text-lg text-gray-500 mb-1">
            {busqueda
              ? 'No encontramos familias con ese nombre.'
              : 'Todavía no hay familias registradas.'}
          </p>
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="font-sans text-base text-red-700 underline cursor-pointer hover:text-red-900"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-120 overflow-y-auto pr-1">
          {listaFiltrada.map((familia) => (
            <button
              key={familia.id_familia}
              type="button"
              onClick={() => handleClickTarjeta(familia)}
              className="w-full text-left p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-red-400 hover:bg-amber-50/30 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-xl text-gray-900 group-hover:text-red-800 transition-colors">
                    Familia {familia.apellido_jp}
                    {familia.apellido_kanji && (
                      <span className="ml-2 text-base text-gray-500">
                        ({familia.apellido_kanji})
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    {familia.prefectura_origen && (
                      <p className="font-sans text-base text-gray-500">
                        Origen: {familia.prefectura_origen}
                      </p>
                    )}
                    {familia.lugar_llegada && (
                      <p className="font-sans text-base text-gray-500">
                        Llegó a: {familia.lugar_llegada}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 rounded-full shrink-0">
                  <Users size={14} className="text-amber-700" />
                  <span className="font-sans text-sm font-semibold text-amber-800">
                    {familia.total_miembros}{' '}
                    {familia.total_miembros === 1 ? 'miembro' : 'miembros'}
                  </span>
                </div>
              </div>

              <p className="font-sans text-sm text-red-700 mt-2 font-semibold">
                Toca para ver miembros y confirmar →
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Botón "Mi familia no aparece" */}
      <div className="pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleAbrirFormularioNueva}
          className="w-full p-4 bg-white border-2 border-dashed border-amber-400 hover:border-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group"
        >
          <Plus
            size={20}
            className="text-amber-700 group-hover:text-amber-900"
          />
          <span className="font-sans text-base font-semibold text-amber-800 group-hover:text-amber-900">
            Mi familia no aparece en la lista
          </span>
        </button>
      </div>

      {/* Modal de verificación visual */}
      {familiaModal && (
        <ModalMiembrosFamilia
          familia={familiaModal}
          onClose={() => setFamiliaModal(null)}
          onConfirmar={handleConfirmarFamilia}
        />
      )}
    </div>
  )
}