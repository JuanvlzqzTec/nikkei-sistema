'use client'

import { useState, FormEvent } from 'react'
import { ArrowLeft, Check, AlertCircle, Info } from 'lucide-react'
import { nuevaFamiliaSchema } from '../_schema'
import {
  PREFECTURAS_JAPON,
  ANIO_LLEGADA_MIN,
  ANIO_LLEGADA_MAX,
} from '../_constants'
import type { NuevaFamiliaData } from '../_types'

interface Props {
  initialData: NuevaFamiliaData | null
  onSubmit: (data: NuevaFamiliaData) => void
  onCancel: () => void
}

export default function FormularioNuevaFamilia({
  initialData,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<NuevaFamiliaData>({
    apellido_jp: initialData?.apellido_jp ?? '',
    apellido_kanji: initialData?.apellido_kanji ?? '',
    prefectura_origen: initialData?.prefectura_origen ?? '',
    anio_llegada_mexico: initialData?.anio_llegada_mexico ?? '',
  })
  const [errores, setErrores] = useState <
  Partial<Record<keyof NuevaFamiliaData, string>>
>({})
  const yaGuardado = Boolean(initialData)

  const setCampo = <K extends keyof NuevaFamiliaData>(
    key: K,
    val: NuevaFamiliaData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  const handleGuardar = (e: FormEvent) => {
    e.preventDefault()
    const result = nuevaFamiliaSchema.safeParse(form)
    if (!result.success) {
      const issues = result.error.issues
      const nuevos: typeof errores = {}
      for (const issue of issues) {
        const key = issue.path[0] as keyof NuevaFamiliaData
        if (!nuevos[key]) nuevos[key] = issue.message
      }
      setErrores(nuevos)
      return
    }
    setErrores({})
    onSubmit(form)
  }

  return (
    <div className="bg-amber-50/60 border-2 border-amber-300 rounded-xl p-5 sm:p-6 space-y-5">
      {/* Encabezado */}
      <div className="flex items-start gap-3">
        <Info size={20} className="text-amber-700 shrink-0 mt-1" />
        <div>
          <h3 className="font-serif text-xl text-amber-900 leading-tight mb-1">
            Registrar una familia nueva
          </h3>
          <p className="font-sans text-base text-amber-800 leading-relaxed">
            Un administrador revisará esta información antes de aprobar tu
            familia en el directorio. Solo necesitamos lo básico.
          </p>
        </div>
      </div>

      {/* Estado guardado */}
      {yaGuardado && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 flex items-start gap-3">
          <Check size={18} className="text-green-700 shrink-0 mt-0.5" />
          <p className="font-sans text-base text-green-800">
            Datos guardados. Puedes seguir editando o continuar al siguiente
            paso.
          </p>
        </div>
      )}

      <form onSubmit={handleGuardar} className="space-y-5">
        {/* Apellido en romaji */}
        <div>
          <label
            htmlFor="apellido_jp"
            className="block font-sans text-lg font-semibold text-gray-800 mb-2"
          >
            Apellido familiar <span className="text-red-600">*</span>
          </label>
          <input
            id="apellido_jp"
            type="text"
            value={form.apellido_jp}
            onChange={(e) => setCampo('apellido_jp', e.target.value)}
            placeholder="Por ejemplo: Tanaka"
            className={`w-full text-lg font-sans px-4 py-3 border-2 rounded-xl bg-white focus:outline-none transition-colors ${
              errores.apellido_jp
                ? 'border-red-500 focus:border-red-600 bg-red-50/30'
                : 'border-amber-200 focus:border-red-400'
            }`}
          />
          {errores.apellido_jp && (
            <p className="mt-2 text-base font-sans text-red-600 flex items-center gap-1.5">
              <AlertCircle size={15} />
              {errores.apellido_jp}
            </p>
          )}
        </div>

        {/* Apellido en kanji */}
        <div>
          <label
            htmlFor="apellido_kanji"
            className="block font-sans text-lg font-semibold text-gray-800 mb-2"
          >
            Apellido en kanji
            <span className="font-normal text-base text-gray-400 ml-2">
              (opcional)
            </span>
          </label>
          <input
            id="apellido_kanji"
            type="text"
            value={form.apellido_kanji}
            onChange={(e) => setCampo('apellido_kanji', e.target.value)}
            placeholder="例えば: 田中"
            className="w-full text-lg font-sans px-4 py-3 border-2 border-amber-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
            lang="ja"
          />
          {errores.apellido_kanji && (
            <p className="mt-2 text-base font-sans text-red-600">
              {errores.apellido_kanji}
            </p>
          )}
        </div>

        {/* Prefectura */}
        <div>
          <label
            htmlFor="prefectura_origen"
            className="block font-sans text-lg font-semibold text-gray-800 mb-2"
          >
            Prefectura de origen en Japón
            <span className="font-normal text-base text-gray-400 ml-2">
              (opcional)
            </span>
          </label>
          <select
            id="prefectura_origen"
            value={form.prefectura_origen}
            onChange={(e) => setCampo('prefectura_origen', e.target.value)}
            className="w-full text-lg font-sans px-4 py-3 border-2 border-amber-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="">No estoy seguro / No aplica</option>
            {PREFECTURAS_JAPON.map((pref) => (
              <option key={pref} value={pref}>
                {pref}
              </option>
            ))}
          </select>
          {errores.prefectura_origen && (
            <p className="mt-2 text-base font-sans text-red-600">
              {errores.prefectura_origen}
            </p>
          )}
        </div>

        {/* Año de llegada */}
        <div>
          <label
            htmlFor="anio_llegada_mexico"
            className="block font-sans text-lg font-semibold text-gray-800 mb-2"
          >
            Año aproximado en que tu familia llegó a México
            <span className="font-normal text-base text-gray-400 ml-2">
              (opcional)
            </span>
          </label>
          <input
            id="anio_llegada_mexico"
            type="number"
            min={ANIO_LLEGADA_MIN}
            max={ANIO_LLEGADA_MAX}
            value={form.anio_llegada_mexico}
            onChange={(e) =>
              setCampo('anio_llegada_mexico', e.target.value)
            }
            placeholder="Por ejemplo: 1958"
            className={`w-full text-lg font-sans px-4 py-3 border-2 rounded-xl bg-white focus:outline-none transition-colors ${
              errores.anio_llegada_mexico
                ? 'border-red-500 focus:border-red-600 bg-red-50/30'
                : 'border-amber-200 focus:border-red-400'
            }`}
            inputMode="numeric"
          />
          {errores.anio_llegada_mexico && (
            <p className="mt-2 text-base font-sans text-red-600 flex items-center gap-1.5">
              <AlertCircle size={15} />
              {errores.anio_llegada_mexico}
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 min-h-13 px-5 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-sans font-semibold text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Volver a la lista
          </button>
          <button
            type="submit"
            className="flex-1 min-h-13 px-5 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check size={16} />
            {yaGuardado ? 'Actualizar datos' : 'Guardar familia'}
          </button>
        </div>
      </form>
    </div>
  )
}