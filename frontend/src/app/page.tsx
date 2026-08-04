'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ChevronLeft, ChevronRight, History, 
  Calendar, MapPin, Users, Ticket, ExternalLink,
  Mail, Phone, Instagram, Facebook, Youtube, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { galeriaService, type GaleriaItem } from '@/lib/galeriaService'
import SiteHeader from '@/components/SiteHeader'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface SliderItem {
  id_slider: number
  url_imagen: string
  titulo?: string
  descripcion?: string
  orden: number
  es_activo: boolean
}

interface Evento {
  id_evento: number
  titulo: string
  tipo_evento: string
  fecha_inicio: string
  ciudad?: string
  ubicacion?: string
  imagen_evento?: string
  capacidad_maxima?: number
  requiere_registro: boolean
}

interface Empresa {
  id_empresa: number
  nombre_empresa: string
  giro_comercial?: string
  logo_empresa?: string
  sitio_web?: string
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<SliderItem[]>([])
  const [sliderLoading, setSliderLoading] = useState(true)

  const [eventosProximos, setEventosProximos] = useState<Evento[]>([])
  const [eventosLoading, setEventosLoading] = useState(true)

  const [empresasDestacadas, setEmpresasDestacadas] = useState<Empresa[]>([])
  const [empresasLoading, setEmpresasLoading] = useState(true)

  const [hitosDestacados, setHitosDestacados] = useState<GaleriaItem[]>([])
  const [galeriaLoading, setGaleriaLoading] = useState(true)
  const [galeriaError, setGaleriaError] = useState(false)

