'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Send, Check, Loader2, X, Facebook, Instagram, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SiteHeader from '@/components/SiteHeader'

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
    <>
      <SiteHeader variant="page" />

      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)' }}>

        {/* Hero */}
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'radial-gradient(circle, #8B2635 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />

          <div className="relative z-10 container-nikkei pt-12 pb-16">
            <div className="space-y-4 pt-2 max-w-2xl">
              <h1 className="text-4xl lg:text-5xl font-serif text-gray-900 leading-tight">
                お問い合わせ
              </h1>
              <h2 className="text-2xl font-serif text-red-800">
                Contáctanos
              </h2>
              <div className="w-16 h-0.5 bg-linear-to-r from-red-700 to-amber-400 rounded-full" />
              <p className="text-lg font-sans text-gray-600 leading-relaxed">
                ¿Tienes dudas, comentarios o quieres saber más sobre la comunidad Nikkei de Sinaloa? Escríbenos.
              </p>
            </div>
          </div>
        </div>

        {/* Ola de transición */}
        <div className="relative -mb-1">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 10 L0 35 Q360 65 720 35 Q1080 5 1440 35 L1440 60 L0 60 Z" fill="white" />
          </svg>
        </div>

        {/* Contenido */}
        <div className="bg-white">
          <div className="container-nikkei pt-12 pb-20">

            <div className="max-w-2xl mx-auto space-y-10">

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
                  <p className="font-serif text-5xl text-red-900/10 select-none">ありがとう</p>
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
                      <a
                        key={red.nombre}
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

              {/* CTA Final */}
              <div className="pt-12 border-t border-gray-100 text-center space-y-4">
                <p className="font-serif text-2xl text-gray-700">
                  ¿Eres parte de la comunidad Nikkei de Sinaloa?
                </p>
                <p className="font-sans text-lg text-gray-400 max-w-md mx-auto">
                  Únete al registro comunitario y forma parte de nuestra historia digital.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <Link href="/register">
                    <Button className="btn-nikkei">
                      Registrarme <ArrowRight size={16} />
                    </Button>
                  </Link>
                  <Link href="/directorio">
                    <button className="px-8 py-1 cursor-pointer border-2 border-red-800 text-red-800 hover:bg-red-800 hover:text-white font-sans font-semibold rounded-lg transition-all duration-300 text-base">
                      Ver directorio empresarial
                    </button>
                  </Link>
                </div>
                <p className="font-serif text-4xl text-red-900/10 select-none mt-8">縁</p>
                <p className="text-xs font-sans text-gray-400 uppercase tracking-wider">
                  Asociación Nikkei · Culiacán, Sinaloa
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}