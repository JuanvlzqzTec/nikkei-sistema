'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LogIn, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header con tu configuración de globals.css */}
      <header className="header-container shadow-sm">
        {/* max-w-none asegura que el contenedor use todo el ancho para pegar los elementos a los bordes */}
        <div className="w-full px-4">
          <div className="flex items-start justify-between">
            
            {/* Lado Izquierdo - Logo y Textos pegados a la izquierda */}
            <div className="flex items-center gap-3">
              <Image
                src="/assets/Logo-OJN.png"
                alt="Logo OJN"
                width={50}
                height={50}
                className="rounded-full"
                priority
              />
              <div>
                <h1 className="header-logo-text-main">
                  シナロア日系青年協会
                </h1>
                <p className="header-logo-text-sub">
                  Asociación de Jóvenes Nikkei, Sinaloa
                </p>
              </div>
            </div>

            {/* Lado Derecho - Botones alineados totalmente a la derecha */}
            <div className="header-buttons-container">
              
              {/* Botones de Auth */}
              <div className="header-buttons-top" style={{ padding: '0.1px 0.5px' }}>
                <Link href="/register">
                  <Button variant="ghost" className="header-auth-button group">
                    <UserPlus size={18} className="text-nikkei-burgundy" />
                    <span>Registrarse</span>
                  </Button>
                </Link>
                
                <Link href="/login">
                  <Button variant="ghost" className="header-auth-button group">
                    <LogIn size={18} className="text-nikkei-burgundy" />
                    <span>Iniciar Sesión</span>
                  </Button>
                </Link>
              </div>

              {/* Navegación - Alineada a la derecha por el contenedor flex padre */}
              <div className="flex items-center justify-end mt-1 gap-2">
  
                <button className="header-nav-button">
                  Sobre Nosotros
                </button>

                <button className="header-nav-button">
                  Historia
                </button>

                <button className="header-nav-button">
                  Eventos
                </button>

                <button className="header-nav-button">
                  Contacto
                </button>
                          
              </div>
              
            </div>
          </div>
        </div>
      </header>

      {/* Fondo y gradiente original */}
      <main className="bg-wave-pattern bg-linear-to-br from-orange-50 via-amber-50 to-red-50 min-h-screen">
        <div className="container-nikkei py-20">
          <p className="text-center text-gray-600 font-sans">
            Aquí irá el resto del contenido de la página...
          </p>
        </div>
      </main>
    </div>
  )
}