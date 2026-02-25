'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, User, Mail, Shield, Calendar } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, checkAuth, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Verificar autenticación al cargar la página
    if (!isAuthenticated) {
      checkAuth()
    }
  }, [isAuthenticated, checkAuth])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-red-800 mb-4">Acceso Restringido</h1>
          <p className="text-red-600 mb-6 font-sans">Necesitas iniciar sesión para acceder a esta página</p>
          <Link href="/login">
            <Button className="bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-sans">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-wave-pattern bg-linear-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/assets/logo-ojn.png"
              alt="Logo OJN"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h1 className="text-lg font-serif text-red-800">Dashboard Nikkei</h1>
              <p className="text-sm text-red-600/70 font-sans">Asociación de Sinaloa</p>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 font-sans"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-white shadow-lg border-4 border-amber-100 flex items-center justify-center">
            <User className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-4xl font-serif text-red-800 mb-2">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="text-lg text-red-600/80 font-sans">
            Te has conectado exitosamente al sistema
          </p>
          <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-linear-to-r from-red-600 to-orange-400" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {/* User Info Card */}
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-red-800 font-sans">
                <Mail className="h-5 w-5 mr-2" />
                Tu Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-red-600 font-semibold font-sans">Email:</p>
                <p className="text-gray-800 font-sans">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-red-600 font-semibold font-sans">Rol:</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium font-sans ${
                  user.role === 'admin' 
                    ? 'bg-red-100 text-red-800' 
                    : user.role === 'miembro' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.role === 'admin' && '👑 Administrador'}
                  {user.role === 'miembro' && '🌸 Miembro'}
                  {user.role === 'pendiente' && '⏳ Pendiente'}
                </span>
              </div>
              <div>
                <p className="text-sm text-red-600 font-semibold font-sans">Estado:</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium font-sans ${
                  user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? '✅ Activo' : '❌ Inactivo'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-red-800 font-sans">
                <Shield className="h-5 w-5 mr-2" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start border-orange-200 hover:bg-orange-50 font-sans"
                disabled
              >
                👤 Editar Perfil
                <span className="ml-auto text-xs text-gray-400">Próximamente</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-orange-200 hover:bg-orange-50 font-sans"
                disabled
              >
                🔒 Cambiar Contraseña
                <span className="ml-auto text-xs text-gray-400">Próximamente</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-orange-200 hover:bg-orange-50 font-sans"
                disabled
              >
                👥 Mi Familia
                <span className="ml-auto text-xs text-gray-400">Próximamente</span>
              </Button>
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card className="bg-white/90 backdrop-blur-sm border-amber-200/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-red-800 font-sans">
                <Calendar className="h-5 w-5 mr-2" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-sans">Autenticación:</span>
                <span className="text-green-600 font-semibold font-sans">✅ Operativo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-sans">Base de Datos:</span>
                <span className="text-green-600 font-semibold font-sans">✅ Conectada</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-sans">Sesión:</span>
                <span className="text-green-600 font-semibold font-sans">✅ Activa</span>
              </div>
              <div className="pt-2 border-t border-orange-200">
                <p className="text-xs text-gray-500 font-sans">
                  Sistema Nikkei v1.0.0
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 text-center">
          <div className="bg-linear-to-r from-orange-50 to-amber-50 border border-orange-200/50 rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-serif text-red-800 mb-3">
              ¡Bienvenido a la Comunidad Nikkei! 🌸
            </h2>
            <p className="text-red-700 mb-4 font-sans">
              Has iniciado sesión exitosamente en el sistema de la Asociación Nikkei de Sinaloa. 
              Aquí podrás gestionar tu información personal, conectar con otros miembros de la 
              comunidad y participar en nuestras actividades culturales.
            </p>
            <p className="text-sm text-red-600 font-sans">
              <strong>Próximamente:</strong> Podrás completar tu perfil genealógico, 
              registrarte en eventos y explorar el directorio de empresas Nikkei.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white/60 backdrop-blur-sm border-t border-orange-200">
        <div className="container mx-auto px-4 py-6 text-center">
          <div className="mx-auto h-1 w-16 rounded-full bg-linear-to-r from-red-400 via-orange-400 to-amber-400 mb-4" />
          <p className="text-sm text-red-800 font-sans mb-1">
            © 2026 Asociación Nikkei de Sinaloa
          </p>
          <p className="text-xs text-red-600/70 font-sans">
            Preservando nuestra herencia cultural 🏮
          </p>
        </div>
      </footer>
    </div>
  )
}