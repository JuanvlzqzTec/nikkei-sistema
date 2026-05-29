'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Send, Check, Loader2, X, Facebook, Instagram, ArrowLeft } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const REDES = [
  {
    nombre: 'Facebook',
    url: 'https://www.facebook.com/nikkeiculiacan/',
    icon: Facebook,
    color: 'hover:text-blue-600',
  },
  {
    nombre: 'Instagram',
    url: 'https://www.instagram.com/nikkeiculiacan/',
    icon: Instagram,
    color: 'hover:text-pink-600',
  },
]

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: '', correo: '', mensaje: '' })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const setCampo = (k: keyof typeof form, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.correo.trim() || !form.mensaje.trim()) {
      setError('Por favor completa todos los campos')
      return
    }

    setEnviando(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/api/v1/contacto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          correo: form.correo.trim(),
          mensaje: form.mensaje.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al enviar')
      setEnviado(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al enviar el mensaje')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)' }}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-red-800/15 shadow-sm sticky top-0 z-10 p-3">
        <div className="container-nikkei py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/assets/Logo-Nikkei.png" alt="Logo Asociación Nikkei" width={44} height={44} className="rounded-full" priority />
            <div>
              <p className="font-serif text-red-800 text-lg leading-tight">Asociación Nikkei</p>
              <p className="font-sans text-xs text-red-600/70">de Culiacán</p>
            </div>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-sans text-red-700 hover:text-red-900 font-semibold">
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="container-nikkei py-12 lg:py-16">
        <div className="max-w-2xl mx-auto space-y-10">

          {/* Título */}
          <div className="text-center space-y-3">
            <h1 className="font-serif text-4xl sm:text-5xl text-red-800 leading-tight pt-3">
              Contáctanos
            </h1>
            <div className="mx-auto h-1 w-24 rounded-full bg-linear-to-r from-red-600 to-amber-400" />
            <p className="font-sans text-lg text-red-600/80 max-w-lg mx-auto">
              ¿Tienes dudas, comentarios o quieres saber más sobre la comunidad Nikkei de Sinaloa? Escríbenos.
            </p>
          </div>

          {/* Formulario o pantalla de éxito */}
          {enviado ? (
            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-10 text-center space-y-5">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <Check size={40} className="text-green-700" />
              </div>
              <div>
                <h2 className="font-serif text-2xl text-red-800 mb-2">¡Mensaje enviado!</h2>
                <p className="font-sans text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
                  Recibimos tu mensaje. Te responderemos al correo que nos proporcionaste a la brevedad.
                </p>
              </div>
              <p className="font-serif text-3xl text-red-900/10 select-none">ありがとう</p>
              <button
                onClick={() => { setEnviado(false); setForm({ nombre: '', correo: '', mensaje: '' }) }}
                className="font-sans text-sm text-red-700 hover:text-red-900 underline underline-offset-2 cursor-pointer"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 sm:p-8 space-y-5">
              {/* Nombre */}
              <div>
                <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
                  Tu nombre <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setCampo('nombre', e.target.value)}
                  className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Correo */}
              <div>
                <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
                  Correo electrónico <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={form.correo}
                  onChange={(e) => setCampo('correo', e.target.value)}
                  className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Mensaje */}
              <div>
                <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
                  Mensaje <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={form.mensaje}
                  onChange={(e) => setCampo('mensaje', e.target.value)}
                  rows={6}
                  placeholder="¿En qué podemos ayudarte?"
                  maxLength={2000}
                  className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors resize-none"
                />
                <p className="text-xs text-gray-400 font-sans mt-1 text-right">
                  {form.mensaje.length}/2000
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <X size={16} className="text-red-700 shrink-0 mt-0.5" />
                  <p className="font-sans text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={enviando}
                className="w-full min-h-13 px-6 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 disabled:from-gray-300 disabled:to-gray-400 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {enviando ? (
                  <><Loader2 size={16} className="animate-spin" />Enviando...</>
                ) : (
                  <><Send size={16} />Enviar mensaje</>
                )}
              </button>
            </div>
          )}

          {/* Redes sociales */}
          <div className="text-center space-y-4">
            <p className="font-sans text-base text-gray-500">También puedes encontrarnos en</p>
            <div className="flex items-center justify-center gap-4">
              {REDES.map((red) => {
                const Icon = red.icon
                return (
                    <a  key={red.nombre}
                        href={red.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl font-sans text-sm font-semibold text-gray-600 transition-all cursor-pointer"
                    >
                        <Icon size={18} />
                        {red.nombre}
                  </a>
                )
              })}
            </div>
          </div>

          {/* Decoración */}
          <div className="text-center">
            <p className="font-serif text-5xl text-red-900/8 select-none">縁</p>
          </div>

        </div>
      </main>
    </div>
  )
}