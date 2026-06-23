'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token')
  const [estado, setEstado] = useState<'cargando' | 'exito' | 'error'>('cargando')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (!token) {
      const t = setTimeout(() => {
        setEstado('error')
        setMensaje('Token de verificación no encontrado.')
      }, 0)
      return () => clearTimeout(t)
    }
    fetch(`${API_URL}/api/v1/auth/verify-email?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.message) { setEstado('exito'); setMensaje(d.message) }
        else { setEstado('error'); setMensaje(d.error || 'Error al verificar') }
      })
      .catch(() => { setEstado('error'); setMensaje('Error de conexión') })
  }, [token])

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
            <h1 className="text-4xl text-red-800 font-serif mb-2">Verificación de Correo</h1>
            <p className="text-lg text-red-600/80 font-sans">Nikkei Culiacán AC</p>
            <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-linear-to-r from-red-600 to-orange-400" />
          </div>

          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="pb-6 pt-8 text-center space-y-5">
              {estado === 'cargando' && (
                <>
                  <Loader2 size={52} className="animate-spin text-red-700 mx-auto" />
                  <p className="font-sans text-gray-600">Verificando tu correo...</p>
                </>
              )}

              {estado === 'exito' && (
                <>
                  <CheckCircle size={56} className="text-green-500 mx-auto" />
                  <h2 className="font-serif text-2xl text-gray-900">¡Correo verificado!</h2>
                  <p className="font-sans text-gray-500 text-sm">{mensaje}</p>
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full h-12 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold font-sans shadow-lg transition-all duration-300 hover:shadow-xl rounded-lg"
                  >
                    Iniciar sesión
                  </button>
                </>
              )}

              {estado === 'error' && (
                <>
                  <XCircle size={56} className="text-red-400 mx-auto" />
                  <h2 className="font-serif text-2xl text-gray-900">Enlace inválido</h2>
                  <p className="font-sans text-gray-500 text-sm">{mensaje}</p>
                  <Link href="/login"
                    className="block w-full h-12 leading-12 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold font-sans shadow-lg transition-all duration-300 hover:shadow-xl rounded-lg">
                    Volver al login
                  </Link>
                </>
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