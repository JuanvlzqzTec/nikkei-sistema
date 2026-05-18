'use client'

import type { WizardData } from '../_types'
import { ESTADOS_MEXICO, ESTADO_OTRO_EXTRANJERO } from '../_constants'

interface Props {
  data: WizardData
  errors: Partial<Record<keyof WizardData, string>>
  onChange: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void
  firstErrorRef?: React.RefObject<HTMLInputElement | null>
}

export default function Paso4Contacto({
  data,
  errors,
  onChange,
  firstErrorRef,
}: Props) {
  const esExtranjero = data.estado === ESTADO_OTRO_EXTRANJERO

  const handleEstadoChange = (nuevoEstado: string) => {
    onChange('estado', nuevoEstado)
    if (nuevoEstado !== ESTADO_OTRO_EXTRANJERO) {
      onChange('pais', '')
    }
  }

  const refTelefono = errors.telefono_principal ? firstErrorRef : undefined

  return (
    <div className="space-y-2">
      <div className="mb-8">
        <h2 className="font-serif text-2xl sm:text-3xl text-red-800 leading-tight mb-2">
          ¿Cómo podemos contactarte?
        </h2>
        <p className="font-sans text-base text-gray-600 leading-relaxed">
          Usaremos estos datos para mantenerte al tanto de eventos y actividades
          de la comunidad.
        </p>
      </div>

      <div className="space-y-6">
        {/* Teléfono */}
        <div>
          <label
            htmlFor="telefono_principal"
            className="block font-sans text-lg font-semibold text-gray-800 mb-2"
          >
            Tu número de teléfono <span className="text-red-600">*</span>
          </label>
          <input
            ref={refTelefono}
            id="telefono_principal"
            type="tel"
            value={data.telefono_principal}
            onChange={(e) => onChange('telefono_principal', e.target.value)}
            placeholder="Por ejemplo: 667 123 4567"
            className={`w-full text-lg font-sans px-4 py-3 border-2 rounded-xl bg-white focus:outline-none transition-colors ${
              errors.telefono_principal
                ? 'border-red-500 focus:border-red-600 bg-red-50/30'
                : 'border-gray-200 focus:border-red-400'
            }`}
            autoComplete="tel"
            inputMode="tel"
          />
          {errors.telefono_principal && (
            <p className="mt-2 text-base font-sans text-red-600">
              {errors.telefono_principal}
            </p>
          )}
        </div>

        {/* Estado */}
        <div>
          <label
            htmlFor="estado"
            className="block font-sans text-lg font-semibold text-gray-800 mb-2"
          >
            ¿En qué estado vives? <span className="text-red-600">*</span>
          </label>
          <select
            id="estado"
            value={data.estado}
            onChange={(e) => handleEstadoChange(e.target.value)}
            className={`w-full text-lg font-sans px-4 py-3 border-2 rounded-xl bg-white focus:outline-none transition-colors cursor-pointer ${
              errors.estado
                ? 'border-red-500 focus:border-red-600 bg-red-50/30'
                : 'border-gray-200 focus:border-red-400'
            }`}
          >
            <option value="">Elige un estado...</option>
            {ESTADOS_MEXICO.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
          {errors.estado && (
            <p className="mt-2 text-base font-sans text-red-600">
              {errors.estado}
            </p>
          )}
        </div>

        {/* País — solo si "Otro/Extranjero" */}
        {esExtranjero && (
          <div className="bg-amber-50/60 border-2 border-amber-200 rounded-xl p-5">
            <label
              htmlFor="pais"
              className="block font-sans text-lg font-semibold text-gray-800 mb-2"
            >
              ¿De qué país? <span className="text-red-600">*</span>
            </label>
            <input
              id="pais"
              type="text"
              value={data.pais}
              onChange={(e) => onChange('pais', e.target.value)}
              placeholder="Por ejemplo: Japón, Estados Unidos, Brasil"
              className={`w-full text-lg font-sans px-4 py-3 border-2 rounded-xl bg-white focus:outline-none transition-colors ${
                errors.pais
                  ? 'border-red-500 focus:border-red-600 bg-red-50/30'
                  : 'border-gray-200 focus:border-red-400'
              }`}
              autoComplete="country-name"
            />
            {errors.pais && (
              <p className="mt-2 text-base font-sans text-red-600">
                {errors.pais}
              </p>
            )}
          </div>
        )}

        {/* Ciudad */}
        <div>
          <label
            htmlFor="ciudad"
            className="block font-sans text-lg font-semibold text-gray-800 mb-2"
          >
            Tu ciudad
            <span className="font-normal text-base text-gray-400 ml-2">
              (opcional)
            </span>
          </label>
          <input
            id="ciudad"
            type="text"
            value={data.ciudad}
            onChange={(e) => onChange('ciudad', e.target.value)}
            placeholder="Por ejemplo: Culiacán"
            className="w-full text-lg font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
            autoComplete="address-level2"
          />
          {errors.ciudad && (
            <p className="mt-2 text-base font-sans text-red-600">
              {errors.ciudad}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}