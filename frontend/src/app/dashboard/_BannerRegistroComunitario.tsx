'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  PlayCircle,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  ArrowRight,
} from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { DRAFT_STORAGE_KEY } from '@/app/registro-comunitario/_constants'
import {
  PASOS_LABELS,
  TOTAL_PASOS,
  type WizardDraft,
} from '@/app/registro-comunitario/_types'

// Contacto del admin — TODO: mover a env / config cuando exista
const ADMIN_EMAIL = 'nikkeiculiacanadmin@gmail.com'
const ADMIN_TELEFONO = '+52 (667) 142-0914'

let cachedRaw: string | null = null
let cachedDraft: WizardDraft | null = null

function getDraftSnapshot(): WizardDraft | null {
  if (typeof window === 'undefined') return null

  const raw = localStorage.getItem(DRAFT_STORAGE_KEY)

  if (raw === cachedRaw) return cachedDraft

  cachedRaw = raw
  if (!raw) {
    cachedDraft = null
    return null
  }

  try {
    cachedDraft = JSON.parse(raw) as WizardDraft
  } catch {
    cachedDraft = null
  }
  return cachedDraft
}

function getServerSnapshot(): WizardDraft | null {
  return null
}

function subscribeDraft(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

export default function BannerRegistroComunitario() {
  const { user } = useAuthStore()

  const draft = useSyncExternalStore(
    subscribeDraft,
    getDraftSnapshot,
    getServerSnapshot,
  )

  const tieneBorrador = draft !== null
  const pasoBorrador = draft ? Math.min(draft.currentStep, TOTAL_PASOS) : null

  if (!user) return null

  const estado = user.registro_estado

  if (estado === 'completado') return null

  if (estado === 'pendiente_revision') {
    return (
      <BannerWrapper
        gradiente="from-blue-50 to-amber-50"
        borde="border-blue-200"
        iconoBg="bg-blue-100"
        iconoColor="text-blue-700"
        icono={<Clock size={28} />}
        eyebrow="Tu registro está en revisión"
        titulo="Estamos revisando tu solicitud"
        descripcion="Un administrador está revisando los datos que enviaste. Te avisaremos en cuanto tu registro sea aprobado para que puedas participar plenamente en la comunidad."
      />
    )
  }

  if (estado === 'rechazado') {
    return (
      <BannerWrapper
        gradiente="from-red-50 to-rose-50"
        borde="border-red-300"
        iconoBg="bg-red-100"
        iconoColor="text-red-700"
        icono={<AlertCircle size={28} />}
        eyebrow="Tu registro fue rechazado"
        titulo="Necesitamos hablar contigo"
        descripcion="Tu solicitud de registro comunitario no pudo ser aprobada. Por favor contacta a un administrador para conocer los detalles y ver cómo podemos ayudarte."
      >
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={`mailto:${ADMIN_EMAIL}`}
            className="flex-1 min-h-15 px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mail size={18} />
            Escribir al administrador
          </a>
          <a
            href={`tel:${ADMIN_TELEFONO.replace(/\D/g, '')}`}
            className="flex-1 min-h-15 px-6 py-3 bg-white border-2 border-red-700 text-red-700 hover:bg-red-50 font-sans font-semibold text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Phone size={18} />
            Llamar al administrador
          </a>
        </div>

        <div className="mt-4 pt-4 border-t border-red-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-base font-sans text-red-800">
          <div className="flex items-center gap-2">
            <Mail size={15} className="text-red-600 shrink-0" />
            <span className="truncate">{ADMIN_EMAIL}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={15} className="text-red-600 shrink-0" />
            <span>{ADMIN_TELEFONO}</span>
          </div>
        </div>
      </BannerWrapper>
    )
  }

  if (estado === 'no_iniciado' && tieneBorrador && pasoBorrador) {
    const labelPaso = PASOS_LABELS[pasoBorrador] ?? ''
    return (
      <BannerWrapper
        gradiente="from-amber-50 to-orange-50"
        borde="border-amber-300"
        iconoBg="bg-amber-100"
        iconoColor="text-amber-700"
        icono={<PlayCircle size={28} />}
        eyebrow={`Paso ${pasoBorrador} de ${TOTAL_PASOS}${labelPaso ? ' · ' + labelPaso : ''}`}
        titulo="Continúa tu registro donde lo dejaste"
        descripcion="Guardaste tu progreso antes de salir. Puedes retomarlo cuando quieras y completar tu registro comunitario."
      >
        <Link
          href="/registro-comunitario"
          className="inline-flex min-h-15 px-6 py-3 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all duration-200 items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
        >
          Continuar registro
          <ArrowRight size={18} />
        </Link>
      </BannerWrapper>
    )
  }

  // Estado 1: No iniciado (sin borrador) — default para usuarios nuevos
  return (
    <BannerWrapper
      gradiente="from-orange-50 via-amber-50 to-red-50"
      borde="border-amber-300"
      iconoBg="bg-amber-100"
      iconoColor="text-red-700"
      icono={<Sparkles size={28} />}
      eyebrow="¡Bienvenido a la familia Nikkei!"
      titulo="Aún no has comenzado tu registro comunitario"
      descripcion="Completa tu registro para formar parte oficial de la comunidad Nikkei de Sinaloa, conectar con tu familia y participar en nuestros eventos. Solo te tomará unos minutos."
    >
      <Link
        href="/registro-comunitario"
        className="inline-flex min-h-15 px-6 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all duration-200 items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
      >
        Comenzar mi registro
        <ArrowRight size={18} />
      </Link>
    </BannerWrapper>
  )
}

// Wrapper visual reutilizable para todos los estados
interface BannerWrapperProps {
  gradiente: string
  borde: string
  iconoBg: string
  iconoColor: string
  icono: React.ReactNode
  eyebrow: string
  titulo: string
  descripcion: string
  children?: React.ReactNode
}

function BannerWrapper({
  gradiente,
  borde,
  iconoBg,
  iconoColor,
  icono,
  eyebrow,
  titulo,
  descripcion,
  children,
}: BannerWrapperProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 ${borde} bg-linear-to-br ${gradiente} shadow-sm p-6 sm:p-8 max-w-4xl mx-auto`}
    >
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Icono */}
        <div
          className={`w-14 h-14 rounded-2xl ${iconoBg} ${iconoColor} flex items-center justify-center shrink-0`}
        >
          {icono}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0 space-y-3">
          <p className="font-sans text-sm font-bold uppercase tracking-wider text-red-700/80">
            {eyebrow}
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl text-gray-900 leading-tight">
            {titulo}
          </h2>
          <p className="font-sans text-lg text-gray-600 leading-relaxed">
            {descripcion}
          </p>

          {children && <div className="pt-2">{children}</div>}
        </div>
      </div>

      {/* Decoración kanji */}
      <span
        className="absolute -bottom-8 -right-4 font-serif text-9xl text-red-900/5 select-none pointer-events-none"
        aria-hidden="true"
      >
        絆
      </span>
    </div>
  )
}