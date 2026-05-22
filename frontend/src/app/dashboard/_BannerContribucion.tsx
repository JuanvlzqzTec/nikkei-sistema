'use client'

import { useState, useEffect } from 'react'
import {
  Heart,
  X,
  Loader2,
  Send,
  Check,
} from 'lucide-react'
import { contribucionesApi } from '@/lib/contribucionesApi'

export default function BannerContribucion() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <section
        className="relative overflow-hidden rounded-2xl border-2 border-amber-300 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)',
        }}
      >
        <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5">
          {/* Icono */}
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Heart size={28} />
          </div>

          {/* Texto */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h2 className="font-serif text-xl sm:text-2xl text-red-800 leading-tight">
              ¿Tienes algo que compartir con la comunidad?
            </h2>
            <p className="font-sans text-base text-gray-600 leading-relaxed">
              Fotografías antiguas, objetos familiares, documentos, o una
              historia que merezca ser contada. Nos encantaría conocerla.
            </p>
          </div>

          {/* Botón */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto min-h-13 px-6 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Heart size={17} />
            Contáctanos
          </button>
        </div>

        {/* Decoración kanji */}
        <span
          className="absolute -bottom-8 -right-4 font-serif text-9xl text-red-900/5 select-none pointer-events-none"
          aria-hidden="true"
        >
          縁
        </span>
      </section>

      {showModal && <ModalContribucion onClose={() => setShowModal(false)} />}
    </>
  )
}

// Modal

function ModalContribucion({ onClose }: { onClose: () => void }) {
  const [mensaje, setMensaje] = useState('')
  const [telefono, setTelefono] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !enviando) onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose, enviando])

  const handleSubmit = async () => {
    const mensajeLimpio = mensaje.trim()

    if (mensajeLimpio.length < 20) {
      setError('Por favor cuéntanos un poco más (mínimo 20 caracteres)')
      return
    }
    if (mensajeLimpio.length > 2000) {
      setError('El mensaje es demasiado largo (máximo 2000 caracteres)')
      return
    }

    setEnviando(true)
    setError('')

    try {
      await contribucionesApi.crear({
        mensaje: mensajeLimpio,
        telefono_contacto: telefono.trim() || undefined,
      })
      setEnviado(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al enviar')
    } finally {
      setEnviando(false)
    }
  }

  const caracteresUsados = mensaje.trim().length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !enviando && onClose()}
      />

      {/* Panel */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
        {/* Pantalla de éxito */}
        {enviado ? (
          <div className="p-8 sm:p-10 text-center space-y-5">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <Check size={40} className="text-green-700" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-red-800 leading-tight mb-2">
                ¡Muchas gracias!
              </h2>
              <p className="font-sans text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
                Recibimos tu mensaje. Un administrador te contactará pronto
                para coordinar los siguientes pasos.
              </p>
            </div>
            <p className="font-serif text-3xl text-red-900/15 select-none">
              ありがとう
            </p>
            <button
              onClick={onClose}
              className="w-full sm:w-auto min-h-12 px-8 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all duration-200 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="font-serif text-2xl text-red-800 leading-tight">
                  Comparte con la comunidad
                </h2>
                <p className="font-sans text-base text-gray-500 mt-1">
                  Cuéntanos qué tienes para compartir.
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={enviando}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Mensaje */}
              <div>
                <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
                  ¿Qué quieres compartir?{' '}
                  <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  rows={6}
                  maxLength={2000}
                  placeholder="Por ejemplo: 'Tengo fotografías antiguas de mi abuelo que llegó a México en los años 50...' o 'Conservo un kimono que perteneció a mi familia...' o 'Tengo una historia sobre la fundación de la asociación que me contó mi madre...'"
                  className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors resize-none"
                  autoFocus
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p
                    className={`font-sans text-xs ${
                      caracteresUsados < 20 ? 'text-gray-400' : 'text-green-600'
                    }`}
                  >
                    {caracteresUsados < 20
                      ? `${caracteresUsados}/20 caracteres mínimos`
                      : `${caracteresUsados} caracteres`}
                  </p>
                  <p className="font-sans text-xs text-gray-400">
                    Máximo 2000
                  </p>
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
                  Teléfono donde podemos contactarte
                  <span className="font-normal text-sm text-gray-400 ml-2">
                    (opcional)
                  </span>
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="667 123 4567"
                  className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
                />
                <p className="font-sans text-sm text-gray-500 mt-1.5 leading-relaxed">
                  Si lo dejas en blanco, te contactaremos al teléfono que
                  registraste en tu perfil.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <X size={16} className="text-red-700 shrink-0 mt-0.5" />
                  <p className="font-sans text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 px-6 py-5 border-t border-gray-100">
              <button
                onClick={onClose}
                disabled={enviando}
                className="min-h-12 px-5 py-2.5 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-sans font-semibold text-base rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={enviando || caracteresUsados < 20}
                className="min-h-12 px-6 py-2.5 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 disabled:from-gray-300 disabled:to-gray-400 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {enviando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Enviar mensaje
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}