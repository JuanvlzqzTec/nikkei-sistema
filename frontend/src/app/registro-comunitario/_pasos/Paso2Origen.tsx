'use client'

import type { WizardData, FamiliaPublica, NuevaFamiliaData } from '../_types'
import { GENERACIONES } from '../_constants'
import SelectorFamilia from '../_components/SelectorFamilia'
import { Info } from 'lucide-react'

interface Props {
  data: WizardData
  errors: Partial<Record<keyof WizardData, string>>
  onChange: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void
  onFamiliasLoaded?: (familias: FamiliaPublica[]) => void
  firstErrorRef?: React.RefObject<HTMLDivElement | null>
}

export default function Paso2Origen({
  data,
  errors,
  onChange,
  onFamiliasLoaded,
  firstErrorRef,
}: Props) {
  const handleSelectFamilia = (familia: FamiliaPublica) => {
    onChange('id_familia', familia.id_familia)
    onChange('nueva_familia', null)
  }

  const handleCreateNueva = (nueva: NuevaFamiliaData) => {
    onChange('nueva_familia', nueva)
    onChange('id_familia', null)
  }

  const handleClearSelection = () => {
    onChange('id_familia', null)
    onChange('nueva_familia', null)
  }

  const handleSelectFamiliaSecundaria = (familia: FamiliaPublica) => {
    onChange('id_familia_secundaria', familia.id_familia)
    onChange('nueva_familia_secundaria', null)
  }

  const handleCreateNuevaSecundaria = (nueva: NuevaFamiliaData) => {
    onChange('nueva_familia_secundaria', nueva)
    onChange('id_familia_secundaria', null)
  }

  const handleClearSelectionSecundaria = () => {
    onChange('id_familia_secundaria', null)
    onChange('nueva_familia_secundaria', null)
  }

  const tieneFamiliaPrincipal =
    data.id_familia !== null || data.nueva_familia !== null

  const refGeneracion = errors.generacion ? firstErrorRef : undefined
  const refFamilia =
    !errors.generacion && errors.id_familia ? firstErrorRef : undefined

  return (
    <div className="space-y-2">
      <div className="mb-8">
        <h2 className="font-serif text-2xl sm:text-3xl text-red-800 leading-tight mb-2">
          Cuéntanos sobre tu origen
        </h2>
        <p className="font-sans text-base text-gray-600 leading-relaxed">
          Aquí encontrarás tu lugar en la comunidad Nikkei de Sinaloa.
        </p>
      </div>

      <div className="space-y-8">
        {/* Generación */}
        <div ref={refGeneracion} className="scroll-mt-24">
          <label className="block font-sans text-lg font-semibold text-gray-800 mb-3">
            ¿Qué generación Nikkei eres? <span className="text-red-600">*</span>
          </label>
          <p className="font-sans text-sm text-gray-500 mb-3 leading-relaxed bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            La primera generación (Issei) está formada por quienes emigraron directamente de Japón a México. Cada generación siguiente corresponde a sus descendientes nacidos en México.
          </p>

          <div className="space-y-2">
            {GENERACIONES.map((opcion) => {
              const seleccionado = data.generacion === opcion.value
              return (
                <button
                  key={opcion.value}
                  type="button"
                  onClick={() => onChange('generacion', opcion.value)}
                  className={`w-full text-left min-h-17 px-5 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    seleccionado
                      ? 'border-red-700 bg-red-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-red-300 hover:bg-amber-50/50'
                  }`}
                >
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className={`font-sans text-lg font-bold ${seleccionado ? 'text-red-800' : 'text-gray-800'}`}>
                      {opcion.label}
                    </span>
                    <span className="font-sans text-base text-gray-500">
                      — {opcion.descripcion}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {errors.generacion && (
            <p className="mt-2 text-base font-sans text-red-600">{errors.generacion}</p>
          )}
        </div>

        {/* Selector de familia principal */}
        <div ref={refFamilia} className="pt-6 border-t border-gray-100 scroll-mt-24">
          <label className="block font-sans text-lg font-semibold text-gray-800 mb-2">
            ¿A qué familia japonesa perteneces? <span className="text-red-600">*</span>
          </label>

          {/* Aviso doble apellido */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
            <Info size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <p className="font-sans text-sm text-amber-800 leading-relaxed">
              La herencia Nikkei viene por muchos caminos. Si tu apellido japonés es el materno, el paterno, o ambos, aquí puedes reflejarlo correctamente. En caso de tener dos apellidos japoneses, registra primero el <strong>apellido paterno</strong> y después el <strong>apellido materno</strong>.
            </p>
          </div>

          <SelectorFamilia
            idFamiliaSeleccionada={data.id_familia}
            nuevaFamilia={data.nueva_familia}
            onSelectFamilia={handleSelectFamilia}
            onCreateNueva={handleCreateNueva}
            onClearSelection={handleClearSelection}
            onFamiliasLoaded={onFamiliasLoaded}
            error={errors.id_familia}
          />
        </div>

        {/* Selector de familia secundaria — solo visible si ya eligió la principal */}
        {tieneFamiliaPrincipal && (
          <div className="pt-6 border-t border-gray-100 scroll-mt-24">
            <label className="block font-sans text-lg font-semibold text-gray-800 mb-2">
              ¿Perteneces también a otra familia japonesa?
              <span className="font-normal text-base text-gray-400 ml-2">(opcional)</span>
            </label>
            <p className="font-sans text-sm text-gray-500 mb-4 leading-relaxed">
              Si tienes herencia japonesa por ambos lados, puedes registrar aquí tu segunda familia.
            </p>

            <SelectorFamilia
              idFamiliaSeleccionada={data.id_familia_secundaria}
              nuevaFamilia={data.nueva_familia_secundaria}
              onSelectFamilia={handleSelectFamiliaSecundaria}
              onCreateNueva={handleCreateNuevaSecundaria}
              onClearSelection={handleClearSelectionSecundaria}
              error={undefined}
            />
          </div>
        )}
      </div>
    </div>
  )
}