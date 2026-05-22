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

export interface Contribucion {
  id_contribucion: number
  id_user: number
  mensaje: string
  telefono_contacto?: string
  estado: 'pendiente' | 'atendida' | 'descartada'
  nota_admin?: string
  created_at: string
  updated_at: string
}

export interface ContribucionAdmin extends Contribucion {
  email: string
  persona?: {
    nombres: string
    apellido_paterno: string
    apellido_materno?: string
    telefono_principal?: string
  } | null
}

// Miembro

export const contribucionesApi = {
  crear: (data: { mensaje: string; telefono_contacto?: string }) =>
    apiFetch<{ message: string; data: Contribucion }>('/contribuciones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Admin

export const contribucionesAdminApi = {
  getPendientes: (estado: 'pendiente' | 'atendida' | 'descartada' | 'todos' = 'pendiente') =>
    apiFetch<{ data: ContribucionAdmin[]; count: number }>(
      `/admin/contribuciones${estado !== 'todos' ? `?estado=${estado}` : ''}`
    ),

  marcarEstado: (id: number, estado: 'atendida' | 'descartada' | 'pendiente', notaAdmin?: string) =>
    apiFetch<{ message: string }>(`/admin/contribuciones/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado, nota_admin: notaAdmin }),
    }),
}