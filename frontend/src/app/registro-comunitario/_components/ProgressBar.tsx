'use client'

import { TOTAL_PASOS, PASOS_LABELS } from '../_types'

interface Props {
  currentStep: number
}

export default function ProgressBar({ currentStep }: Props) {
  const safeStep = Math.max(1, Math.min(currentStep, TOTAL_PASOS))
  const porcentaje = (safeStep / TOTAL_PASOS) * 100
  const label = PASOS_LABELS[safeStep] ?? ''

  return (
    <div className="w-full space-y-3" aria-label="Progreso del registro">
      {/* Texto superior */}
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <p className="text-base font-sans font-semibold text-red-800">
          Paso {safeStep} de {TOTAL_PASOS}
        </p>
        {label && (
          <p className="text-base font-sans text-gray-600">
            {label}
          </p>
        )}
      </div>

      {/* Barra */}
      <div
        className="w-full h-3 bg-amber-100 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={safeStep}
        aria-valuemin={1}
        aria-valuemax={TOTAL_PASOS}
      >
        <div
          className="h-full bg-linear-to-r from-red-700 to-amber-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  )
}