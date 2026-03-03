'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LogIn, UserPlus, ChevronLeft, ChevronRight, History } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = [
    '/assets/slider/slide-1.jpg',
    '/assets/slider/slide-2.jpg',
    '/assets/slider/slide-3.jpg',
  ]

  // Datos temporales para la galería (se conectarán al modelo Galeria del backend)
  const hitosDestacados = [
    {
      id: 1,
      titulo: "Primeros Inmigrantes",
      categoria: "Inmigración",
      imagen: "/assets/slider/slide-1.jpg",
      anio: "19XX"
    },
    {
      id: 2,
      titulo: "Fundación Asociación",
      categoria: "Hito Histórico",
      imagen: "/assets/slider/slide-2.jpg",
      anio: "19XX"
    },
    {
      id: 3,
      titulo: "Primer Matsuri",
      categoria: "Cultura",
      imagen: "/assets/slider/slide-3.jpg",
      anio: "20XX"
    }
  ]

  // Auto-advance slider cada 3 segundos
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
      {/* Header */}
      <header className="header-container shadow-sm">
        <div className="w-full px-4">
          <div className="flex items-start justify-between">
            
            {/* Logo y Textos */}
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

            {/* Botones y Navegación */}
            <div className="header-buttons-container">
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

      {/* Sección Hero */}
      <section className="hero-section relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundColor: 'var(--color-nikkei-burgundy)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='84' height='48' viewBox='0 0 84 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m0 12c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12zm84 0c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-84 24c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12zm84 0c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12z' fill='%23ffffff' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M30 0h1v30h-1z'/%3E%3Cpath d='M0 29h30v1H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="absolute inset-0 bg-linear-to-r from-red-900/10 via-transparent to-red-800/10" />
        
        <div className="relative z-10 container-nikkei py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-150">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-6xl font-serif text-white leading-tight">時を超えて続く絆を築く</h2>
                <p className="text-xl lg:text-2xl text-white/90 font-serif">Creando vínculos que perduran con el tiempo</p>
              </div>

              <div className="w-24 h-1 bg-linear-to-r from-amber-400 to-yellow-300 rounded-full" />

              <p className="text-lg text-white/80 font-sans leading-relaxed max-w-lg">
                Únete a nuestra comunidad y forma parte de la historia que conecta 
                las tradiciones japonesas con el corazón de Sinaloa.
              </p>

              <div className="pt-4">
                <Link href="/register">
                  <Button className="btn-nikkei">
                    Únete a Nuestra Comunidad
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="relative h-96 lg:h-125">
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <Image src={slide} alt={`Slide ${index + 1}`} fill className="object-cover" priority={index === 0} />
                    </div>
                  ))}
                </div>

                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110">
                  <ChevronLeft size={24} />
                </button>

                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110">
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Sobre Nosotros */}
      <section className="bg-wave-pattern bg-linear-to-br from-orange-50 via-amber-50 to-red-50 py-20">
        <div className="container-nikkei">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-red-200/30">
                <div className="relative h-96 lg:h-125">
                  <Image src="/assets/sobre-nosotros.jpg" alt="Comunidad Nikkei de Sinaloa" fill className="object-cover" />
                  <div className="absolute inset-0 bg-red-900/10" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-6">
                  <p className="text-white font-serif text-lg">Nuestra comunidad Nikkei</p>
                  <p className="text-white/80 font-sans text-sm">Preservando tradiciones, creando futuro</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-serif text-red-800 leading-tight">私たちについて</h2>
                <h3 className="text-2xl lg:text-3xl font-serif text-red-700">Sobre Nosotros</h3>
              </div>

              <div className="w-20 h-1 bg-linear-to-r from-red-600 to-orange-400 rounded-full" />

              <div className="space-y-6">
                <p className="text-lg text-gray-700 font-sans leading-relaxed">
                  Nos enfocamos en <strong className="text-red-800">preservar, difundir y vivir la cultura japonesa</strong> en nuestra comunidad. 
                </p>
                <p className="text-lg text-gray-700 font-sans leading-relaxed">
                  Promovemos actividades culturales, educativas y de integración que fortalecen la 
                  <strong className="text-red-800"> identidad nikkei</strong> y crean puentes de amistad entre 
                  <strong className="text-red-800"> Japón, México y nuestra sociedad</strong>.
                </p>
              </div>

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

              <div className="pt-4">
                <Link href="/historia">
                  <Button className="btn-nikkei">
                    Conoce Nuestra Historia
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN: Nuestras Raíces (Galería Histórica) */}
      <section className="bg-wave-pattern bg-linear-to-tr from-red-50 via-amber-50 to-orange-50 py-24 relative overflow-hidden">
        <div className="container-nikkei relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl lg:text-4xl font-serif text-nikkei-burgundy">私たちのルーツ</h2>
            <h3 className="text-2xl font-serif text-nikkei-burgundy-light">Nuestras Raíces</h3>
            <div className="w-16 h-1 bg-nikkei-gold mx-auto rounded-full" />
            <p className="text-gray-600 font-sans italic">
              Un viaje a través de la memoria y la identidad de nuestra comunidad en Sinaloa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {hitosDestacados.map((hito) => (
              <div key={hito.id} className="group relative h-85 overflow-hidden rounded-xl shadow-xl border-2 border-white/50">
                <Image 
                  src={hito.imagen} 
                  alt={hito.titulo} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-nikkei-burgundy/90 via-nikkei-burgundy/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-nikkei-gold font-serif text-sm mb-2">{hito.anio}</span>
                  <h4 className="text-white text-xl font-serif mb-2">{hito.titulo}</h4>
                  <p className="text-white/80 text-sm font-sans opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {hito.categoria}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/historia">
              <Button className="btn-nikkei">
                <History size={20} />
                Explorar Archivo Histórico
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}