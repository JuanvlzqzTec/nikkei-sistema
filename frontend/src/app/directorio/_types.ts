export interface Empresa {
  id_empresa: number
  nombre_empresa: string
  giro_comercial?: string
  sector?: string
  descripcion?: string
  telefono?: string
  email?: string
  sitio_web?: string
  direccion?: string
  ciudad?: string
  estado: string
  logo_empresa?: string
  acepta_promocion_directorio: boolean
  status_aprobacion?: string
}

// Colores por sector — para badges
export const SECTOR_COLORS: Record<string, string> = {
  tecnología:    'bg-blue-100 text-blue-700 border-blue-200',
  alimentación:  'bg-green-100 text-green-700 border-green-200',
  comercio:      'bg-amber-100 text-amber-700 border-amber-200',
  servicios:     'bg-purple-100 text-purple-700 border-purple-200',
  salud:         'bg-red-100 text-red-700 border-red-200',
  educación:     'bg-indigo-100 text-indigo-700 border-indigo-200',
  construcción:  'bg-orange-100 text-orange-700 border-orange-200',
  manufactura:   'bg-gray-100 text-gray-700 border-gray-200',
}

export function getSectorColor(sector?: string): string {
  if (!sector) return 'bg-amber-100 text-amber-700 border-amber-200'
  const key = sector.toLowerCase()
  for (const [k, v] of Object.entries(SECTOR_COLORS)) {
    if (key.includes(k)) return v
  }
  return 'bg-amber-100 text-amber-700 border-amber-200'
}

// Extraer giros únicos de la lista de empresas para el filtro
export function getGirosUnicos(empresas: Empresa[]): string[] {
  const giros = empresas
    .map((e) => e.giro_comercial)
    .filter((g): g is string => !!g)
  const unicos = Array.from(new Set(giros)).sort()
  // "Otro" siempre al final
  const sinOtro = unicos.filter((g) => g !== 'Otro')
  const tieneOtro = unicos.includes('Otro')
  return tieneOtro ? [...sinOtro, 'Otro'] : sinOtro
}