'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-wave-pattern bg-linear-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/assets/logo-ojn.png"
                alt="Logo OJN"
                width={50}
                height={50}
                className="rounded-full shadow-md"
              />
              <div>
                <h1 className="text-xl font-serif text-red-800">
                  Asociación Nikkei de Sinaloa
                </h1>
                <p className="text-sm text-red-600/70 font-sans">
                  Preservando nuestra herencia cultural
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link href="/login">
                <Button 
                  variant="outline"
                  className="border-2 border-red-400 text-red-600 hover:bg-red-50 font-sans transition-all"
                >
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-sans shadow-lg hover:shadow-xl transition-all">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto mb-16">
            <div className="mb-8">
              <div className="h-24 w-24 rounded-full bg-white shadow-2xl border-4 border-amber-100 flex items-center justify-center mx-auto animate-fade-in">
                <Image
                  src="/assets/logo-ojn.png"
                  alt="Logo OJN"
                  width={70}
                  height={70}
                  className="rounded-full"
                />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif text-red-800 mb-6 animate-fade-in-up">
              Registro Comunitario 
              <span className="text-orange-500">Nikkei</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-red-700 mb-8 max-w-3xl mx-auto font-sans leading-relaxed">
              Conectando generaciones y preservando la herencia de la comunidad japonesa en Sinaloa
            </p>
            
            <div className="mx-auto h-1 w-32 rounded-full bg-linear-to-r from-red-600 via-orange-400 to-amber-400 mb-10" />
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/register">
                <Button className="w-full sm:w-auto bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-4 text-lg font-sans shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  Únete Ahora 🌸
                </Button>
              </Link>
              <Button 
                variant="outline"
                className="w-full sm:w-auto border-2 border-red-400 text-red-600 hover:bg-red-50 px-10 py-4 text-lg font-sans transition-all"
                onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Descubre Más
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">👥</div>
                <div className="text-3xl font-serif text-red-800 mb-2">500+</div>
                <p className="text-red-600 font-sans font-medium">Familias Registradas</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🏮</div>
                <div className="text-3xl font-serif text-red-800 mb-2">75+</div>
                <p className="text-red-600 font-sans font-medium">Años de Historia</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🎌</div>
                <div className="text-3xl font-serif text-red-800 mb-2">12</div>
                <p className="text-red-600 font-sans font-medium">Eventos Anuales</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif text-red-800 mb-6">
                Nuestra Misión
              </h2>
              <div className="w-24 h-1 bg-linear-to-r from-orange-400 to-amber-400 mx-auto rounded-full mb-8"></div>
            </div>
            
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-12">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <p className="text-lg text-gray-800 font-sans leading-relaxed">
                      La Asociación Nikkei de Sinaloa fortalece los lazos entre las 
                      generaciones de descendientes japoneses en nuestra región desde 1950.
                    </p>
                    <p className="text-lg text-gray-800 font-sans leading-relaxed">
                      Nuestro Registro Comunitario conecta familias y preserva nuestra 
                      valiosa historia cultural para las futuras generaciones.
                    </p>
                    
                    <div className="bg-linear-to-r from-orange-50 to-amber-50 p-6 rounded-lg border-l-4 border-orange-400">
                      <p className="font-semibold text-red-800 mb-3 font-serif text-lg">
                        Generaciones Nikkei:
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {['Issei', 'Nisei', 'Sansei', 'Yonsei', 'Gosei'].map((gen) => (
                          <span key={gen} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium font-sans">
                            {gen}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-linear-to-r from-red-500 to-red-600 p-6 rounded-xl text-white text-center shadow-lg">
                      <div className="text-3xl mb-3">🌸</div>
                      <h3 className="font-serif text-lg mb-2">Preservar</h3>
                      <p className="text-sm opacity-90 font-sans">Historia y tradiciones</p>
                    </div>
                    
                    <div className="bg-linear-to-r from-orange-400 to-orange-500 p-6 rounded-xl text-white text-center shadow-lg">
                      <div className="text-3xl mb-3">🤝</div>
                      <h3 className="font-serif text-lg mb-2">Conectar</h3>
                      <p className="text-sm opacity-90 font-sans">Familias y comunidad</p>
                    </div>
                    
                    <div className="bg-linear-to-r from-amber-400 to-amber-500 p-6 rounded-xl text-white text-center shadow-lg">
                      <div className="text-3xl mb-3">📖</div>
                      <h3 className="font-serif text-lg mb-2">Compartir</h3>
                      <p className="text-sm opacity-90 font-sans">Conocimiento y cultura</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-red-800 mb-6">
              Servicios Comunitarios
            </h2>
            <p className="text-xl text-red-700 font-sans max-w-2xl mx-auto">
              Herramientas digitales para preservar y compartir nuestra herencia
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-linear-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">👨‍👩‍👧‍👦</span>
                </div>
                <h3 className="text-xl font-serif text-red-800 mb-4">
                  Registro Genealógico
                </h3>
                <p className="text-gray-700 font-sans mb-6 leading-relaxed">
                  Documenta tu historia familiar y construye tu árbol genealógico digital.
                </p>
                <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium font-sans">
                  Próximamente
                </span>
              </CardContent>
            </Card>
            
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-linear-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🎌</span>
                </div>
                <h3 className="text-xl font-serif text-red-800 mb-4">
                  Eventos Culturales
                </h3>
                <p className="text-gray-700 font-sans mb-6 leading-relaxed">
                  Matsuri, ceremonias tradicionales y reuniones comunitarias.
                </p>
                <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium font-sans">
                  Próximamente
                </span>
              </CardContent>
            </Card>
            
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-linear-to-r from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🏢</span>
                </div>
                <h3 className="text-xl font-serif text-red-800 mb-4">
                  Directorio Empresarial
                </h3>
                <p className="text-gray-700 font-sans mb-6 leading-relaxed">
                  Red de negocios y emprendedores de la comunidad Nikkei.
                </p>
                <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium font-sans">
                  Próximamente
                </span>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-red-600 via-red-700 to-red-800">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Forma Parte de Nuestra Historia
            </h2>
            <p className="text-xl text-white/90 font-sans mb-12 leading-relaxed max-w-2xl mx-auto">
              Únete al registro comunitario y ayúdanos a preservar la herencia Nikkei en Sinaloa para las futuras generaciones
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/register">
                <Button className="w-full sm:w-auto bg-white text-red-700 hover:bg-gray-100 px-10 py-4 text-lg font-sans shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  Registrarse Ahora
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-red-700 px-10 py-4 text-lg font-sans transition-all duration-300"
                >
                  Ya Tengo Cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-sm border-t border-orange-200">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <Image
                  src="/assets/logo-ojn.png"
                  alt="Logo OJN"
                  width={50}
                  height={50}
                  className="rounded-full shadow-md"
                />
                <div>
                  <h3 className="text-xl font-serif text-red-800">
                    Asociación Nikkei de Sinaloa
                  </h3>
                  <p className="text-sm text-red-600/70 font-sans">
                    Preservando nuestra herencia cultural
                  </p>
                </div>
              </div>
              <p className="text-gray-700 font-sans leading-relaxed mb-4">
                Fortaleciendo los lazos entre las generaciones de descendientes 
                japoneses en Sinaloa desde 1950.
              </p>
              <div className="w-20 h-1 bg-linear-to-r from-red-400 to-orange-400 rounded-full"></div>
            </div>
            
            <div>
              <h4 className="text-lg font-serif text-red-800 mb-4">Contacto</h4>
              <div className="space-y-3 text-gray-700 font-sans">
                <p className="flex items-center gap-2">
                  <span>📧</span> info@nikkei-sinaloa.org
                </p>
                <p className="flex items-center gap-2">
                  <span>📱</span> +52 667 123 4567
                </p>
                <p className="flex items-center gap-2">
                  <span>📍</span> Culiacán, Sinaloa
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-serif text-red-800 mb-4">Síguenos</h4>
              <div className="space-y-3 text-gray-700 font-sans">
                <p className="flex items-center gap-2 hover:text-red-600 cursor-pointer transition-colors">
                  <span>📘</span> Facebook
                </p>
                <p className="flex items-center gap-2 hover:text-red-600 cursor-pointer transition-colors">
                  <span>📸</span> Instagram
                </p>
                <p className="flex items-center gap-2 hover:text-red-600 cursor-pointer transition-colors">
                  <span>🐦</span> Twitter
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-12 pt-8 text-center">
            <p className="text-gray-600 font-sans mb-2">
              © 2026 Asociación Nikkei de Sinaloa. Todos los derechos reservados.
            </p>
            <p className="text-sm text-gray-500 font-sans">
              Desarrollado con 🌸 para preservar nuestra herencia cultural
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}