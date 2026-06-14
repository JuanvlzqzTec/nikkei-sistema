import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

function getAuthHeaders(): HeadersInit {
  const token = Cookies.get('auth-token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, { headers: getAuthHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error')
  return data
}

export interface Conteo { clave: string; total: number }
export interface MesConteo { mes: string; total: number }
export interface RangoEdad { rango: string; total: number }

export interface TopEvento {
  id_evento: number
  titulo: string
  tipo_evento: string
  fecha_inicio: string
  registros: number
  total_personas: number
}

export interface EstadisticasResponse {
  generado_en: string
  comunidad: {
    total_personas: number
    miembros_activos: number
    total_familias: number
    registros_pendientes: number
    por_generacion: Conteo[]
    por_genero: Conteo[]
    por_nivel_japones: Conteo[]
    rangos_edad: RangoEdad[]
    incorporaciones: MesConteo[]
    por_ciudad: Conteo[]
    con_telefono: number
    con_foto: number
    con_fecha_nacimiento: number
    aceptan_directorio: number
  }
  eventos: {
    total: number
    total_empresas: number
    por_tipo: Conteo[] | null
    por_status: Conteo[] | null
    top_eventos: TopEvento[] | null
    participaciones_mensuales: MesConteo[] | null
  }
  usuarios: {
    mensuales: MesConteo[]
  }
}

export const estadisticasApi = {
  get: () => apiFetch<EstadisticasResponse>('/admin/estadisticas'),
}