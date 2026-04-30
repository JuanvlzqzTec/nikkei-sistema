'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SiteHeader from '@/components/SiteHeader'

const FOTOS_EVENTO = {
  hero: 'https://res.cloudinary.com/dyfkeoc7a/image/upload/v1777534752/FullSizeRender_edhmoo.jpg',

  bloque1: 'https://res.cloudinary.com/dyfkeoc7a/image/upload/v1777534169/IMG_5245_hfwydt.jpg',

  bloque2: 'https://res.cloudinary.com/dyfkeoc7a/image/upload/v1777534168/IMG_5244_moi1xb.jpg',

  bloque3: 'https://res.cloudinary.com/dyfkeoc7a/image/upload/v1777534169/IMG_5246_k1govb.jpg',

  bloque4: 'https://res.cloudinary.com/dyfkeoc7a/image/upload/v1777534203/IMG_5247_z6dkzc.webp',

  grid: [
    'https://res.cloudinary.com/dyfkeoc7a/image/upload/v1777535383/FullSizeRender_rco5ak.jpg', 
    'https://res.cloudinary.com/dyfkeoc7a/image/upload/v1777535384/FullSizeRender_ut70mp.jpg', 
    'https://res.cloudinary.com/dyfkeoc7a/image/upload/v1777535385/FA09E921-8EE1-4B88-8A4F-1F42E0BC695A_e3mick.jpg', 
    'https://res.cloudinary.com/dyfkeoc7a/image/upload/v1777535386/FullSizeRender_t56hye.jpg', 
    'https://res.cloudinary.com/dyfkeoc7a/image/upload/v1777535391/IMG_5542_nmzshn.jpg', 
    'https://res.cloudinary.com/dyfkeoc7a/image/upload/v1777535393/FullSizeRender_dtxqdi.jpg', 
  ],
}

const BLOQUES = [
  {
    foto: FOTOS_EVENTO.bloque1,
    fotoAlt: 'Familias Nikkei en el evento Kodomo no Hi 2026',
    cita: 'Ahora tienen dos raíces: una de sangre, de Japón, y su vida, experiencia y amistad, de México. Espero que respeten las dos raíces y hagan un árbol grande entre los dos países.',
    autor: 'Nayuta Tsugaoka',
    perfil: 'Primera generación · Integrante de Brisas de Okinawa',
    imagenDerecha: false,
  },
  {
    foto: FOTOS_EVENTO.bloque2,
    fotoAlt: 'Jóvenes Nikkei en el evento Kodomo no Hi 2026',
    cita: 'Ser Nikkei significa de dónde vengo y a dónde puedo llegar.',
    autor: 'Sebastián Shimizu',
    perfil: 'Cuarta generación (Yonsei) · Miembro de Jóvenes Nikkei',
    imagenDerecha: true,
  },
  {
    foto: FOTOS_EVENTO.bloque3,
    fotoAlt: 'Asistentes al evento Kodomo no Hi 2026',
    cita: 'Quiero que se sientan orgullosos de ser parte Nikkei, que tienen sangre japonesa y también de México. Somos humanos y seguimos reuniéndonos.',
    autor: 'Miyuki Nakamura',
    perfil: 'Primera generación · Integrante de Brisas de Okinawa',
    imagenDerecha: false,
  },
  {
    foto: FOTOS_EVENTO.bloque4,
    fotoAlt: 'Actividades del evento Kodomo no Hi 2026',
    cita: 'Nuestros principales valores son la honestidad, el trabajo y la resiliencia. Este pueblo tiene que seguir creciendo e involucrar más la cultura japonesa.',
    autor: 'Miguel Taniyama',
    perfil: 'Empresario Nikkei · Clan Taniyama',
    imagenDerecha: true,
  },
]

