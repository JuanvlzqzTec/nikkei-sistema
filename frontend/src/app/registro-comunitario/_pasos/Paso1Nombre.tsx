'use client'

import type { WizardData } from '../_types'

interface Props {
  data: WizardData
  errors: Partial<Record<keyof WizardData, string>>
  onChange: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void
  firstErrorRef?: React.RefObject<HTMLInputElement | null>
}

export default function Paso1Nombre({ data, errors, onChange, firstErrorRef }: Props) {
  const refNombres = errors.nombres ? firstErrorRef : undefined
  const refPaterno = !errors.nombres && errors.apellido_paterno ? firstErrorRef : undefined

  return (
    <div className="space-y-2">
      {/* Encabezado cálido */}
      <div className="mb-8">
        <h2 className="font-serif text-2xl sm:text-3xl text-red-800 leading-tight mb-2">
          ¿Cómo te llamas?
        </h2>
        <p className="font-sans text-base text-gray-600 leading-relaxed">
          Empecemos por lo más importante: tu nombre.
        </p>
      </div>

      <div className="space-y-6">
        {/* Nombres */}
        <div>
          <label
            htmlFor="nombres"
            className="block font-sans text-lg font-semibold text-gray-800 mb-2"
          >
            Tus nombres <span className="text-red-600">*</span>
          </label>
          <input
            ref={refNombres}
            id="nombres"
            type="text"
            value={data.nombres}
            onChange={(e) => onChange('nombres', e.target.value)}
            placeholder="Por ejemplo: María Akiko"
            className={`w-full text-lg font-sans px-4 py-3 border-2 rounded-xl bg-white focus:outline-none transition-colors ${
              errors.nombres
                ? 'border-red-500 focus:border-red-600 bg-red-50/30'
                : 'border-gray-200 focus:border-red-400'
            }`}
            autoComplete="given-name"
          />
          {errors.nombres && (
            <p className="mt-2 text-base font-sans text-red-600">
              {errors.nombres}
            </p>
          )}
        </div>

        {/* Apellido paterno */}
        <div>
          <label
            htmlFor="apellido_paterno"
            className="block font-sans text-lg font-semibold text-gray-800 mb-2"
          >
            Apellido paterno <span className="text-red-600">*</span>
          </label>
          <input
            ref={refPaterno}
            id="apellido_paterno"
            type="text"
            value={data.apellido_paterno}
            onChange={(e) => onChange('apellido_paterno', e.target.value)}
            placeholder="Por ejemplo: Tanaka"
            className={`w-full text-lg font-sans px-4 py-3 border-2 rounded-xl bg-white focus:outline-none transition-colors ${
              errors.apellido_paterno
                ? 'border-red-500 focus:border-red-600 bg-red-50/30'
                : 'border-gray-200 focus:border-red-400'
            }`}
            autoComplete="family-name"
          />
          {errors.apellido_paterno && (
            <p className="mt-2 text-base font-sans text-red-600">
              {errors.apellido_paterno}
            </p>
          )}
        </div>

        {/* Apellido materno */}
        <div>
          <label
            htmlFor="apellido_materno"
            className="block font-sans text-lg font-semibold text-gray-800 mb-2"
          >
            Apellido materno <span className="text-red-600">*</span>
          </label>
          <input
            id="apellido_materno"
            type="text"
            value={data.apellido_materno}
            onChange={(e) => onChange('apellido_materno', e.target.value)}
            placeholder="Por ejemplo: García"
            className={`w-full text-lg font-sans px-4 py-3 border-2 rounded-xl bg-white focus:outline-none transition-colors ${
              errors.apellido_materno
                ? 'border-red-500 focus:border-red-600 bg-red-50/30'
                : 'border-gray-200 focus:border-red-400'
            }`}
          />
          <p className="mt-1.5 text-sm font-sans text-gray-400">
            Si no tienes apellido paterno o materno, escribe <strong>X</strong>
          </p>
          {errors.apellido_materno && (
            <p className="mt-1 text-base font-sans text-red-600">
              {errors.apellido_materno}
            </p>
          )}
        </div>

        {/* Separador visual */}
        <div className="pt-4 border-t border-gray-100">
          <p className="font-sans text-base text-gray-500 mb-4 leading-relaxed">
            Si tienes un nombre en japonés, también puedes compartirlo. Estos
            campos son <span className="font-semibold">opcionales</span>.
          </p>
        </div>

        {/* Nombre en japonés (romaji) */}
        <div>
          <label
            htmlFor="nombre_japones"
            className="block font-sans text-lg font-semibold text-gray-800 mb-2"
          >
            Tu nombre en japonés
            <span className="font-normal text-base text-gray-400 ml-2">
              (opcional)
            </span>
          </label>
          <input
            id="nombre_japones"
            type="text"
            value={data.nombre_japones}
            onChange={(e) => onChange('nombre_japones', e.target.value)}
            placeholder="Por ejemplo: Akiko"
            className="w-full text-lg font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
          />
          {errors.nombre_japones && (
            <p className="mt-2 text-base font-sans text-red-600">
              {errors.nombre_japones}
            </p>
          )}
        </div>

        {/* Nombre en kanji */}
        <div>
          <label
            htmlFor="nombre_kanji"
            className="block font-sans text-lg font-semibold text-gray-800 mb-2"
          >
            Tu nombre en kanji
            <span className="font-normal text-base text-gray-400 ml-2">
              (opcional)
            </span>
          </label>
          <input
            id="nombre_kanji"
            type="text"
            value={data.nombre_kanji}
            onChange={(e) => onChange('nombre_kanji', e.target.value)}
            placeholder="例えば: 秋子"
            className="w-full text-lg font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
            lang="ja"
          />
          {errors.nombre_kanji && (
            <p className="mt-2 text-base font-sans text-red-600">
              {errors.nombre_kanji}
            </p>
          )}
        </div>
        
        {/* Nombre japonés registrado — solo aparece si escribió nombre japonés */}
        {data.nombre_japones && data.nombre_japones.trim() !== '' && (
          <div>
            <label
              className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                data.nombre_japones_registrado
                  ? 'border-red-700 bg-red-50'
                  : 'border-gray-200 bg-white hover:border-red-300 hover:bg-amber-50/50'
              }`}
            >
              <input
                type="checkbox"
                checked={data.nombre_japones_registrado}
                onChange={(e) => onChange('nombre_japones_registrado', e.target.checked)}
                className="w-6 h-6 mt-0.5 rounded accent-red-700 cursor-pointer shrink-0"
              />
              <div>
                <p className="font-sans text-base font-semibold text-gray-800 mb-1">
                  ¿Tu nombre japonés está registrado oficialmente?
                </p>
                <p className="font-sans text-sm text-gray-500 leading-relaxed">
                  Por ejemplo, si aparece en documentos oficiales japoneses o en el registro de la asociación.
                </p>
              </div>
            </label>
          </div>
        )}
      </div>
    </div>
  )
}