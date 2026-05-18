'use client'

import type { WizardData } from '../_types'
import { GENEROS } from '../_constants'

interface Props {
  data: WizardData
  errors: Partial<Record<keyof WizardData, string>>
  onChange: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void
  firstErrorRef?: React.RefObject<HTMLInputElement | null>
}

export default function Paso3DatosPersonales({
  data,
  errors,
  onChange,
  firstErrorRef,
}: Props) {
  const hoy = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-2">
      <div className="mb-8">
        <h2 className="font-serif text-2xl sm:text-3xl text-red-800 leading-tight mb-2">
          Cuéntanos un poco más sobre ti
        </h2>
        <p className="font-sans text-base text-gray-600 leading-relaxed">
          Solo necesitamos algunos datos básicos.
        </p>
      </div>

      <div className="space-y-6">
        {/* Fecha de nacimiento */}
        <div>
          <label
            htmlFor="fecha_nacimiento"
            className="block font-sans text-lg font-semibold text-gray-800 mb-2"
          >
            Tu fecha de nacimiento <span className="text-red-600">*</span>
          </label>
          <input
            ref={errors.fecha_nacimiento ? firstErrorRef : undefined}
            id="fecha_nacimiento"
            type="date"
            value={data.fecha_nacimiento}
            onChange={(e) => onChange('fecha_nacimiento', e.target.value)}
            max={hoy}
            className={`w-full text-lg font-sans px-4 py-3 border-2 rounded-xl bg-white focus:outline-none transition-colors ${
              errors.fecha_nacimiento
                ? 'border-red-500 focus:border-red-600 bg-red-50/30'
                : 'border-gray-200 focus:border-red-400'
            }`}
            autoComplete="bday"
          />
          {errors.fecha_nacimiento && (
            <p className="mt-2 text-base font-sans text-red-600">
              {errors.fecha_nacimiento}
            </p>
          )}
        </div>

        {/* Género — botones grandes */}
        <div>
          <label className="block font-sans text-lg font-semibold text-gray-800 mb-3">
            ¿Cómo te identificas? <span className="text-red-600">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GENEROS.map((opcion) => {
              const seleccionado = data.genero === opcion.value
              return (
                <button
                  key={opcion.value}
                  type="button"
                  onClick={() => onChange('genero', opcion.value)}
                  className={`min-h-15 px-4 py-3 rounded-xl border-2 font-sans text-base font-semibold transition-all duration-200 cursor-pointer ${
                    seleccionado
                      ? 'border-red-700 bg-red-50 text-red-800 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-amber-50/50'
                  }`}
                >
                  {opcion.label}
                </button>
              )
            })}
          </div>

          {errors.genero && (
            <p className="mt-2 text-base font-sans text-red-600">
              {errors.genero}
            </p>
          )}
        </div>

        {/* Lugar de nacimiento */}
        <div>
          <label
            htmlFor="lugar_nacimiento"
            className="block font-sans text-lg font-semibold text-gray-800 mb-2"
          >
            Lugar de nacimiento
            <span className="font-normal text-base text-gray-400 ml-2">
              (opcional)
            </span>
          </label>
          <input
            id="lugar_nacimiento"
            type="text"
            value={data.lugar_nacimiento}
            onChange={(e) => onChange('lugar_nacimiento', e.target.value)}
            placeholder="Por ejemplo: Culiacán, Sinaloa"
            className="w-full text-lg font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
          />
          {errors.lugar_nacimiento && (
            <p className="mt-2 text-base font-sans text-red-600">
              {errors.lugar_nacimiento}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}