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
    headers: {
      ...getAuthHeaders(),
      ...options?.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || data.message || 'Error en la solicitud')
  }
  return data as T
}

// Tipos

export interface PersonaPerfil {
  id_persona: number
  id_familia: number
  nombres: string
  apellido_paterno: string
  apellido_materno?: string
  nombre_japones?: string
  nombre_kanji?: string
  genero?: string
  fecha_nacimiento?: string
  lugar_nacimiento?: string
  generacion: string
  estado_civil?: string
  telefono_principal?: string
  telefono_alternativo?: string
  email_personal?: string
  direccion_completa?: string
  ciudad?: string
  estado: string
  codigo_postal?: string
  foto_perfil?: string
  nivel_japones?: string
  participa_eventos: boolean
  acepta_directorio_publico: boolean
  acepta_comunicaciones: boolean
  id_empresa_empleadora?: number
  puesto?: string
}

export interface FamiliaResumen {
  id_familia: number
  apellido_jp: string
  apellido_kanji?: string
}

export interface EmpleoResumen {
  id_empresa_empleadora: number
  nombre_empresa: string
  ciudad?: string
  estado?: string
}

export interface MiPerfilResponse {
  email: string
  registro_estado: string
  motivo_pendiente?: string | null
  persona: PersonaPerfil
  familia: FamiliaResumen
  empleo?: EmpleoResumen | null
}

export interface DatosLibresInput {
  telefono_principal?: string
  telefono_alternativo?: string | null
  email_personal?: string | null
  direccion_completa?: string | null
  ciudad?: string | null
  estado?: string
  codigo_postal?: string | null
  estado_civil?: string | null
  nivel_japones?: string | null
  acepta_directorio_publico?: boolean
  acepta_comunicaciones?: boolean
  participa_eventos?: boolean
}

export interface CambioSensibleInput {
  nombres?: string
  apellido_paterno?: string
  apellido_materno?: string | null
  nombre_japones?: string | null
  nombre_kanji?: string | null
  fecha_nacimiento?: string
  lugar_nacimiento?: string | null
  genero?: string
  generacion?: string
  id_familia?: number
}

export const perfilApi = {
  get: () =>
    apiFetch<{ message: string; data: MiPerfilResponse }>('/mi-perfil'),

  actualizarDatosLibres: (data: DatosLibresInput) =>
    apiFetch<{ message: string }>('/mi-perfil/datos-libres', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  solicitarCambio: (data: CambioSensibleInput) =>
    apiFetch<{ message: string }>('/mi-perfil/solicitar-cambio', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  actualizarFoto: (fotoPerfil: string | null) =>
    apiFetch<{ message: string }>('/mi-perfil/foto', {
      method: 'PATCH',
      body: JSON.stringify({ foto_perfil: fotoPerfil }),
    }),
}