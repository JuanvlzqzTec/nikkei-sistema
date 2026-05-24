'use client'

import { useAuthStore } from '@/store/authStore'

function getPrimerNombre(nombreCompleto: string | null | undefined): string | null {
  if (!nombreCompleto) return null
  const trimmed = nombreCompleto.trim()
  if (!trimmed) return null
  return trimmed.split(/\s+/)[0]
}

export default function SaludoBienvenida() {
  const { user } = useAuthStore()

  const primerNombre = getPrimerNombre(user?.nombre_completo)

  return (
    <div className="text-center space-y-3">
      <h1 className="font-serif text-4xl sm:text-5xl text-red-800 leading-tight pt-5">
        {primerNombre ? (
          <>
            <span className="block text-2xl sm:text-3xl text-red-600/80 mb-2">
              ¡Bienvenido de vuelta!
            </span>
            <span>{primerNombre}</span>
          </>
        ) : (
          <>¡Bienvenido de vuelta!</>
        )}
      </h1>

      <div className="mx-auto h-1 w-24 rounded-full bg-linear-to-r from-red-600 to-amber-400" />

      <p className="font-sans text-lg text-red-600/80 max-w-xl mx-auto">
        Nos alegra verte de nuevo en la comunidad Nikkei de Sinaloa.
      </p>
    </div>
  )
}