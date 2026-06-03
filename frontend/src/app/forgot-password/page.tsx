'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Send, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Escribe tu correo'); return }
    setEnviando(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Error')
      setEnviado(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al enviar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-red-50"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='84' height='48' viewBox='0 0 84 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m0 12c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12zm84 0c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-84 24c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12zm84 0c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12z' fill='%23d97706' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.02'%3E%3Cpath d='M30 0h1v30h-1z'/%3E%3Cpath d='M0 29h30v1H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}>
      <div className="absolute inset-0 bg-linear-to-r from-red-900/10 via-transparent to-orange-800/10" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center">
            <div className="mx-auto mb-6 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-white shadow-xl border-4 border-amber-100 flex items-center justify-center">
                <Image src="/assets/Logo-Nikkei.png" alt="Logo OJN" width={60} height={60} className="rounded-full" />
              </div>
            </div>
            <h1 className="text-4xl text-red-800 font-serif mb-2">Recuperar Contraseña</h1>
            <p className="text-lg text-red-600/80 font-sans">Asociación Nikkei de Culiacán</p>
            <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-linear-to-r from-red-600 to-orange-400" />
          </div>

          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="pb-6 pt-6">
              {enviado ? (
                <div className="text-center space-y-5 py-4">
                  <CheckCircle size={56} className="text-green-500 mx-auto" />
                  <h2 className="font-serif text-2xl text-gray-900">Revisa tu correo</h2>
                  <p className="font-sans text-gray-500 text-sm leading-relaxed">
                    Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
                  </p>
                  <Link href="/login"
                    className="block w-full h-12 leading-12 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold font-sans shadow-lg transition-all rounded-lg text-center">
                    Volver al login
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  <p className="font-sans text-sm text-gray-500">
                    Escribe el correo con el que te registraste y te enviaremos un enlace para restablecer tu contraseña.
                  </p>

                  {error && (
                    <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg font-sans">
                      <strong>Error:</strong> {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block font-sans font-semibold text-red-800 text-sm">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      placeholder="tu@correo.com"
                      className="w-full h-12 px-4 border-2 border-orange-200 focus:border-red-400 focus:outline-none rounded-lg font-sans text-gray-800 bg-orange-50/50"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={enviando}
                    className="w-full h-12 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold font-sans shadow-lg transition-all duration-300 hover:shadow-xl rounded-lg flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                  >
                    {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    Enviar enlace de recuperación
                  </button>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-0 bg-linear-to-r from-orange-50 to-amber-50 rounded-b-lg">
              <div className="text-center">
                <Link href="/login"
                  className="text-sm text-red-700 font-sans flex items-center justify-center gap-1 hover:text-red-900 transition-colors">
                  <ArrowLeft size={14} /> Volver al login
                </Link>
              </div>
              <div className="text-center">
                <Link href="/" className="text-sm text-red-500 hover:text-red-700 transition-colors font-sans font-medium">
                  ← Volver al inicio
                </Link>
              </div>
            </CardFooter>
          </Card>

          <div className="text-center">
            <div className="mx-auto h-1 w-24 rounded-full bg-linear-to-r from-red-400 via-orange-400 to-amber-400 mb-4" />
            <p className="text-sm text-red-800 font-sans mb-2">© 2026 Asociación Nikkei de Culiacán</p>
            <p className="text-xs text-red-800 font-sans">Preservando nuestra herencia cultural 🌸</p>
          </div>
        </div>
      </div>
    </div>
  )
}