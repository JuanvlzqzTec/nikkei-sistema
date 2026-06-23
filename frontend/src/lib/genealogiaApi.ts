import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

function getAuthHeaders(): HeadersInit {
  const token = Cookies.get('auth-token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options?.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || data.message || 'Error en la solicitud')
  return data as T
}

export interface PersonaResumen {
  id_persona: number
  nombres: string
  apellido_paterno: string
  apellido_materno?: string
  nombre_completo: string
  generacion: string
  foto_perfil?: string
  id_familia: number
  apellido_familia: string
  es_miembro_activo: boolean
}

export interface RelacionResumen {
  id_genealogia: number
  tipo_relacion: string
  confirmado_ambas_partes: boolean
  notas?: string
  created_at: string
  pariente: PersonaResumen
  yo_soy_quien: 'persona' | 'pariente'
}

export interface PendienteResumen {
  id_genealogia: number
  tipo_relacion: string
  tipo_inverso: string
  notas?: string
  created_at: string
  solicitante: PersonaResumen
}

export interface MiArbolResponse {
  message: string
  yo: PersonaResumen
  relaciones: RelacionResumen[]
  count: number
}

export interface CrearRelacionInput {
  id_pariente: number
  tipo_relacion: string
  notas?: string
}

export interface CrearPersonaHistoricaInput {
  id_familia: number
  nombres: string
  apellido_paterno: string
  apellido_materno?: string
  nombre_japones?: string
  nombre_kanji?: string
  generacion: string
  genero?: string
  fecha_nacimiento?: string
  fecha_fallecimiento?: string
  notas?: string
}

export interface ArbolFamiliarPersona {
  id_persona: number
  nombre_completo: string
  generacion: string
  foto_perfil: string | null
  id_familia: number
  apellido_familia: string
  es_miembro_activo: boolean
  es_yo: boolean
}

export interface ArbolFamiliarRelacion {
  id_genealogia: number
  id_persona: number
  id_pariente: number
  tipo_relacion: string
  confirmado_ambas_partes: boolean
}

export interface ArbolFamiliarResponse {
  familia: {
    id_familia: number
    apellido_jp: string
    apellido_kanji: string | null
  }
  personas: ArbolFamiliarPersona[]
  relaciones: ArbolFamiliarRelacion[]
  yo_id: number
}

export const genealogiaApi = {
  getMiArbol: () => apiFetch<MiArbolResponse>('/mi-arbol'),

  buscarPersonas: (params: { q?: string; idFamilia?: number }) => {
    const qs = new URLSearchParams()
    if (params.q) qs.set('q', params.q)
    if (params.idFamilia) qs.set('id_familia', String(params.idFamilia))
    const str = qs.toString()
    return apiFetch<{ data: PersonaResumen[]; count: number }>(
      `/personas/buscar${str ? '?' + str : ''}`
    )
  },

  crearPersonaHistorica: (data: CrearPersonaHistoricaInput) =>
    apiFetch<{ message: string; data: PersonaResumen }>('/personas/historica', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  crearRelacion: (data: CrearRelacionInput) =>
    apiFetch<{ message: string; requiere_confirmacion: boolean }>('/relaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  confirmarRelacion: (id: number) =>
    apiFetch<{ message: string }>(`/relaciones/${id}/confirmar`, { method: 'PATCH' }),

  eliminarRelacion: (id: number) =>
    apiFetch<{ message: string }>(`/relaciones/${id}`, { method: 'DELETE' }),

  getPendientesConfirmacion: () =>
    apiFetch<{ data: PendienteResumen[]; count: number }>(
      '/relaciones/pendientes-confirmacion'
    ),
  getArbolDeMiFamilia: () => apiFetch<ArbolFamiliarResponse>('/mi-familia-arbol'),
}