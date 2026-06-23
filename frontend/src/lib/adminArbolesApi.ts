import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

function getAuthHeaders(): HeadersInit {
  const token = Cookies.get('auth-token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function fetchAdmin<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || data.message || 'Error en la petición')
  return data as T
}

export interface FamiliaConArbol {
  id_familia: number
  apellido_jp: string
  apellido_kanji: string | null
  prefectura_origen: string | null
  anio_llegada_mexico: number | null
  lugar_llegada: string | null
  total_miembros: number
  total_relaciones: number
}

export interface ArbolPersona {
  id_persona: number
  nombre_completo: string
  generacion: string
  foto_perfil: string | null
  id_familia: number
  apellido_familia: string
  es_miembro_activo: boolean
  es_publico: boolean
}

export interface ArbolRelacion {
  id_genealogia: number
  id_persona: number
  id_pariente: number
  tipo_relacion: string
  confirmado_ambas_partes: boolean
}

export interface ArbolFamiliaResponse {
  familia: {
    id_familia: number
    apellido_jp: string
    apellido_kanji: string | null
    prefectura_origen: string | null
    anio_llegada_mexico: number | null
    lugar_llegada: string | null
  }
  personas: ArbolPersona[]
  relaciones: ArbolRelacion[]
}

export const adminArbolesApi = {
  listarFamilias: () =>
    fetchAdmin<{ data: FamiliaConArbol[]; count: number }>('/admin/arboles/familias'),
  getArbolFamilia: (idFamilia: number) =>
    fetchAdmin<ArbolFamiliaResponse>(`/admin/arboles/familias/${idFamilia}`),
}