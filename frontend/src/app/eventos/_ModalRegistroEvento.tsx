'use client'

import { useState } from 'react'
import { X, Check, Loader2, Ticket } from 'lucide-react'
import { registrarseEvento } from '@/lib/eventosApi'
import { useAuthStore } from '@/store/authStore'
import type { Evento } from './_types'

interface Props {
  evento: Evento
  onClose: () => void
  onYaRegistrado?: () => void
  onExito?: () => void
}

export default function ModalRegistroEvento({ evento, onClose, onYaRegistrado, onExito }: Props) {
  const { isAuthenticated, user } = useAuthStore()
  const [nombre, setNombre] = useState('')
  const [edad, setEdad] = useState('')
  const [acompaniantes, setAcompaniantes] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')
  const [yaRegistrado, setYaRegistrado] = useState(false)

  const esMiembro = isAuthenticated && user?.registro_estado === 'completado'

  const handleSubmit = async () => {
    if (!esMiembro && !nombre.trim()) {
      setError('Por favor escribe tu nombre')
      return
    }

    setEnviando(true)
    setError('')

    try {
      await registrarseEvento(evento.id_evento, {
        nombre_visitante: esMiembro ? undefined : nombre.trim(),
        edad_visitante: (!esMiembro && edad) ? Number(edad) : undefined,
        acompaniantes,
      })
      setExito(true)
      onExito?.()
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'ya_registrado') {
        setYaRegistrado(true)
        onYaRegistrado?.()
      } else {
        setError(e instanceof Error ? e.message : 'Error al registrarse')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md">

        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-xl text-red-800">Registrarme al evento</h2>
            <p className="font-sans text-sm text-gray-500 mt-1 line-clamp-1">{evento.titulo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {exito ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="font-serif text-xl text-gray-900">¡Registro exitoso!</h3>
              <p className="font-sans text-base text-gray-500">
                Te esperamos en el evento.
                {acompaniantes > 0 && ` Anotamos ${acompaniantes} acompañante${acompaniantes > 1 ? 's' : ''} adicional${acompaniantes > 1 ? 'es' : ''}.`}
              </p>
              <button onClick={onClose} className="w-full min-h-12 px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-sans font-semibold rounded-xl cursor-pointer transition-colors">
                Cerrar
              </button>
            </div>
          ) : yaRegistrado ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                <Ticket size={32} className="text-amber-600" />
              </div>
              <h3 className="font-serif text-xl text-gray-900">Ya estás registrado</h3>
              <p className="font-sans text-base text-gray-500">Tu lugar en este evento ya está reservado.</p>
              <button onClick={onClose} className="w-full min-h-12 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-sans font-semibold rounded-xl cursor-pointer transition-colors">
                Entendido
              </button>
            </div>
          ) : (
            <>
              {!esMiembro && (
                <>
                  <div>
                    <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
                      Tu nombre <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="¿Cómo te llamas?"
                      className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
                      Tu edad <span className="font-normal text-sm text-gray-400">(opcional)</span>
                    </label>
                    <input
                      type="number"
                      value={edad}
                      onChange={(e) => setEdad(e.target.value)}
                      placeholder="Años"
                      min={1}
                      max={120}
                      className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {esMiembro && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <Check size={18} className="text-green-600 shrink-0" />
                  <p className="font-sans text-sm text-green-800">
                    Registrándote como <strong>{user?.nombre_completo}</strong>
                  </p>
                </div>
              )}

              <div>
                <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
                  Acompañantes adicionales
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setAcompaniantes(Math.max(0, acompaniantes - 1))}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center font-sans text-lg text-gray-700 hover:border-red-400 transition-colors cursor-pointer"
                  >
                    −
                  </button>
                  <span className="font-serif text-2xl text-gray-900 w-8 text-center">{acompaniantes}</span>
                  <button
                    type="button"
                    onClick={() => setAcompaniantes(acompaniantes + 1)}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center font-sans text-lg text-gray-700 hover:border-red-400 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <p className="font-sans text-xs text-gray-400 mt-2">
                  Total: {1 + acompaniantes} {1 + acompaniantes === 1 ? 'persona' : 'personas'}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
                  <p className="font-sans text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="flex-1 min-h-12 px-4 py-2.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-sans font-semibold rounded-xl cursor-pointer transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={enviando}
                  className="flex-1 min-h-12 px-4 py-2.5 bg-red-700 hover:bg-red-800 disabled:bg-gray-300 text-white font-sans font-semibold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  {enviando ? <Loader2 size={16} className="animate-spin" /> : <Ticket size={16} />}
                  Confirmar registro
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}