'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-linear-to-r from-orange-50 via-amber-50 to-red-50 py-8 shadow-sm">
        <div className="container mx-auto px-2">
          <div className="flex items-start justify-between">
            
            {/* Left Side - Logo and Text */}
            <div className="flex items-center gap-3 ml-2">
              <Image
                src="/assets/logo-ojn.png"
                alt="Logo OJN"
                width={50}
                height={50}
                className="rounded-full"
              />
              <div>
                <h1 className="text-lg font-serif text-red-800 mb-1">
                  シナロア日系青年協会
                </h1>
                <p className="text-sm text-red-600/80 font-sans">
                  Asociación de Jóvenes Nikkei, Sinaloa
                </p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-col items-end gap-5 mr-2">
              
              {/* Top Row - Auth Buttons */}
              <div className="flex items-center" style={{ gap: '36px', padding: '10px' }}>
                <Link href="/register">
                  <button className="flex items-center gap-2 text-red-600 hover:text-red-800 font-sans text-sm font-medium transition-colors cursor-pointer">
                    <span>👤</span> Registrarse
                  </button>
                </Link>
                
                <Link href="/login">
                  <button className="flex items-center gap-2 text-red-600 hover:text-red-800 font-sans text-sm font-medium transition-colors cursor-pointer">
                    <span>🔑</span> Iniciar Sesión
                  </button>
                </Link>
              </div>

              {/* Bottom Row - Navigation */}
              <div className="flex items-center">
                <button className="text-red-700 hover:text-red-900 font-sans text-sm font-medium transition-colors cursor-pointer">
                  Sobre Nosotros
                </button>
              </div>
              
            </div>
          </div>
        </div>
      </header>

      {/* Rest of the page content will go here */}
      <main className="bg-wave-pattern bg-linear-to-br from-orange-50 via-amber-50 to-red-50 min-h-screen">
        <div className="container mx-auto px-6 py-20">
          <p className="text-center text-gray-600 font-sans">
            Aquí irá el resto del contenido de la página...
          </p>
        </div>
      </main>
    </div>
  )
}