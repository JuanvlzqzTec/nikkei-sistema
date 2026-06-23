'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export default function ResetPasswordPage() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token')

  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!password || !confirmar) { setError('Completa todos los campos'); return }
    if (password !== confirmar) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 8) { setError('Mínimo 8 caracteres'); return }
    if (!token) { setError('Token inválido'); return }
    setEnviando(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Error')
      setExito(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al restablecer')
    } finally {
      setEnviando(false)
    }
  }

  const bgStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='84' height='48' viewBox='0 0 84 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m0 12c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12zm84 0c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-84 24c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12zm84 0c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12z' fill='%23d97706' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.02'%3E%3Cpath d='M30 0h1v30h-1z'/%3E%3Cpath d='M0 29h30v1H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-red-50" style={bgStyle}>
      <div className="absolute inset-0 bg-linear-to-r from-red-900/10 via-transparent to-orange-800/10" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center">
            <div className="mx-auto mb-6 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-white shadow-xl border-4 border-amber-100 flex items-center justify-center">
                <Image src="/assets/Logo-Nikkei.png" alt="Logo OJN" width={60} height={60} className="rounded-full" />
              </div>
            </div>
            <h1 className="text-4xl text-red-800 font-serif mb-2">Nueva Contraseña</h1>
            <p className="text-lg text-red-600/80 font-sans">Nikkei Culiacán AC</p>
            <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-linear-to-r from-red-600 to-orange-400" />
          </div>

          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="pb-6 pt-6">

              {!token ? (
                <div className="text-center space-y-5 py-4">
                  <XCircle size={56} className="text-red-400 mx-auto" />
                  <h2 className="font-serif text-xl text-gray-900">Enlace inválido</h2>
                  <Link href="/forgot-password"
                    className="block w-full h-12 leading-12 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold font-sans shadow-lg transition-all rounded-lg text-center">
                    Solicitar nuevo enlace
                  </Link>
                </div>
              ) : exito ? (
                <div className="text-center space-y-5 py-4">
                  <CheckCircle size={56} className="text-green-500 mx-auto" />
                  <h2 className="font-serif text-2xl text-gray-900">¡Contraseña actualizada!</h2>
                  <p className="font-sans text-sm text-gray-500">Ya puedes iniciar sesión con tu nueva contraseña.</p>
                  <button onClick={() => router.push('/login')}
                    className="w-full h-12 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold font-sans shadow-lg transition-all duration-300 hover:shadow-xl rounded-lg">
                    Iniciar sesión
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {error && (
                    <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg font-sans">
                      <strong>Error:</strong> {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block font-sans font-semibold text-red-800 text-sm">Nueva contraseña</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full h-12 px-4 pr-12 border-2 border-orange-200 focus:border-red-400 focus:outline-none rounded-lg font-sans text-gray-800 bg-orange-50/50"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600">
                        {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-sans font-semibold text-red-800 text-sm">Confirmar contraseña</label>
                    <div className="relative">
                      <input
                        type={showConf ? 'text' : 'password'}
                        value={confirmar}
                        onChange={e => setConfirmar(e.target.value)}
                        placeholder="Repite tu contraseña"
                        className="w-full h-12 px-4 pr-12 border-2 border-orange-200 focus:border-red-400 focus:outline-none rounded-lg font-sans text-gray-800 bg-orange-50/50"
                      />
                      <button type="button" onClick={() => setShowConf(!showConf)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600">
                        {showConf ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={enviando}
                    className="w-full h-12 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold font-sans shadow-lg transition-all duration-300 hover:shadow-xl rounded-lg flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                  >
                    {enviando && <Loader2 className="h-5 w-5 animate-spin" />}
                    Actualizar contraseña
                  </button>

                  <div className="text-center">
                    <Link href="/forgot-password"
                      className="text-xs font-sans text-red-600 hover:text-red-800 transition-colors">
                      Solicitar nuevo enlace
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-0 bg-linear-to-r from-orange-50 to-amber-50 rounded-b-lg">
              <div className="text-center">
                <Link href="/" className="text-sm text-red-500 hover:text-red-700 transition-colors font-sans font-medium">
                  ← Volver al inicio
                </Link>
              </div>
            </CardFooter>
          </Card>

          <div className="text-center">
            <div className="mx-auto h-1 w-24 rounded-full bg-linear-to-r from-red-400 via-orange-400 to-amber-400 mb-4" />
            <p className="text-sm text-red-800 font-sans mb-2">© Nikkei Culiacán AC</p>
            <p className="text-xs text-red-800 font-sans">Preservando nuestra herencia cultural 🌸</p>
          </div>
        </div>
      </div>
    </div>
  )
}