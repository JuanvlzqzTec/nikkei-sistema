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

export interface MiEmpresa {
  id_empresa: number
  id_propietario: number | null
  nombre_empresa: string
  giro_comercial?: string
  sector?: string
  descripcion?: string
  telefono?: string
  email?: string
  sitio_web?: string
  redes_sociales?: string
  direccion?: string
  ciudad?: string
  estado: string
  logo_empresa?: string
  acepta_promocion_directorio: boolean
  status_aprobacion?: string
  en_homepage: boolean
  created_at: string
  updated_at: string
}

export interface MiEmpresaInput {
  nombre_empresa: string
  giro_comercial?: string
  descripcion?: string
  telefono?: string
  email?: string
  sitio_web?: string
  redes_sociales?: string
  ciudad?: string
  estado?: string
  logo_empresa?: string
  acepta_promocion_directorio: boolean
}

export interface EmpresaEmpleadora {
  id_empresa_empleadora: number
  nombre_empresa: string
  descripcion?: string
  ciudad?: string
  estado?: string
  pais: string
}

export interface MiEmpleoResponse {
  message: string
  tiene_empleo: boolean
  data: EmpresaEmpleadora | null
  puesto?: string | null
}

// Mi empresa propia

export const miEmpresaApi = {
  get: () =>
    apiFetch<{ message: string; data?: MiEmpresa; tiene_empresa: boolean }>(
      '/mi-empresa'
    ),

  crear: (data: MiEmpresaInput) =>
    apiFetch<{ message: string; data: MiEmpresa }>('/empresas/solicitar', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  actualizar: (data: MiEmpresaInput) =>
    apiFetch<{ message: string; data: MiEmpresa }>('/mi-empresa', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

export const miEmpleoApi = {
  // Autocomplete público
  buscar: (q: string) =>
    apiFetch<{ data: EmpresaEmpleadora[]; count: number }>(
      `/empresas-empleadoras${q ? `?q=${encodeURIComponent(q)}` : ''}`
    ),

  // Crear (o reutilizar si existe) — autenticado
  crearEmpleadora: (data: {
    nombre_empresa: string
    descripcion?: string
    ciudad?: string
    estado?: string
    pais?: string
  }) =>
    apiFetch<{ data: EmpresaEmpleadora; reutilizada: boolean }>(
      '/empresas-empleadoras',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  // Mi empleo actual
  get: () => apiFetch<MiEmpleoResponse>('/mi-empleo'),

  // Vincular / desvincular
  actualizar: (data: {
    id_empresa_empleadora: number | null
    puesto: string | null
  }) =>
    apiFetch<{ message: string }>('/mi-empleo', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
}