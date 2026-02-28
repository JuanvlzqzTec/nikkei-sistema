'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LogIn, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = [
    '/assets/slider/slide-1.jpg',
    '/assets/slider/slide-2.jpg',
    '/assets/slider/slide-3.jpg',
  ]

  // Auto-advance slider every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 3000)
    
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="min-h-screen">
      {/* Header existente */}
      <header className="header-container shadow-sm">
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

            {/* Lado Derecho - Botones */}
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

              {/* Navegación */}
              <div className="flex items-center justify-end mt-1 gap-2">
                <button className="header-nav-button">Sobre Nosotros</button>
                <button className="header-nav-button">Historia</button>
                <button className="header-nav-button">Eventos</button>
                <button className="header-nav-button">Contacto</button>
              </div>
              
            </div>
          </div>
        </div>
      </header>

      {/* Nueva Sección Hero con fondo burgundy y patrón */}
      <section className="hero-section relative overflow-hidden">
        {/* Fondo burgundy con patrón geométrico del login */}
        <div className="absolute inset-0" style={{
          backgroundColor: 'var(--color-nikkei-burgundy)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='84' height='48' viewBox='0 0 84 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m0 12c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12zm84 0c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-84 24c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12zm84 0c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12z' fill='%23ffffff' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M30 0h1v30h-1z'/%3E%3Cpath d='M0 29h30v1H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        {/* Overlay con gradiente sutil */}
        <div className="absolute inset-0 bg-linear-to-r from-red-900/10 via-transparent to-red-800/10" />
        
        {/* Contenido de la sección hero */}
        <div className="relative z-10 container-nikkei py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-150">
            
            {/* Lado Izquierdo - Textos y CTA */}
            <div className="space-y-8">
              
              {/* Texto principal en japonés */}
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-6xl font-serif text-white leading-tight">
                  時を超えて続く絆を築く
                </h2>
                
                {/* Texto en español */}
                <p className="text-xl lg:text-2xl text-white/90 font-serif">
                  Creando vínculos que perduran con el tiempo
                </p>
              </div>

              {/* Línea decorativa */}
              <div className="w-24 h-1 bg-linear-to-r from-amber-400 to-yellow-300 rounded-full" />

              {/* Descripción adicional */}
              <p className="text-lg text-white/80 font-sans leading-relaxed max-w-lg">
                Únete a nuestra comunidad y forma parte de la historia que conecta 
                las tradiciones japonesas con el corazón de Sinaloa.
              </p>

              {/* CTA Button */}
              <div className="pt-4">
                <Link href="/register">
                  <Button className="bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                    Únete a Nuestra Comunidad
                  </Button>
                </Link>
              </div>
              
            </div>

            {/* Lado Derecho - Slider de Imágenes */}
            <div className="relative">
              
              {/* Container del slider */}
              <div className="relative overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                
                {/* Imágenes del slider */}
                <div className="relative h-96 lg:h-125">
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <Image
                        src={slide}
                        alt={`Slide ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                  ))}
                </div>

                {/* Flechas de navegación */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={24} />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Indicadores de puntos */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentSlide 
                          ? 'bg-white' 
                          : 'bg-white/40 hover:bg-white/60'
                      }`}
                      aria-label={`Ir a slide ${index + 1}`}
                    />
                  ))}
                </div>

              </div>
              
            </div>
            
          </div>
        </div>
      </section>

      {/* Sección Sobre Nosotros */}
      <section className="bg-wave-pattern bg-linear-to-br from-orange-50 via-amber-50 to-red-50 py-20">
        <div className="container-nikkei">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Lado Izquierdo - Imagen */}
            <div className="relative">
              
              {/* Container de la imagen */}
              <div className="relative overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-red-200/30">
                
                {/* Imagen principal */}
                <div className="relative h-96 lg:h-125">
                  <Image
                    src="/assets/sobre-nosotros.jpg"
                    alt="Comunidad Nikkei de Sinaloa"
                    fill
                    className="object-cover"
                  />
                  
                  {/* Overlay sutil */}
                  <div className="absolute inset-0 bg-red-900/10" />
                </div>

                {/* Texto overlay en la imagen */}
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-6">
                  <p className="text-white font-serif text-lg">
                    Nuestra comunidad Nikkei
                  </p>
                  <p className="text-white/80 font-sans text-sm">
                    Preservando tradiciones, creando futuro
                  </p>
                </div>

              </div>

              {/* Elementos decorativos */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-linear-to-br from-red-600 to-red-700 rounded-full opacity-20 blur-xl" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-linear-to-br from-orange-400 to-red-500 rounded-full opacity-15 blur-xl" />
              
            </div>

            {/* Lado Derecho - Contenido de texto */}
            <div className="space-y-8">
              
              {/* Títulos */}
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-serif text-red-800 leading-tight">
                  私たちについて
                </h2>
                <h3 className="text-2xl lg:text-3xl font-serif text-red-700">
                  Sobre Nosotros
                </h3>
              </div>

              {/* Línea decorativa */}
              <div className="w-20 h-1 bg-linear-to-r from-red-600 to-orange-400 rounded-full" />

              {/* Texto principal oficial */}
              <div className="space-y-6">
                <p className="text-lg text-gray-700 font-sans leading-relaxed">
                  Nos enfocamos en <strong className="text-red-800">preservar, difundir y vivir la cultura japonesa</strong> en nuestra comunidad. 
                </p>
                
                <p className="text-lg text-gray-700 font-sans leading-relaxed">
                  Promovemos actividades culturales, educativas y de integración que fortalecen la 
                  <strong className="text-red-800"> identidad nikkei</strong> y crean puentes de amistad entre 
                  <strong className="text-red-800">Japón, México y nuestra sociedad</strong>.
                </p>
              </div>

              {/* Cards de valores/pilares */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4 bg-white/60 rounded-lg border-2 border-orange-300 shadow-sm">
                  <div className="text-2xl mb-2">🌸</div>
                  <h4 className="font-serif text-red-800 text-sm font-semibold">Preservar</h4>
                  <p className="text-xs text-gray-600 font-sans">Cultura japonesa</p>
                </div>
                
                <div className="text-center p-4 bg-white/60 rounded-lg border-2 border-orange-300 shadow-sm">
                  <div className="text-2xl mb-2">🤝</div>
                  <h4 className="font-serif text-red-800 text-sm font-semibold">Integrar</h4>
                  <p className="text-xs text-gray-600 font-sans">Comunidades</p>
                </div>
                
                <div className="text-center p-4 bg-white/60 rounded-lg border-2 border-orange-300 shadow-sm">
                  <div className="text-2xl mb-2">🏮</div>
                  <h4 className="font-serif text-red-800 text-sm font-semibold">Fortalecer</h4>
                  <p className="text-xs text-gray-600 font-sans">Identidad Nikkei</p>
                </div>
              </div>

              {/* Call to action secundario */}
              <div className="pt-4">
                <Button className="bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 font-sans font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Conoce Nuestra Historia
                </Button>
              </div>
              
            </div>
            
          </div>
        </div>
      </section>

      {/* Placeholder para siguientes secciones */}
      <section className="bg-wave-pattern bg-linear-to-br from-orange-50 via-amber-50 to-red-50 py-20">
        <div className="container-nikkei">
          <p className="text-center text-gray-600 font-sans">
            ...
          </p>
        </div>
      </section>
    </div>
  )
}