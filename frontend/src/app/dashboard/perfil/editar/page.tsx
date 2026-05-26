'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Loader2,
  User as UserIcon,
  Phone,
  Settings,
  Camera,
  Lock,
  Check,
  X,
  Clock,
} from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { perfilApi, type MiPerfilResponse } from '@/lib/perfilApi'

import FotoPerfil from './_FotoPerfil'
import SeccionContacto from './_SeccionContacto'
import SeccionPreferencias from './_SeccionPreferencias'
import SeccionDatosSensibles from './_SeccionDatosSensibles'

type SeccionAbierta = 'foto' | 'contacto' | 'preferencias' | 'sensibles' | null

export default function EditarPerfilPage() {
  const router = useRouter()
  const { isAuthenticated, user, checkAuth } = useAuthStore()

  const [perfil, setPerfil] = useState<MiPerfilResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [seccionAbierta, setSeccionAbierta] = useState<SeccionAbierta>(null)

  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await perfilApi.get()
      setPerfil(res.data)
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : 'No pudimos cargar tu perfil'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth()
    }
  }, [isAuthenticated, checkAuth])

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.registro_estado !== 'completado') {
        router.push('/dashboard')
        return
      }
      cargar()
    }
  }, [isAuthenticated, user, router, cargar])

  // Limpiar mensajes después de un rato
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 5000)
      return () => clearTimeout(t)
    }
  }, [success])

  const onGuardadoOk = (mensaje: string) => {
    setSuccess(mensaje)
    setError('')
    cargar()
  }

  const onCambioSensibleOk = () => {
    setSuccess('Tu solicitud de cambio fue enviada. Un administrador la revisará pronto.')
    setError('')
    checkAuth()
    setTimeout(() => router.push('/dashboard'), 2500)
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-red-700" />
      </div>
    )
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-red-700" />
          <p className="font-sans text-base text-gray-600">Cargando tu perfil...</p>
        </div>
      </div>
    )
  }

  if (!perfil) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background:
            'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)',
        }}
      >
        <div className="text-center space-y-4 max-w-md">
          <p className="font-serif text-xl text-red-800">
            No pudimos cargar tu perfil
          </p>
          {error && (
            <p className="font-sans text-base text-red-600">{error}</p>
          )}
          <button
            onClick={cargar}
            className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-sans font-semibold rounded-xl cursor-pointer"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)',
      }}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-red-800/15 shadow-sm sticky top-0 z-10 p-3">
        <div className="container-nikkei py-4 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/assets/Logo-Nikkei.png"
              alt="Asociación Nikkei"
              width={44}
              height={44}
              className="rounded-full"
              priority
            />
            <div className="hidden sm:block">
              <p className="font-serif text-red-800 text-base leading-tight">
                Mi información
              </p>
              <p className="font-sans text-xs text-red-600/70">
                Asociación Nikkei de Sinaloa
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-base font-sans text-red-700 hover:text-red-900 font-semibold cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Volver al dashboard</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </div>
      </header>

      {/* Contenido */}
      <main className="container-nikkei py-10 lg:py-14">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Título */}
          <div className="text-center space-y-3">
            <h1 className="font-serif text-4xl sm:text-5xl text-red-800 leading-tight pt-3">
              Editar mi información
            </h1>
            <div className="mx-auto h-1 w-24 rounded-full bg-linear-to-r from-red-600 to-amber-400" />
            <p className="font-sans text-lg text-red-600/80 max-w-xl mx-auto">
              Mantén tus datos actualizados para conectar mejor con la comunidad.
            </p>
          </div>

          {/* Alertas globales */}
          {success && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 flex items-start gap-3">
              <Check size={20} className="text-green-700 shrink-0 mt-0.5" />
              <p className="font-sans text-base text-green-900 flex-1 leading-relaxed">
                {success}
              </p>
              <button
                onClick={() => setSuccess('')}
                className="text-green-700 hover:text-green-900 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
              <X size={20} className="text-red-700 shrink-0 mt-0.5" />
              <p className="font-sans text-base text-red-900 flex-1 leading-relaxed">
                {error}
              </p>
              <button
                onClick={() => setError('')}
                className="text-red-700 hover:text-red-900 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Aviso si está pendiente de revisión */}
          {perfil.registro_estado === 'pendiente_revision' && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 flex items-start gap-3">
              <Clock size={22} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-serif text-lg text-amber-900 mb-1">
                  Tu registro está en revisión
                </p>
                <p className="font-sans text-base text-amber-800 leading-relaxed">
                  Ya solicitaste un cambio que un administrador está revisando.
                  No puedes solicitar otro cambio hasta que sea aprobado, pero
                  sí puedes actualizar tus datos de contacto y preferencias.
                </p>
              </div>
            </div>
          )}

          {/* Email — solo lectura */}
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <Lock size={18} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-gray-500 uppercase tracking-wide mb-0.5">
                  Tu correo electrónico
                </p>
                <p className="font-sans text-lg text-gray-800 truncate">
                  {perfil.email}
                </p>
                <p className="font-sans text-sm text-gray-400 mt-1">
                  Por seguridad, no se puede cambiar desde aquí.
                </p>
              </div>
            </div>
          </div>

          {/* Foto de perfil */}
          <SeccionAcordeon
            titulo="Foto de perfil"
            descripcion="Tu foto ayuda a otros miembros a reconocerte."
            icono={<Camera size={20} className="text-red-700" />}
            abierta={seccionAbierta === 'foto'}
            onToggle={() =>
              setSeccionAbierta(seccionAbierta === 'foto' ? null : 'foto')
            }
          >
            <FotoPerfil
              fotoActual={perfil.persona.foto_perfil}
              onGuardadoOk={() => onGuardadoOk('Foto actualizada exitosamente')}
            />
          </SeccionAcordeon>

          {/* Contacto y ubicación */}
          <SeccionAcordeon
            titulo="Contacto y ubicación"
            descripcion="Teléfono, correo personal, dirección. Cambios libres."
            icono={<Phone size={20} className="text-red-700" />}
            abierta={seccionAbierta === 'contacto'}
            onToggle={() =>
              setSeccionAbierta(seccionAbierta === 'contacto' ? null : 'contacto')
            }
          >
            <SeccionContacto
              persona={perfil.persona}
              onGuardadoOk={() => onGuardadoOk('Información de contacto actualizada')}
            />
          </SeccionAcordeon>

          {/* Preferencias */}
          <SeccionAcordeon
            titulo="Preferencias"
            descripcion="Nivel de japonés, privacidad, comunicaciones."
            icono={<Settings size={20} className="text-red-700" />}
            abierta={seccionAbierta === 'preferencias'}
            onToggle={() =>
              setSeccionAbierta(
                seccionAbierta === 'preferencias' ? null : 'preferencias'
              )
            }
          >
            <SeccionPreferencias
              persona={perfil.persona}
              onGuardadoOk={() => onGuardadoOk('Preferencias actualizadas')}
            />
          </SeccionAcordeon>

          {/* Datos sensibles */}
          {perfil.registro_estado === 'completado' && (
            <SeccionAcordeon
              titulo="Mis datos personales"
              descripcion="Nombre, fecha de nacimiento, familia. Requiere aprobación admin."
              icono={<UserIcon size={20} className="text-red-700" />}
              abierta={seccionAbierta === 'sensibles'}
              onToggle={() =>
                setSeccionAbierta(
                  seccionAbierta === 'sensibles' ? null : 'sensibles'
                )
              }
              destacado
            >
              <SeccionDatosSensibles
                persona={perfil.persona}
                familiaActual={perfil.familia}
                onGuardadoOk={onCambioSensibleOk}
              />
            </SeccionAcordeon>
          )}
        </div>
      </main>
    </div>
  )
}

// Acordeon reutilizable
interface AcordeonProps {
  titulo: string
  descripcion: string
  icono: React.ReactNode
  abierta: boolean
  onToggle: () => void
  destacado?: boolean
  children: React.ReactNode
}

function SeccionAcordeon({
  titulo,
  descripcion,
  icono,
  abierta,
  onToggle,
  destacado,
  children,
}: AcordeonProps) {
  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
        destacado ? 'border-amber-200' : 'border-amber-100'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-5 sm:px-6 py-5 flex items-center gap-4 hover:bg-amber-50/50 transition-colors cursor-pointer"
      >
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          {icono}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-serif text-xl text-red-800">{titulo}</p>
            {destacado && (
              <span className="font-sans text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                Requiere aprobación
              </span>
            )}
          </div>
          <p className="font-sans text-base text-gray-500 mt-0.5">
            {descripcion}
          </p>
        </div>
        <div
          className={`text-red-700 transition-transform duration-200 shrink-0 ${
            abierta ? 'rotate-180' : ''
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {abierta && (
        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-amber-100/60">
          {children}
        </div>
      )}
    </div>
  )
}