'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

import { useAuthStore } from '@/store/authStore'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registrado, setRegistrado] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    clearError()
    try {
      await registerUser(data.email, data.password)
      setRegistrado(true)
    } catch (error) {
    }
  }

  if (registrado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)' }}>
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-6">
          <Image src="/assets/Logo-Nikkei.png" alt="Logo" width={56} height={56} className="rounded-full mx-auto" />
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <Send size={28} className="text-amber-600" />
          </div>
          <h1 className="font-serif text-2xl text-red-800">Revisa tu correo</h1>
          <p className="font-sans text-gray-500 text-sm leading-relaxed">
            Te enviamos un enlace de verificación. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
          </p>
          <button onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-sans font-semibold rounded-xl transition-colors">
            Continuar al dashboard
          </button>
          <p className="text-xs font-sans text-gray-400">
            ¿No llegó?  Revisa tu carpeta de spam.
          </p>
          <p className="font-serif text-3xl text-red-900/10 select-none">縁</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-red-50" 
         style={{
           backgroundImage: `url("data:image/svg+xml,%3Csvg width='84' height='48' viewBox='0 0 84 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m0 12c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12zm84 0c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-84 24c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12zm84 0c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12z' fill='%23d97706' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.02'%3E%3Cpath d='M30 0h1v30h-1z'/%3E%3Cpath d='M0 29h30v1H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
         }}>
      
      {/* Overlay con gradiente */}
      <div className="absolute inset-0 bg-linear-to-r from-red-900/10 via-transparent to-orange-800/10" />
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-6 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-white shadow-xl border-4 border-amber-100 flex items-center justify-center">
                <Image
                  src="/assets/Logo-Nikkei.png"
                  alt="Logo OJN"
                  width={60}
                  height={60}
                  className="rounded-full"
                />
              </div>
            </div>
            <h1 className="text-4xl text-red-800 font-serif mb-2">
              Únete a la Comunidad
            </h1>
            <p className="text-lg text-red-600/80 font-sans">
              Asociación Nikkei de Culiacán
            </p>
            <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-linear-to-r from-red-600 to-orange-400" />
          </div>

          {/* Register Card */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm border-amber-200/50">
            
            <CardContent className="pb-6 pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg font-sans">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-red-800 font-sans font-semibold">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Tu correo"
                    {...register('email')}
                    className="h-12 border-2 border-orange-200 focus:border-red-400 focus:ring-red-200 font-sans text-gray-800 bg-orange-50/50"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 font-sans font-medium">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-red-800 font-sans font-semibold">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      {...register('password')}
                      className="h-12 pr-12 border-2 border-orange-200 focus:border-red-400 focus:ring-red-200 font-sans text-gray-800 bg-orange-50/50"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-red-50 text-red-400 hover:text-red-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 font-sans font-medium">{errors.password.message}</p>
                  )}
                  <p className="text-xs text-red-500/70 font-sans">
                    Debe contener mayúscula, minúscula y número
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-red-800 font-sans font-semibold">
                    Confirmar Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repite tu contraseña"
                      {...register('confirmPassword')}
                      className="h-12 pr-12 border-2 border-orange-200 focus:border-red-400 focus:ring-red-200 font-sans text-gray-800 bg-orange-50/50"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-red-50 text-red-400 hover:text-red-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 font-sans font-medium">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Community Notice */}
                <div className="p-3 bg-linear-to-r from-orange-50 to-amber-50 border border-orange-200/50 rounded-lg">
                  <p className="text-xs text-red-700 font-sans">
                    <strong>Bienvenido a la familia Nikkei:</strong> Al registrarte, formarás parte de nuestra comunidad dedicada a preservar y celebrar la herencia japonesa en Culiacán.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold font-sans shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 cursor-pointer"
                    disabled={isLoading || isSubmitting}
                  >
                    {isLoading || isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creando cuenta...
                      </>
                    ) : (
                      'Unirse a la Comunidad'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-0 bg-linear-to-r from-orange-50 to-amber-50 rounded-b-lg">
              <div className="text-center text-sm text-red-700 font-sans">
                ¿Ya tienes una cuenta?{' '}
                <Link 
                  href="/login" 
                  className="font-bold text-red-600 hover:text-orange-600 transition-colors underline decoration-wavy decoration-orange-300"
                >
                  Iniciar Sesión
                </Link>
              </div>
              
              <div className="text-center">
                <Link 
                  href="/" 
                  className="text-sm text-red-500 hover:text-red-700 transition-colors font-sans font-medium"
                >
                  ← Volver al inicio
                </Link>
              </div>
            </CardFooter>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <div className="mx-auto h-1 w-24 rounded-full bg-linear-to-r from-red-400 via-orange-400 to-amber-400 mb-4" />
            <p className="text-sm text-red-800 font-sans mb-2">
              © 2026 Asociación Nikkei de Culiacán
            </p>
            <p className="text-xs text-red-800 font-sans mb-2">
              Preservando nuestra herencia cultural 🌸
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}