  const [hoveredEmpresa, setHoveredEmpresa] = useState<number | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/api/v1/slider`)
      .then((r) => r.json())
      .then((d) => setSlides(d.data || []))
      .catch(console.error)
      .finally(() => setSliderLoading(false))
  }, [])

  useEffect(() => {
    fetch(`${API_URL}/api/v1/eventos/proximos`)
      .then((r) => r.json())
      .then((d) => setEventosProximos(d.data || []))
      .catch(console.error)
      .finally(() => setEventosLoading(false))
  }, [])

  useEffect(() => {
    fetch(`${API_URL}/api/v1/empresas/homepage`)
      .then((r) => r.json())
      .then((d) => setEmpresasDestacadas(d.data || []))
      .catch(console.error)
      .finally(() => setEmpresasLoading(false))
  }, [])

  useEffect(() => {
    const loadGaleria = async () => {
      try {
        setGaleriaLoading(true)
        const data = await galeriaService.getDestacados()
        setHitosDestacados(data.slice(0, 3))
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
    if (slides.length === 0) return
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 3000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <SiteHeader variant="home" />

      {/* Hero */}
      <section className="hero-section relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #8B2635 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 hidden lg:block" style={{ background: 'linear-gradient(135deg, transparent 40%, #D4AF37 40%, #D4AF37 41%, transparent 41%)' }} />

        <div className="relative z-10 container-nikkei py-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-5xl lg:text-7xl font-serif text-gray-900 leading-[1.1] tracking-tight">
                  時を超えて<br/>
                  <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(139,38,53,1)' }}>続く絆を</span><br/>
                  築く
                </h2>
                <div className="w-16 h-0.5 bg-linear-to-r from-nikkei-burgundy to-transparent rounded-full" />
                <p className="text-xl lg:text-2xl text-nikkei-burgundy/80 font-serif italic">Creando vínculos que perduran con el tiempo</p>
              </div>
              <p className="text-lg text-gray-600 font-sans leading-relaxed max-w-md">Únete a nuestra comunidad y forma parte de la historia que conecta las tradiciones japonesas con el corazón de Sinaloa.</p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/register">
                  <Button className="btn-nikkei group">Únete a la Comunidad<ArrowRight size={18} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" /></Button>
                </Link>
              </div>
              <div className="flex gap-8 pt-4 border-t border-nikkei-burgundy/20">
                <blockquote className="pl-5 border-l-4 border-amber-400">
                  <p className="text-base text-gray-600 font-sans leading-relaxed italic">
                    &ldquo;Lo más importante es compartir la cultura, las tradiciones y los valores.&rdquo;
                  </p>
                  <footer className="mt-2 text-sm font-sans text-red-700 font-semibold not-italic">
                    — Juan Manuel Kuroda, Presidente de la Asociación
                  </footer>
                </blockquote>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -right-4 w-full h-full border border-amber-400/20 rounded-2xl hidden lg:block" />
              <div className="absolute -top-2 -right-2 w-full h-full border border-amber-400/10 rounded-2xl hidden lg:block" />
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <div className="relative h-105 lg:h-130">
                  {sliderLoading ? (
                    <div className="absolute inset-0 bg-white/5 animate-pulse" />
                  ) : slides.length === 0 ? (
                    <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
                      <p className="text-white/30 font-sans text-sm">Sin imágenes disponibles</p>
                    </div>
                  ) : (
                    slides.map((slide, index) => (
                      <div key={slide.id_slider} className={`absolute inset-0 transition-all duration-700 ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
                        <Image src={slide.url_imagen} alt={slide.titulo || `Slide ${index + 1}`} fill className="object-cover" priority={index === 0} />
                        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
                      </div>
                    ))
                  )}
                </div>
                {slides.length > 1 && (
                  <>
                    <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-nikkei-burgundy/20 hover:bg-nikkei-burgundy/50 text-nikkei-burgundy hover:text-white rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 flex items-center justify-center border border-nikkei-burgundy/20"><ChevronLeft size={20} /></button>
                    <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-nikkei-burgundy/20 hover:bg-nikkei-burgundy/50 text-nikkei-burgundy hover:text-white rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 flex items-center justify-center border border-nikkei-burgundy/20"><ChevronRight size={20} /></button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {slides.map((_, index) => (
                        <button key={index} onClick={() => setCurrentSlide(index)} className={`transition-all duration-300 rounded-full ${index === currentSlide ? 'w-6 h-2 bg-nikkei-burgundy' : 'w-2 h-2 bg-nikkei-burgundy/30 hover:bg-nikkei-burgundy/60'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl px-5 py-3 hidden lg:flex items-center gap-3 border border-amber-100">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-lg">📢</div>
                <div>
                  <p className="text-gray-500 font-sans">Próximo evento</p>
                  <p className="text-base font-serif text-red-800 font-semibold">{eventosProximos[0]?.titulo || 'Próximamente'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 30 L1440 60 Z" fill="rgb(253,244,236)" fillOpacity="0.6"/>
          </svg>
        </div>
      </section>

      {/* Sobre nosotros */}
      <section id="sobre-nosotros" className="bg-wave-pattern bg-linear-to-br from-orange-50 via-amber-50 to-red-50 py-20">
        <div className="container-nikkei text-center md:text-left">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-red-200/30">
                <div className="relative h-96 lg:h-125">
                  <Image src="https://res.cloudinary.com/dyfkeoc7a/image/upload/v1773449971/sobre-nosotros_ocm7cn.jpg" alt="Comunidad Nikkei de Sinaloa" fill className="object-cover" />
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
              <p className="text-lg text-gray-700 font-sans leading-relaxed">Nos enfocamos en <strong className="text-red-800">preservar, difundir y vivir la cultura japonesa</strong> en nuestra comunidad. Promovemos actividades culturales, educativas y de integración que fortalecen la <strong className="text-red-800">identidad Nikkei</strong> y crean puentes de amistad entre <strong className="text-red-800">Japón, México y nuestra sociedad</strong>.</p>

              {/* Citas */}
              <div className="space-y-4 pt-2">
                <blockquote className="pl-5 border-l-4 border-amber-400">
                  <p className="text-base text-gray-600 font-sans leading-relaxed italic">
                    &ldquo;Ahora tienen dos raíces: una de sangre, de Japón, y su vida, experiencia y amistad, de México.&rdquo;
                  </p>
                  <footer className="mt-2 text-sm font-sans text-red-700 font-semibold not-italic">
                    — Nayuta Tsugaoka, primera generación Nikkei
                  </footer>
                </blockquote>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-8">
                <div className="text-center p-2 sm:p-4 bg-white/60 rounded-lg border-2 border-orange-300 shadow-sm"><div className="text-xl sm:text-2xl mb-1 sm:mb-2">🌸</div><h4 className="font-serif text-red-800 text-sm sm:text-lg font-semibold">Preservar</h4><p className="text-xs sm:text-base text-gray-600 font-sans">Cultura</p></div>
                <div className="text-center p-2 sm:p-4 bg-white/60 rounded-lg border-2 border-orange-300 shadow-sm"><div className="text-xl sm:text-2xl mb-1 sm:mb-2">🤝</div><h4 className="font-serif text-red-800 text-sm sm:text-lg font-semibold">Integrar</h4><p className="text-xs sm:text-base text-gray-600 font-sans">Comunidad</p></div>
                <div className="text-center p-2 sm:p-4 bg-white/60 rounded-lg border-2 border-orange-300 shadow-sm"><div className="text-xl sm:text-2xl mb-1 sm:mb-2">🏮</div><h4 className="font-serif text-red-800 text-sm sm:text-lg font-semibold">Fortalecer</h4><p className="text-xs sm:text-base text-gray-600 font-sans">Identidad</p></div>
              </div>
              <div className="pt-4"><Link href="/sobre-nosotros"><Button className="btn-nikkei">Conoce a Nuestra Comunidad</Button></Link></div>
            </div>
          </div>
        </div>
      </section>

      {/* Eventos proximos */}
      <section id="eventos" className="eventos-section relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-asanoha-pattern opacity-100" />
        <div className="absolute inset-0 bg-linear-to-r from-red-900/10 via-transparent to-red-800/10" />
        <div className="container-nikkei relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 text-center md:text-left">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-serif text-nikkei-burgundy-dark">次回のイベント</h2>
              <h3 className="text-2xl font-serif text-nikkei-burgundy">Próximos Eventos</h3>
              <div className="w-20 h-1 bg-nikkei-burgundy rounded-full mx-auto md:mx-0" />
            </div>
            <Link href="/eventos">
              <Button className="btn-nikkei" style={{ background: 'linear-gradient(to right, #8B2635, #6B1D28)', color: '#ffffff' }}>Ver calendario completo</Button>
            </Link>
          </div>

          {eventosLoading ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {[1, 2].map((i) => <div key={i} className="bg-white/10 rounded-xl h-64 animate-pulse" />)}
            </div>
          ) : eventosProximos.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 font-sans">No hay eventos próximos programados.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {eventosProximos.map((evento) => (
                <div key={evento.id_evento} className="flex flex-col md:flex-row bg-white rounded-xl overflow-hidden shadow-2xl group text-left">
                  <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden bg-gray-100">
                    {evento.imagen_evento ? (
                      <Image src={evento.imagen_evento} alt={evento.titulo} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-red-900/10">
                        <Calendar size={40} className="text-red-300" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`event-badge text-white shadow-lg ${evento.tipo_evento === 'matsuri' ? 'bg-red-600' : 'bg-nikkei-gold-dark'}`}>{evento.tipo_evento}</span>
                    </div>
                  </div>
                  <div className="p-8 md:w-3/5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center text-nikkei-burgundy gap-2 text-lg font-semibold">
                        <Calendar size={16} />
                        {new Date(evento.fecha_inicio).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                      <h4 className="text-2xl font-serif text-gray-900 leading-tight">{evento.titulo}</h4>
                      {(evento.ubicacion || evento.ciudad) && (
                        <div className="flex items-center gap-2 text-base text-gray-600">
                          <MapPin size={16} className="text-nikkei-gold-dark" />
                          {[evento.ubicacion, evento.ciudad].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="mt-8">
                      {evento.requiere_registro ? (
                        <Link href={`/eventos?registro=${evento.id_evento}`}>
                          <Button className="w-full btn-nikkei py-3 text-base"><Ticket size={18} />Registrarme ahora</Button>
                        </Link>
                      ) : (
                        <Link href="/eventos">
                          <Button className="w-full py-3 border border-nikkei-burgundy text-nikkei-burgundy hover:bg-nikkei-burgundy hover:text-white cursor-pointer font-sans font-semibold rounded-lg transition-all duration-300 text-base flex items-center gap-2">
                            <ArrowRight size={18} />Ver detalles
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Impulso Nikkei */}
      <section id="directorio" className="py-20 relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at top, #FEF7F0 0%, #FCE4E4 60%, #FEF0E0 100%)' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-[20rem] font-serif text-red-900/2.5 leading-none">商</span>
        </div>
        <div className="container-nikkei relative z-10">
          <div className="text-center mb-16 space-y-3">
            <p className="text-base tracking-[0.3em] uppercase font-sans text-amber-700/70">Directorio Empresarial</p>
            <h2 className="text-3xl lg:text-4xl font-serif text-nikkei-burgundy-dark">日系ビジネスの推進</h2>
            <h3 className="text-2xl font-serif text-nikkei-burgundy">Impulso Nikkei</h3>
            <div className="w-12 h-0.5 bg-nikkei-gold mx-auto rounded-full" />
            <p className="text-gray-500 font-serif font-semibold max-w-md mx-auto text-base leading-relaxed">Apoya y descubre los emprendimientos de nuestra comunidad japonesa en Sinaloa.</p>
          </div>

          {empresasLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
              {[1,2,3,4,5].map((i) => <div key={i} className="bg-white/50 rounded-2xl aspect-square animate-pulse" />)}
            </div>
          ) : empresasDestacadas.length === 0 ? (
            <div className="text-center py-12 mb-12"><p className="text-gray-400 font-sans text-sm">No hay empresas destacadas disponibles.</p></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
              {empresasDestacadas.map((empresa) => (
                <a key={empresa.id_empresa} href={`/directorio?empresa=${empresa.id_empresa}`}
                  onMouseEnter={() => setHoveredEmpresa(empresa.id_empresa)} onMouseLeave={() => setHoveredEmpresa(null)}
                  className="group relative flex flex-col items-center rounded-2xl overflow-hidden border-2 border-transparent hover:border-amber-300 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-white/70 backdrop-blur-sm">
                  <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                    {empresa.logo_empresa ? (
                      <>
                        <Image src={empresa.logo_empresa} alt={empresa.nombre_empresa} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-linear-to-t from-nikkei-burgundy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                        <div className="absolute inset-0 flex flex-col items-center justify-end p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                          <ExternalLink size={20} className="text-white/80 mb-1" />
                          <p className="text-white text-sm font-sans">Ver empresa</p>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-red-50">
                        <span className="text-4xl font-serif text-red-300">{empresa.nombre_empresa.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 text-center w-full">
                    <p className="font-serif text-nikkei-burgundy text-base font-semibold leading-tight line-clamp-2">{empresa.nombre_empresa}</p>
                    {empresa.giro_comercial && <p className="text-sm text-amber-700 font-serif mt-0.5">{empresa.giro_comercial}</p>}
                  </div>
                </a>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/directorio"><Button className="btn-nikkei"><Users size={18} />Explorar Directorio Completo</Button></Link>
            <Link href="/register">
              <button className="px-8 py-3 border-2 border-nikkei-burgundy text-nikkei-burgundy hover:bg-nikkei-burgundy hover:text-white cursor-pointer font-sans font-semibold rounded-lg transition-all duration-300 text-sm flex items-center gap-2">
                <span>+</span> Registra tu Empresa
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Nuestras raices */}
      <section id="galeria" className="bg-wave-pattern bg-linear-to-tr from-red-50 via-amber-50 to-orange-50 py-20 relative overflow-hidden">
        <div className="container-nikkei relative z-10 text-center">
          <div className="mb-12 space-y-4">
            <h2 className="text-3xl lg:text-4xl font-serif text-nikkei-burgundy">私たちのルーツ</h2>
            <h3 className="text-2xl font-serif text-nikkei-burgundy-light">Nuestras Raíces</h3>
            <div className="w-16 h-1 bg-nikkei-gold mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {galeriaLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="group relative h-85 overflow-hidden rounded-xl shadow-xl border-2 border-white/50">
                  <div className="animate-pulse bg-gray-200 h-full w-full" />
                </div>
              ))
            ) : galeriaError ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-lg mb-4">No se pudieron cargar los datos históricos</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="text-nikkei-burgundy border-nikkei-burgundy">Intentar de nuevo</Button>
              </div>
            ) : hitosDestacados.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500"><p>No hay elementos destacados disponibles</p></div>
            ) : (
              hitosDestacados.map((hito) => (
                <div key={hito.id_galeria} className="group relative h-85 overflow-hidden rounded-xl shadow-xl border-2 border-white/50">
                  <Image src={hito.url_imagen} alt={hito.titulo} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-linear-to-t from-nikkei-burgundy/90 via-nikkei-burgundy/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-nikkei-gold font-serif text-sm mb-2">{galeriaService.getAnio(hito)}</span>
                    <h4 className="text-white text-xl font-serif mb-2">{hito.titulo}</h4>
                    <p className="text-white/80 text-sm font-sans opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{galeriaService.getCategoriaDisplay(hito.categoria)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-12">
            <Link href="/historia"><Button className="btn-nikkei"><History size={20} />Explorar Archivo Histórico</Button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden text-center md:text-left" style={{ backgroundColor: 'var(--color-nikkei-burgundy)' }}>
        <div className="w-full h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent opacity-100" />
        <div className="absolute bottom-0 right-0 pointer-events-none select-none overflow-hidden">
          <span className="text-[18rem] font-serif text-white/3 leading-none">根</span>
        </div>
        <div className="container-nikkei relative z-10 text-white pt-16 pb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-5">
            <div className="space-y-5">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Image src="/assets/Logo-Nikkei.png" alt="Logo OJN" width={44} height={44} className='pt-2'/>
                <div>
                  <h4 className="font-serif text-base leading-tight pt-2 text-white">Nikkei Culiacán AC</h4>
                  <p className="text-xs text-amber-300/80 font-sans">Culiacán, Sinaloa</p>
                </div>
              </div>
              <p className="text-white/50 text-sm font-sans leading-relaxed max-w-xs mx-auto md:mx-0">Preservando el legado de nuestros antepasados y construyendo el futuro de nuestra comunidad.</p>
              <div className="flex justify-center md:justify-start gap-3">
                {[{ href: 'https://www.facebook.com/nikkeiculiacan/', icon: <Facebook size={16} />, label: 'Facebook' }, { href: 'https://www.instagram.com/nikkeiculiacan/', icon: <Instagram size={16} />, label: 'Instagram' }].map((social) => (
                  <Link key={social.label} href={social.href} aria-label={social.label} className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-amber-400/60 hover:text-amber-300 hover:-translate-y-1 transition-all duration-300">{social.icon}</Link>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-serif text-amber-300 mb-5 pt-2 text-sm tracking-wide uppercase">Navegación</h5>
              <ul className="space-y-2.5">
                {[{ href: '#sobre-nosotros', label: 'Sobre Nosotros' }, { href: '#galeria', label: 'Archivo Histórico' }, { href: '#eventos', label: 'Calendario de Eventos' }, { href: '#directorio', label: 'Directorio Comercial' }, { href: '/register', label: 'Únete a la Comunidad' }].map((link) => (
                  <li key={link.label}><Link href={link.href} className="text-sm text-white/55 hover:text-amber-300 hover:pl-1.5 transition-all duration-200 font-sans inline-block">{link.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-serif text-amber-300 mb-5 pt-2 text-sm tracking-wide uppercase">Contacto</h5>
              <ul className="space-y-4">
                {[{ icon: <MapPin size={15} className="text-amber-400 shrink-0 mt-0.5" />, text: 'Culiacán, Sinaloa, México' }, { icon: <Phone size={15} className="text-amber-400 shrink-0" />, text: '+52 (667) 142-0914' }, { icon: <Mail size={15} className="text-amber-400 shrink-0" />, text: 'nikkeiculiacanadmin@gmail.com' }].map((item, i) => (
                  <li key={i} className="flex items-start justify-center md:justify-start gap-2.5 text-white/55 text-sm font-sans">{item.icon}<span>{item.text}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-serif text-amber-300 mb-5 pt-2 text-sm tracking-wide uppercase">Horarios</h5>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3 inline-block md:block mx-auto md:mx-0 text-left">
                <p className="text-[10px] text-white/35 font-sans font-bold uppercase tracking-widest">Horario de atención</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between gap-6"><span className="text-xs text-white/50 font-sans">Lun — Vie</span><span className="text-xs text-white/75 font-sans font-medium">9:00 — 17:00</span></div>
                  <div className="flex justify-between gap-6"><span className="text-xs text-white/50 font-sans">Sábado</span><span className="text-xs text-white/75 font-sans font-medium">10:00 — 13:00</span></div>
                  <div className="flex justify-between gap-6"><span className="text-xs text-white/50 font-sans">Domingo</span><span className="text-xs text-red-400/70 font-sans">Cerrado</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="h-px bg-linear-to-r from-transparent via-white/15 to-transparent mb-6" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-white/35 text-xs font-sans">
            <p>© Nikkei Culiacán AC. Todos los derechos reservados.</p>
            <p className="font-serif text-white/20 text-sm tracking-widest hidden md:block">根 · 絆 · 未来</p>
            <div className="flex gap-5">
              <Link href="#" className="hover:text-amber-300 transition-colors duration-200">Aviso de Privacidad</Link>
              <Link href="#" className="hover:text-amber-300 transition-colors duration-200">Términos de Uso</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}