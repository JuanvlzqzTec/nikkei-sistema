'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  LogIn, UserPlus, ChevronLeft, ChevronRight, History, 
  Calendar, MapPin, Users, Ticket, ExternalLink,
  Mail, Phone, Instagram, Facebook, Youtube
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { galeriaService, type GaleriaItem } from '@/lib/galeriaService'

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [hitosDestacados, setHitosDestacados] = useState<GaleriaItem[]>([])
  const [galeriaLoading, setGaleriaLoading] = useState(true)
  const [galeriaError, setGaleriaError] = useState(false)
  
  const slides = ['/assets/slider/slide-1.jpg', '/assets/slider/slide-2.jpg', '/assets/slider/slide-3.jpg']

  const empresasDestacadas = [
    { id: 1, nombre: "Restaurante Tanaka", giro: "Gastronomía", logo: "/assets/slider/slide-1.jpg", web: "#", size: "w-32 h-32", delay: "0s" },
    { id: 2, nombre: "Sato Importaciones", giro: "Comercio", logo: "/assets/slider/slide-2.jpg", web: "#", size: "w-40 h-40", delay: "0.5s" },
    { id: 3, nombre: "Kenji Tech", giro: "Tecnología", logo: "/assets/slider/slide-3.jpg", web: "#", size: "w-28 h-28", delay: "1s" },
    { id: 4, nombre: "Vivero Yamamoto", giro: "Jardinería", logo: "/assets/slider/slide-1.jpg", web: "#", size: "w-36 h-36", delay: "1.5s" },
    { id: 5, nombre: "Sushi Sinaloa", giro: "Gastronomía", logo: "/assets/slider/slide-2.jpg", web: "#", size: "w-32 h-32", delay: "0.2s" },
  ]

  const eventosProximos = [
    { id_evento: 1, titulo: "Gran Matsuri 2026", tipo_evento: "matsuri", fecha_inicio: "2026-05-15T18:00:00Z", ciudad: "Culiacán", ubicacion: "Jardín Botánico", imagen_evento: "/assets/slider/slide-1.jpg", capacidad_maxima: 500, participantes_actuales: 342 },
    { id_evento: 2, titulo: "Torneo Deportivo", tipo_evento: "deportivo", fecha_inicio: "2026-06-10T09:00:00Z", ciudad: "Mazatlán", ubicacion: "Club Muralla", imagen_evento: "/assets/slider/slide-2.jpg", capacidad_maxima: 100, participantes_actuales: 45 }
  ]

  // Load galería data
  useEffect(() => {
    const loadGaleria = async () => {
      try {
        setGaleriaLoading(true)
        const data = await galeriaService.getDestacados()
        setHitosDestacados(data.slice(0, 3)) // Only first 3 for this section
        setGaleriaError(false)
      } catch (error) {
        console.error('Failed to load galería:', error)
        setGaleriaError(true)
      } finally {
        setGaleriaLoading(false)
      }
    }

    loadGaleria()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 3000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="header-container shadow-sm">
        <div className="w-full px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image src="/assets/Logo-OJN.png" alt="Logo OJN" width={50} height={50} className="rounded-full" priority />
              <div>
                <h1 className="header-logo-text-main">シナロア日系青年協会</h1>
                <p className="header-logo-text-sub">Asociación de Jóvenes Nikkei, Sinaloa</p>
              </div>
            </div>
            <div className="header-buttons-container">
              <div className="header-buttons-top" style={{ padding: '0.1px 0.5px' }}>
                <Link href="/register"><Button variant="ghost" className="header-auth-button group"><UserPlus size={18} className="text-nikkei-burgundy" /><span>Registrarse</span></Button></Link>
                <Link href="/login"><Button variant="ghost" className="header-auth-button group"><LogIn size={18} className="text-nikkei-burgundy" /><span>Iniciar Sesión</span></Button></Link>
              </div>
              <div className="flex items-center justify-end mt-1 gap-2">
                <button className="header-nav-button">Sobre Nosotros</button>
                <button className="header-nav-button">Eventos</button>
                <button className="header-nav-button">Directorio Comercial</button>
                <button className="header-nav-button">Galería Histórica</button>
                <button className="header-nav-button">Contacto</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundColor: 'var(--color-nikkei-burgundy)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='84' height='48' viewBox='0 0 84 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m0 12c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12zm84 0c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-84 24c0 6.627 5.373 12 12 12s12-5.373 12-12-5.373-12-12-12-12 5.373-12 12zm84 0c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12z' fill='%23ffffff' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E"), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M30 0h1v30h-1z'/%3E%3Cpath d='M0 29h30v1H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="absolute inset-0 bg-linear-to-r from-red-900/10 via-transparent to-red-800/10" />
        <div className="relative z-10 container-nikkei py-20 text-center md:text-left">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-150">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-6xl font-serif text-white leading-tight">時を超えて続く絆を築く</h2>
                <p className="text-xl lg:text-2xl text-white/90 font-serif">Creando vínculos que perduran con el tiempo</p>
              </div>
              <div className="w-24 h-1 bg-linear-to-r from-amber-400 to-yellow-300 rounded-full mx-auto md:mx-0" />
              <p className="text-lg text-white/80 font-sans leading-relaxed max-w-lg mx-auto md:mx-0">Únete a nuestra comunidad y forma parte de la historia que conecta las tradiciones japonesas con el corazón de Sinaloa.</p>
              <div className="pt-4"><Link href="/register"><Button className="btn-nikkei">Únete a Nuestra Comunidad</Button></Link></div>
            </div>
            <div className="relative">
              <div className="relative overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="relative h-96 lg:h-125 text-center">
                  {slides.map((slide, index) => (
                    <div key={index} className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                      <Image src={slide} alt={`Slide ${index + 1}`} fill className="object-cover" priority={index === 0} />
                    </div>
                  ))}
                </div>
                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"><ChevronLeft size={24} /></button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"><ChevronRight size={24} /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre Nosotros */}
      <section className="bg-wave-pattern bg-linear-to-br from-orange-50 via-amber-50 to-red-50 py-20">
        <div className="container-nikkei text-center md:text-left">
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
              <div className="w-20 h-1 bg-linear-to-r from-red-600 to-orange-400 rounded-full mx-auto md:mx-0" />
              <p className="text-lg text-gray-700 font-sans leading-relaxed">Nos enfocamos en <strong className="text-red-800">preservar, difundir y vivir la cultura japonesa</strong> en nuestra comunidad.</p>
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4 bg-white/60 rounded-lg border-2 border-orange-300 shadow-sm"><div className="text-2xl mb-2">🌸</div><h4 className="font-serif text-red-800 text-sm font-semibold">Preservar</h4><p className="text-xs text-gray-600 font-sans">Cultura</p></div>
                <div className="text-center p-4 bg-white/60 rounded-lg border-2 border-orange-300 shadow-sm"><div className="text-2xl mb-2">🤝</div><h4 className="font-serif text-red-800 text-sm font-semibold">Integrar</h4><p className="text-xs text-gray-600 font-sans">Comunidad</p></div>
                <div className="text-center p-4 bg-white/60 rounded-lg border-2 border-orange-300 shadow-sm"><div className="text-2xl mb-2">🏮</div><h4 className="font-serif text-red-800 text-sm font-semibold">Fortalecer</h4><p className="text-xs text-gray-600 font-sans">Identidad</p></div>
              </div>
              <div className="pt-4"><Link href="/historia"><Button className="btn-nikkei">Conoce Nuestra Historia</Button></Link></div>
            </div>
          </div>
        </div>
      </section>

      {/* Eventos Próximos */}
      <section className="relative py-20 overflow-hidden" style={{ backgroundColor: 'var(--color-nikkei-burgundy)' }}>
        <div className="absolute inset-0 bg-asanoha-pattern opacity-100" />
        <div className="absolute inset-0 bg-linear-to-r from-red-900/10 via-transparent to-red-800/10" />
        <div className="container-nikkei relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 text-center md:text-left">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-serif text-white">次回のイベント</h2>
              <h3 className="text-2xl font-serif text-nikkei-gold">Próximos Eventos</h3>
              <div className="w-20 h-1 bg-nikkei-gold rounded-full mx-auto md:mx-0" />
            </div>
            <Link href="/eventos">
              <Button className="btn-nikkei" style={{ background: 'linear-gradient(to right, #D4AF37, #B8941F)', color: '#6B1D28' }}>
                Ver calendario completo
              </Button>
            </Link>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {eventosProximos.map((evento) => (
              <div key={evento.id_evento} className="flex flex-col md:flex-row bg-white rounded-xl overflow-hidden shadow-2xl group text-left">
                <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden"><Image src={evento.imagen_evento} alt={evento.titulo} fill className="object-cover transition-transform duration-500 group-hover:scale-110" /><div className="absolute top-4 left-4"><span className={`event-badge text-white shadow-lg ${evento.tipo_evento === 'matsuri' ? 'bg-red-600' : 'bg-nikkei-gold-dark'}`}>{evento.tipo_evento}</span></div></div>
                <div className="p-8 md:w-3/5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center text-nikkei-burgundy gap-2 text-sm font-semibold"><Calendar size={16} />{new Date(evento.fecha_inicio).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                    <h4 className="text-2xl font-serif text-gray-900 leading-tight">{evento.titulo}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin size={16} className="text-nikkei-gold-dark" />{evento.ubicacion}, {evento.ciudad}</div>
                  </div>
                  <div className="mt-8"><Link href={`/eventos/${evento.id_evento}`}><Button className="w-full btn-nikkei py-3 text-base"><Ticket size={18} />Registrarme ahora</Button></Link></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impulso Nikkei */}
      <section className="py-16 relative overflow-hidden" style={{ background: 'radial-gradient(circle at center, var(--color-nikkei-cream) 0%, #FCE4E4 100%)' }}>
        <div className="container-nikkei relative z-10 text-center">
          <div className="mb-8 space-y-4">
            <h2 className="text-3xl lg:text-4xl font-serif text-nikkei-burgundy-dark">日系ビジネスの推進</h2>
            <h3 className="text-2xl font-serif text-nikkei-burgundy">Impulso Nikkei</h3>
            <div className="w-16 h-1 bg-nikkei-gold mx-auto rounded-full" />
            <p className="text-gray-600 font-sans max-w-xl mx-auto italic">Apoya y descubre los emprendimientos de nuestra comunidad japonesa en Sinaloa.</p>
          </div>
          <div className="relative flex flex-wrap justify-center items-center gap-8 md:gap-16 min-h-75">
            {empresasDestacadas.map((empresa) => (
              <a key={empresa.id} href={empresa.web} target="_blank" rel="noopener noreferrer" className={`logo-bubble animate-float ${empresa.size} group`} style={{ animationDelay: empresa.delay }}>
                <Image src={empresa.logo} alt={empresa.nombre} fill className="object-cover p-0 transition-all duration-300" />
                <div className="absolute inset-0 bg-nikkei-burgundy/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 text-center">
                  <p className="text-white text-xs font-bold font-serif">{empresa.nombre}</p>
                  <p className="text-nikkei-gold text-[10px]">{empresa.giro}</p>
                  <ExternalLink size={12} className="text-white mt-1" />
                </div>
              </a>
            ))}
          </div>
          <div className="mt-10 flex flex-col md:flex-row justify-center items-center gap-6">
            <Link href="/directorio"><Button className="btn-nikkei bg-nikkei-burgundy-dark">Explorar Directorio Completo</Button></Link>
            <Link href="/register-business"><Button variant="outline" className="border-2 border-nikkei-burgundy text-nikkei-burgundy hover:bg-nikkei-burgundy hover:text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all">Registra tu Empresa</Button></Link>
          </div>
        </div>
      </section>

      {/* Nuestras Raíces - Connected to API */}
      <section className="bg-wave-pattern bg-linear-to-tr from-red-50 via-amber-50 to-orange-50 py-20 relative overflow-hidden">
        <div className="container-nikkei relative z-10 text-center">
          <div className="mb-12 space-y-4">
            <h2 className="text-3xl lg:text-4xl font-serif text-nikkei-burgundy">私たちのルーツ</h2>
            <h3 className="text-2xl font-serif text-nikkei-burgundy-light">Nuestras Raíces</h3>
            <div className="w-16 h-1 bg-nikkei-gold mx-auto rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {galeriaLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="group relative h-85 overflow-hidden rounded-xl shadow-xl border-2 border-white/50">
                  <div className="animate-pulse bg-gray-200 h-full w-full"></div>
                </div>
              ))
            ) : galeriaError ? (
              // Error state
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-lg mb-4">No se pudieron cargar los datos históricos</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="text-nikkei-burgundy border-nikkei-burgundy"
                >
                  Intentar de nuevo
                </Button>
              </div>
            ) : hitosDestacados.length === 0 ? (
              // Empty state
              <div className="col-span-full text-center py-12 text-gray-500">
                <p>No hay elementos destacados disponibles</p>
              </div>
            ) : (
              // Render galería data
              hitosDestacados.map((hito) => (
                <div key={hito.id_galeria} className="group relative h-85 overflow-hidden rounded-xl shadow-xl border-2 border-white/50">
                  <Image 
                    src={hito.url_imagen} 
                    alt={hito.titulo} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-nikkei-burgundy/90 via-nikkei-burgundy/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-nikkei-gold font-serif text-sm mb-2">
                      {galeriaService.getAnio(hito)}
                    </span>
                    <h4 className="text-white text-xl font-serif mb-2">{hito.titulo}</h4>
                    <p className="text-white/80 text-sm font-sans opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {galeriaService.getCategoriaDisplay(hito.categoria)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-12"><Link href="/historia"><Button className="btn-nikkei"><History size={20} />Explorar Archivo Histórico</Button></Link></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative pt-16 pb-8 overflow-hidden text-center md:text-left" style={{ backgroundColor: 'var(--color-nikkei-burgundy)' }}>
        <div className="container-nikkei relative z-10 text-white">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Image src="/assets/Logo-OJN.png" alt="Logo OJN" width={40} height={40} className="rounded-full bg-white p-0.5" />
                <h4 className="font-serif text-lg leading-tight">Asociación Nikkei<br/>Sinaloa</h4>
              </div>
              <p className="text-white/60 text-sm font-sans leading-relaxed italic mx-auto md:mx-0 max-w-xs">Preservando el legado de nuestros antepasados y construyendo el futuro de nuestra comunidad.</p>
              <div className="flex justify-center md:justify-start gap-4">
                <Link href="#" className="social-icon"><Facebook size={18} /></Link>
                <Link href="#" className="social-icon"><Instagram size={18} /></Link>
                <Link href="#" className="social-icon"><Youtube size={18} /></Link>
              </div>
            </div>
            <div>
              <h5 className="font-serif text-nikkei-gold mb-6 border-b border-white/10 pb-2 inline-block md:block mx-auto md:mx-0">Navegación</h5>
              <ul className="space-y-3">
                <li><Link href="#" className="footer-link text-sm">Sobre Nosotros</Link></li>
                <li><Link href="#" className="footer-link text-sm">Archivo Histórico</Link></li>
                <li><Link href="/eventos" className="footer-link text-sm">Calendario de Eventos</Link></li>
                <li><Link href="#" className="footer-link text-sm">Directorio Comercial</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-serif text-nikkei-gold mb-6 border-b border-white/10 pb-2 inline-block md:block mx-auto md:mx-0">Contacto</h5>
              <ul className="space-y-4">
                <li className="flex items-start justify-center md:justify-start gap-3 text-white/60 text-sm"><MapPin size={18} className="text-nikkei-gold shrink-0" /><span>Culiacán, Sinaloa, México</span></li>
                <li className="flex items-center justify-center md:justify-start gap-3 text-white/60 text-sm"><Phone size={18} className="text-nikkei-gold" /><span>+52 (667) 000-0000</span></li>
                <li className="flex items-center justify-center md:justify-start gap-3 text-white/60 text-sm"><Mail size={18} className="text-nikkei-gold" /><span>hola@nikkeisinaloa.org</span></li>
              </ul>
            </div>
            <div>
              <h5 className="font-serif text-nikkei-gold mb-6 border-b border-white/10 pb-2 inline-block md:block mx-auto md:mx-0">Horarios</h5>
              <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-2 inline-block md:block mx-auto md:mx-0">
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Atención en Oficina</p>
                <p className="text-sm text-white/80">Lun - Vie: 9:00 AM - 6:00 PM</p>
                <p className="text-sm text-white/80">Sáb: 10:00 AM - 2:00 PM</p>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-[10px]">
            <p>© 2026 Asociación de Jóvenes Nikkei Sinaloa. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-nikkei-gold">Aviso de Privacidad</Link>
              <Link href="#" className="hover:text-nikkei-gold">Términos</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}