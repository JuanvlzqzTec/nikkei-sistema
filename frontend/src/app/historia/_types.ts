export interface GaleriaItem {
  id_galeria: number
  titulo: string
  descripcion?: string
  url_imagen: string
  fecha_hito?: string
  categoria: 'inmigracion' | 'fundacion' | 'evento_historico' | 'cultura' | 'personaje_clave'
  es_destacado: boolean
  orden: number
  created_at: string
  updated_at: string
}

export const CATEGORIA_LABELS: Record<string, string> = {
  inmigracion:      'Inmigración',
  fundacion:        'Fundación',
  evento_historico: 'Evento Histórico',
  cultura:          'Cultura',
  personaje_clave:  'Personaje Clave',
}

export const CATEGORIA_COLORS: Record<string, string> = {
  inmigracion:      'bg-blue-100 text-blue-700 border-blue-200',
  fundacion:        'bg-purple-100 text-purple-700 border-purple-200',
  evento_historico: 'bg-orange-100 text-orange-700 border-orange-200',
  cultura:          'bg-pink-100 text-pink-700 border-pink-200',
  personaje_clave:  'bg-teal-100 text-teal-700 border-teal-200',
}

export const CATEGORIA_SOLID: Record<string, string> = {
  inmigracion:      'bg-blue-600 text-white',
  fundacion:        'bg-purple-600 text-white',
  evento_historico: 'bg-orange-500 text-white',
  cultura:          'bg-pink-500 text-white',
  personaje_clave:  'bg-teal-600 text-white',
}

export function getAnio(item: GaleriaItem): string {
  if (!item.fecha_hito) return ''
  try {
    return new Date(item.fecha_hito).getFullYear().toString()
  } catch {
    return ''
  }
}

export function getFechaDisplay(item: GaleriaItem): string {
  if (!item.fecha_hito) return 'Fecha desconocida'
  try {
    return new Date(item.fecha_hito).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return 'Fecha desconocida'
  }
}