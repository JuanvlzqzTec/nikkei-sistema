'use client'

import type { WizardData } from '../_types'
import { NIVELES_JAPONES } from '../_constants'

interface Props {
  data: WizardData
  errors: Partial<Record<keyof WizardData, string>>
  onChange: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void
  firstErrorRef?: React.RefObject<HTMLDivElement | null>
}


export default function Paso5Preferencias({
  data,
  errors,
  onChange,
  firstErrorRef,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="mb-8">
        <h2 className="font-serif text-2xl sm:text-3xl text-red-800 leading-tight mb-2">
          Casi terminamos
        </h2>
        <p className="font-sans text-base text-gray-600 leading-relaxed">
          Solo unas últimas preferencias para personalizar tu experiencia.
        </p>
      </div>

      <div className="space-y-8">
        {/* Nivel de japonés — 5 botones grandes apilados */}
        <div ref={firstErrorRef} className="scroll-mt-24">
          <label className="block font-sans text-lg font-semibold text-gray-800 mb-3">
            ¿Qué tanto japonés hablas? <span className="text-red-600">*</span>
          </label>

          <div className="space-y-3">
            {NIVELES_JAPONES.map((nivel) => {
              const seleccionado = data.nivel_japones === nivel.value
              return (
                <button
                  key={nivel.value}
                  type="button"
                  onClick={() => onChange('nivel_japones', nivel.value)}
                  className={`w-full text-left min-h-17 px-5 py-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    seleccionado
                      ? 'border-red-700 bg-red-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-red-300 hover:bg-amber-50/50'
                  }`}
                >
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span
                      className={`font-sans text-lg font-bold ${
                        seleccionado ? 'text-red-800' : 'text-gray-800'
                      }`}
                    >
                      {nivel.label}
                    </span>
                    <span className="font-sans text-base text-gray-500">
                      — {nivel.descripcion}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {errors.nivel_japones && (
            <p className="mt-2 text-base font-sans text-red-600">
              {errors.nivel_japones}
            </p>
          )}
        </div>

        {/* Privacidad — directorio público */}
        <div className="pt-6 border-t border-gray-100">
          <p className="font-sans text-lg font-semibold text-gray-800 mb-2">
            Tu privacidad
          </p>
          <p className="font-sans text-base text-gray-500 mb-4 leading-relaxed">
            Tú decides qué información compartir con los demás miembros de la
            comunidad. Puedes cambiar estas preferencias en cualquier momento.
          </p>

          <label
            className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              data.acepta_directorio_publico
                ? 'border-red-700 bg-red-50'
                : 'border-gray-200 bg-white hover:border-red-300 hover:bg-amber-50/50'
            }`}
          >
            <input
              type="checkbox"
              checked={data.acepta_directorio_publico}
              onChange={(e) =>
                onChange('acepta_directorio_publico', e.target.checked)
              }
              className="w-6 h-6 mt-0.5 rounded accent-red-700 cursor-pointer shrink-0"
            />
            <div>
              <p className="font-sans text-base font-semibold text-gray-800 mb-1">
                Quiero aparecer en el directorio de mi familia
              </p>
              <p className="font-sans text-base text-gray-500 leading-relaxed">
                Otros miembros de tu familia podrán ver tu nombre cuando exploren
                el árbol familiar. Esto ayuda a reconectar con parientes lejanos.
              </p>
            </div>
          </label>
        </div>

        {/* Comunicaciones */}
        <div>
          <label
            className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              data.acepta_comunicaciones
                ? 'border-red-700 bg-red-50'
                : 'border-gray-200 bg-white hover:border-red-300 hover:bg-amber-50/50'
            }`}
          >
            <input
              type="checkbox"
              checked={data.acepta_comunicaciones}
              onChange={(e) =>
                onChange('acepta_comunicaciones', e.target.checked)
              }
              className="w-6 h-6 mt-0.5 rounded accent-red-700 cursor-pointer shrink-0"
            />
            <div>
              <p className="font-sans text-base font-semibold text-gray-800 mb-1">
                Quiero recibir noticias y eventos de la comunidad
              </p>
              <p className="font-sans text-base text-gray-500 leading-relaxed">
                Te avisaremos sobre matsuris, ceremonias y actividades culturales.
                Sin spam, lo prometemos.
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}