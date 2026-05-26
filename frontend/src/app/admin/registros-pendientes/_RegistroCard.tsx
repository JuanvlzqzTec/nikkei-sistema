'use client'

import { useState } from 'react'
import {
  ChevronDown,
  Check,
  X,
  Sparkles,
  User,
  Users,
  Phone,
  MapPin,
  Calendar,
  Languages,
  Eye,
  EyeOff,
  Mail,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import type { RegistroPendiente } from '@/lib/adminApi'

interface Props {
  registro: RegistroPendiente
  onAprobar: () => void
  onRechazar: () => void
  procesando?: boolean
}

const GENERACION_LABELS: Record<string, string> = {
  issei: 'Issei (1ª gen.)',
  nisei: 'Nisei (2ª gen.)',
  sansei: 'Sansei (3ª gen.)',
  yonsei: 'Yonsei (4ª gen.)',
  gosei: 'Gosei (5ª gen.)',
  roksei: 'Roksei (6ª gen.+)',
}

const NIVEL_JAPONES_LABELS: Record<string, string> = {
  ninguno: 'Ninguno',
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  nativo: 'Nativo',
}

const GENERO_LABELS: Record<string, string> = {
  masculino: 'Masculino',
  femenino: 'Femenino',
  otro: 'Otro',
  prefiero_no_decir: 'Prefiere no decir',
}

function formatFecha(iso?: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export default function RegistroCard({
  registro,
  onAprobar,
  onRechazar,
  procesando = false,
}: Props) {
  const [expandido, setExpandido] = useState(false)

  const { persona, familia, familia_es_nueva, email, created_at } = registro

  const nombreCompleto = [
    persona.nombres,
    persona.apellido_paterno,
    persona.apellido_materno,
  ]
    .filter(Boolean)
    .join(' ')

  const ubicacion = [persona.ciudad, persona.estado].filter(Boolean).join(', ')

  return (
    <div
      className={`bg-white rounded-xl border transition-all ${
        familia_es_nueva
          ? 'border-amber-300 ring-1 ring-amber-200'
          : 'border-gray-200'
      }`}
    >
      {/* Cabecera siempre visible */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-gray-50/50 transition-colors rounded-xl"
        disabled={procesando}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <span className="text-red-800 text-base font-semibold font-sans">
              {persona.nombres.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Info principal */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                {GENERACION_LABELS[persona.generacion] ?? persona.generacion}
              </span>
              {registro.motivo_pendiente === 'cambio_solicitado' ? (
                <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                  <RefreshCw size={10} /> Cambio solicitado
                </span>
              ) : (
                <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                  <Sparkles size={10} /> Nuevo registro
                </span>
              )}
              {familia_es_nueva && (
                <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                  <Sparkles size={10} /> Familia nueva
                </span>
              )}
            </div>
            <p className="font-sans font-semibold text-gray-800 truncate">
              {nombreCompleto}
            </p>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 font-sans flex-wrap">
              <span className="flex items-center gap-1 truncate">
                <Mail size={11} />
                {email}
              </span>
              <span className="flex items-center gap-1">
                <Users size={11} />
                Familia {familia.apellido_jp}
                {familia.apellido_kanji && (
                  <span className="ml-0.5">({familia.apellido_kanji})</span>
                )}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                Enviado {formatFecha(created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={18}
          className={`text-gray-400 shrink-0 mt-2 transition-transform duration-200 ${
            expandido ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Detalle expandido */}
      {expandido && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-5">
          {/* Datos de la persona */}
          <section>
            <h4 className="text-xs font-sans font-semibold text-gray-500 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <User size={12} /> Datos personales
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm font-sans">
              {persona.nombre_japones && (
                <Campo label="Nombre japonés" valor={persona.nombre_japones} />
              )}
              {persona.nombre_kanji && (
                <Campo label="Nombre en kanji" valor={persona.nombre_kanji} />
              )}
              <Campo
                label="Fecha de nacimiento"
                valor={formatFecha(persona.fecha_nacimiento)}
              />
              {persona.genero && (
                <Campo
                  label="Género"
                  valor={GENERO_LABELS[persona.genero] ?? persona.genero}
                />
              )}
              {persona.lugar_nacimiento && (
                <Campo
                  label="Lugar de nacimiento"
                  valor={persona.lugar_nacimiento}
                />
              )}
            </div>
          </section>

          {/* Contacto */}
          <section>
            <h4 className="text-xs font-sans font-semibold text-gray-500 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <Phone size={12} /> Contacto
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm font-sans">
              {persona.telefono_principal && (
                <Campo label="Teléfono" valor={persona.telefono_principal} />
              )}
              {ubicacion && (
                <Campo
                  label="Ubicación"
                  valor={ubicacion}
                  icono={<MapPin size={11} className="text-gray-300" />}
                />
              )}
            </div>
          </section>

          {/* Familia (solo si es nueva, con sus datos) */}
          {familia_es_nueva && (
            <section className="bg-amber-50/60 border border-amber-200 rounded-lg p-4">
              <h4 className="text-xs font-sans font-semibold text-amber-800 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                <Sparkles size={12} /> Familia nueva — datos a aprobar
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm font-sans">
                <Campo label="Apellido (romaji)" valor={familia.apellido_jp} />
                {familia.apellido_kanji && (
                  <Campo label="Apellido (kanji)" valor={familia.apellido_kanji} />
                )}
                {familia.prefectura_origen && (
                  <Campo
                    label="Prefectura de origen"
                    valor={familia.prefectura_origen}
                  />
                )}
                {familia.anio_llegada_mexico && (
                  <Campo
                    label="Año de llegada a México"
                    valor={String(familia.anio_llegada_mexico)}
                  />
                )}
                {familia.lugar_llegada && (
                  <Campo label="Lugar de llegada" valor={familia.lugar_llegada} />
                )}
              </div>
              <p className="text-xs text-amber-700 font-sans mt-3 italic">
                Al aprobar esta solicitud, también se aprobará automáticamente
                esta familia en el directorio público.
              </p>
            </section>
          )}

          {/* Preferencias */}
          <section>
            <h4 className="text-xs font-sans font-semibold text-gray-500 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <Languages size={12} /> Preferencias
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm font-sans">
              {persona.nivel_japones && (
                <Campo
                  label="Nivel de japonés"
                  valor={
                    NIVEL_JAPONES_LABELS[persona.nivel_japones] ??
                    persona.nivel_japones
                  }
                />
              )}
              <Campo
                label="Aparecer en directorio"
                valor={persona.acepta_directorio_publico ? 'Sí' : 'No'}
                icono={
                  persona.acepta_directorio_publico ? (
                    <Eye size={11} className="text-green-500" />
                  ) : (
                    <EyeOff size={11} className="text-gray-300" />
                  )
                }
              />
              <Campo
                label="Recibir comunicaciones"
                valor={persona.acepta_comunicaciones ? 'Sí' : 'No'}
              />
            </div>
          </section>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={onAprobar}
              disabled={procesando}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-sans font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {procesando ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
              Aprobar registro
            </button>
            <button
              onClick={onRechazar}
              disabled={procesando}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white border border-red-300 hover:bg-red-50 text-red-700 text-sm font-sans font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={15} />
              Rechazar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Campo({
  label,
  valor,
  icono,
}: {
  label: string
  valor: string
  icono?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 font-sans">{label}</span>
      <span className="text-gray-800 font-sans flex items-center gap-1.5">
        {icono}
        {valor}
      </span>
    </div>
  )
}