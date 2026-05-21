'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Save, Loader2 } from 'lucide-react'
import ProgressBar from './ProgressBar'

interface Props {
  currentStep: number
  children: ReactNode
  onNext?: () => void
  onPrev?: () => void
  nextLabel?: string
  isLastStep?: boolean
  onSaveAndExit?: () => void
  isSaving?: boolean
  isSubmitting?: boolean
  disableNext?: boolean
}

export default function WizardLayout({
  currentStep,
  children,
  onNext,
  onPrev,
  nextLabel,
  isLastStep = false,
  onSaveAndExit,
  isSaving = false,
  isSubmitting = false,
  disableNext = false,
}: Props) {
  const showPrev = currentStep > 1 && !isSubmitting
  const labelSiguiente = nextLabel ?? (isLastStep ? 'Enviar mi registro' : 'Siguiente')

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)' }}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-red-800/15 shadow-sm p-3">
        <div className="container-nikkei py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/Logo-Nikkei.png"
              alt="Asociación Nikkei"
              width={48}
              height={48}
              className="rounded-full"
              priority
            />
            <div className="hidden sm:block">
              <p className="font-serif text-red-800 text-base leading-tight">
                Registro Comunitario
              </p>
              <p className="font-sans text-xs text-red-600/70">
                Asociación Nikkei de Sinaloa
              </p>
            </div>
          </Link>

          {/* Salir sin guardar */}
          {!isSubmitting && (
            <Link
              href="/dashboard"
              className="text-base font-sans text-gray-500 hover:text-red-800 transition-colors underline-offset-2 hover:underline"
            >
              Salir
            </Link>
          )}
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 container-nikkei py-8 lg:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8 lg:mb-10 pt-10">
            <ProgressBar currentStep={currentStep} />
          </div>

          {/* Tarjeta del paso */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 sm:p-8 lg:p-10">
            {children}
          </div>

          {/* Botonera de navegación */}
          <div className="mt-8 space-y-4">
            {/* Botón principal (Siguiente / Enviar) */}
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                disabled={disableNext || isSubmitting}
                className="w-full min-h-15 px-6 py-4 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-sans font-semibold text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Enviando tu registro...
                  </>
                ) : (
                  labelSiguiente
                )}
              </button>
            )}

            {/* Acciones secundarias: Atrás + Guardar y salir */}
            {(showPrev || onSaveAndExit) && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {showPrev && onPrev && (
                  <button
                    type="button"
                    onClick={onPrev}
                    disabled={isSubmitting}
                    className="flex-1 min-h-13 px-6 py-3 bg-white border-2 border-red-800/30 hover:border-red-800 text-red-800 font-sans font-semibold text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                    Atrás
                  </button>
                )}

                {onSaveAndExit && !isSubmitting && (
                  <button
                    type="button"
                    onClick={onSaveAndExit}
                    disabled={isSaving}
                    className="flex-1 min-h-13 px-6 py-3 bg-amber-50 border-2 border-amber-300 hover:border-amber-500 hover:bg-amber-100 text-amber-800 font-sans font-semibold text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Guardar y continuar después
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Aviso pequeño */}
          <p className="text-center text-sm font-sans text-gray-400 mt-6 leading-relaxed">
            Tus datos están protegidos y serán revisados por un administrador
            antes de aparecer en el directorio comunitario.
          </p>
        </div>
      </main>
    </div>
  )
}