export default function SobreNosotrosPage() {
  return (
    <>
      <SiteHeader variant="page" />

      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)' }}>

        {/* Hero */}
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'radial-gradient(circle, #8B2635 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />

          <div className="relative z-10 container-nikkei pt-12 pb-16">
            <div className="space-y-4 pt-2 max-w-2xl">
              <h1 className="text-4xl lg:text-5xl font-serif text-gray-900 leading-tight">
                私たちについて
              </h1>
              <h2 className="text-2xl font-serif text-red-800">
                Sobre Nosotros
              </h2>
              <div className="w-16 h-0.5 bg-linear-to-r from-red-700 to-amber-400 rounded-full" />
              <p className="text-lg font-sans text-gray-600 leading-relaxed">
                Voces reales de nuestra comunidad. Personas de distintas generaciones
                que comparten lo que significa ser Nikkei en Sinaloa hoy.
              </p>
            </div>
          </div>
        </div>

        {/* Ola de transición */}
        <div className="relative -mb-1">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 10 L0 35 Q360 65 720 35 Q1080 5 1440 35 L1440 60 L0 60 Z" fill="white" />
          </svg>
        </div>

        {/* Contenido */}
        <div className="bg-white">
          <div className="container-nikkei pt-12 pb-20">

            {/* Texto oficial de la asociación */}
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              <p className="text-xl font-sans text-gray-700 leading-relaxed">
                La comunidad Nikkei de Sinaloa nació del encuentro entre dos culturas.
                Familias que cruzaron un océano y echaron raíces en tierra sinaloense,
                generación tras generación, sin perder{' '}
                <strong className="text-red-800">el orgullo de su origen japonés</strong>{' '}
                ni el amor por México.{' '}
                Hoy somos una comunidad viva, diversa y en crecimiento,
                unida por valores compartidos y por el deseo de{' '}
                <strong className="text-red-800">preservar lo que nos hace únicos</strong>.
              </p>
              <div className="w-12 h-0.5 bg-amber-400 mx-auto rounded-full" />
            </div>

            {/* Foto hero del evento */}
            {FOTOS_EVENTO.hero !== 'PENDIENTE_URL_CLOUDINARY' && (
              <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-xl mb-20">
                <Image
                  src={FOTOS_EVENTO.hero}
                  alt="Evento Kodomo no Hi 2026 — Asociación Nikkei de Sinaloa"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
              </div>
            )}

            {/* Bloques */}
            <div className="space-y-20">
              {BLOQUES.map((bloque, index) => (
                <div
                  key={index}
                  className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                    bloque.imagenDerecha ? 'lg:grid-flow-dense' : ''
                  }`}
                >
                  {/* Foto */}
                  <div className={bloque.imagenDerecha ? 'lg:col-start-2' : ''}>
                    {bloque.foto !== 'PENDIENTE_URL_CLOUDINARY' ? (
                      <div className="relative h-72 md:h-88 rounded-2xl overflow-hidden shadow-lg">
                        <Image
                          src={bloque.foto}
                          alt={bloque.fotoAlt}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-red-900/10" />
                      </div>
                    ) : (
                      /* Placeholder cuando no hay foto */
                      <div className="relative h-72 md:h-88 rounded-2xl overflow-hidden shadow-lg bg-linear-to-br from-amber-50 to-orange-100 flex items-center justify-center border-2 border-dashed border-amber-300">
                        <div className="text-center space-y-2 px-8">
                          <p className="font-serif text-5xl text-amber-300 select-none">写</p>
                          <p className="text-xs font-sans text-amber-500 uppercase tracking-wider">
                            Foto pendiente · Kodomo no Hi 2026
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cita */}
                  <div className={`space-y-5 ${bloque.imagenDerecha ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                    <Quote size={32} className="text-amber-400" />
                    <blockquote>
                      <p className="text-xl lg:text-2xl font-serif text-gray-800 leading-relaxed">
                        &ldquo;{bloque.cita}&rdquo;
                      </p>
                    </blockquote>
                    <div className="pl-4 border-l-4 border-red-700">
                      <p className="font-sans font-bold text-red-800">{bloque.autor}</p>
                      <p className="font-sans text-sm text-gray-500">{bloque.perfil}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cita de cierre */}
            {(() => {
              const FOTO_PRESIDENTE = 'https://res.cloudinary.com/dyfkeoc7a/image/upload/v1777536881/IMG_5249_zxuerd.jpg'
              return (
                <div className="mt-20 relative rounded-2xl overflow-hidden bg-linear-to-br from-red-900 to-red-800 text-white text-center px-8 py-16 md:py-20 space-y-8">
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                  />

                  <div className="relative z-10 space-y-8">
                    {/* Foto */}
                    <div className="flex justify-center">
                      <div className="relative w-35 h-35 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl">
                        <Image
                          src={FOTO_PRESIDENTE}
                          alt="Juan Manuel Kuroda — Presidente de la Asociación Nikkei"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Cita */}
                    <div className="space-y-4 max-w-xl mx-auto">
                      <Quote size={28} className="text-amber-400 mx-auto" />
                      <p className="text-2xl md:text-3xl font-serif leading-relaxed">
                        &ldquo;El valor favorito es la perseverancia. ¿Por qué? Porque el que persevera alcanza.&rdquo;
                      </p>
                    </div>

                    {/* Atribución */}
                    <div className="space-y-1">
                      <p className="font-sans font-bold text-amber-300 text-lg">Juan Manuel Kuroda</p>
                      <p className="font-sans text-base text-white/60">Presidente · Asociación Nikkei de Sinaloa</p>
                    </div>

                    <div className="w-12 h-0.5 bg-amber-400/50 mx-auto rounded-full" />
                  </div>
                </div>
              )
            })()}

            {/* Mosaico */}
            {FOTOS_EVENTO.grid.some((url) => url !== 'PENDIENTE_URL_CLOUDINARY') && (
              <div className="mt-20">
                <div className="text-center mb-10 space-y-3">
                  <h3 className="text-2xl font-serif text-red-800">Kodomo no Hi 2026</h3>
                  <p className="text-lg font-sans text-gray-500">
                    Momentos del Día del Niño Japonés en Culiacán
                  </p>
                  <div className="w-12 h-0.5 bg-amber-400 mx-auto rounded-full" />
                </div>

                <div className="columns-2 md:columns-3 gap-3 md:gap-4 space-y-3 md:space-y-4">
                  {FOTOS_EVENTO.grid
                    .filter((url) => url !== 'PENDIENTE_URL_CLOUDINARY')
                    .map((url, index) => (
                      <div
                        key={index}
                        className="relative break-inside-avoid overflow-hidden rounded-xl shadow-sm group"
                      >
                        <Image
                          src={url}
                          alt={`Kodomo no Hi 2026 — foto ${index + 1}`}
                          width={600}
                          height={900}
                          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* CTA Final */}
            <div className="mt-20 pt-12 border-t border-gray-100 text-center space-y-4">
              <p className="font-serif text-2xl text-gray-700">
                ¿Eres parte de la comunidad Nikkei de Sinaloa?
              </p>
              <p className="font-sans text-lg text-gray-400 max-w-md mx-auto">
                Únete al registro comunitario y forma parte de nuestra historia digital.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Link href="/register">
                  <Button className="btn-nikkei">
                    Registrarme <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link href="/directorio">
                  <button className="px-8 py-1 cursor-pointer border-2 border-red-800 text-red-800 hover:bg-red-800 hover:text-white font-sans font-semibold rounded-lg transition-all duration-300 text-base">
                    Ver directorio empresarial
                  </button>
                </Link>
              </div>
              <p className="font-serif text-4xl text-red-900/10 select-none mt-8">絆</p>
              <p className="text-xs font-sans text-gray-400 uppercase tracking-wider">
                Asociación Nikkei · Culiacán, Sinaloa
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}