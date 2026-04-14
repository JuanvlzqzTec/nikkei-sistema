export interface Evento {
  id_evento: number
  titulo: string
  descripcion?: string
  tipo_evento: string
  fecha_inicio: string
  fecha_fin?: string
  ubicacion?: string
  direccion?: string
  ciudad?: string
  capacidad_maxima?: number
  requiere_registro: boolean
  imagen_evento?: string
  link_transmision?: string
  requisitos?: string
  contacto_organizador?: string
  status: string
}

// Etiquetas y colores por tipo de evento

export const TIPO_LABELS: Record<string, string> = {
  matsuri:     'Matsuri',
  reunion:     'Reunión',
  cultural:    'Cultural',
  deportivo:   'Deportivo',
  educativo:   'Educativo',
  empresarial: 'Empresarial',
  ceremonia:   'Ceremonia',
}

export const TIPO_COLORS: Record<string, string> = {
  matsuri:     'bg-red-100 text-red-700 border-red-200',
  reunion:     'bg-amber-100 text-amber-700 border-amber-200',
  cultural:    'bg-orange-100 text-orange-700 border-orange-200',
  deportivo:   'bg-green-100 text-green-700 border-green-200',
  educativo:   'bg-blue-100 text-blue-700 border-blue-200',
  empresarial: 'bg-purple-100 text-purple-700 border-purple-200',
  ceremonia:   'bg-rose-100 text-rose-700 border-rose-200',
}

export const TIPO_BADGE_SOLID: Record<string, string> = {
  matsuri:     'bg-red-600 text-white',
  reunion:     'bg-amber-600 text-white',
  cultural:    'bg-orange-500 text-white',
  deportivo:   'bg-green-600 text-white',
  educativo:   'bg-blue-600 text-white',
  empresarial: 'bg-purple-600 text-white',
  ceremonia:   'bg-rose-500 text-white',
}

// Helpers de fecha

export function formatFecha(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    timeZone: 'America/Mazatlan',
    ...opts,
  })
}

export function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-MX', {
    timeZone: 'America/Mazatlan',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function esFuturo(ev: Evento): boolean {
  const ref = ev.fecha_fin ? new Date(ev.fecha_fin) : new Date(ev.fecha_inicio)
  return ref > new Date()
}