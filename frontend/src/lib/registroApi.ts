import Cookies from 'js-cookie'
import type {
  FamiliaPublica,
  MiembrosPublicosResponse,
  MiEstadoResponse,
  RegistroComunitarioPayload,
} from '@/app/registro-comunitario/_types'

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

export const registroApi = {
  getFamiliasPublicas: () =>
    apiFetch<{ message: string; data: FamiliaPublica[]; count: number }>(
      '/familias/publicas'
    ),

  getMiembrosPublicos: (idFamilia: number) =>
    apiFetch<MiembrosPublicosResponse>(
      `/familias/${idFamilia}/miembros-publicos`
    ),

  crearRegistro: (payload: RegistroComunitarioPayload) =>
    apiFetch<{ message: string }>('/registro-comunitario', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  miEstado: () => apiFetch<MiEstadoResponse>('/registro-comunitario/mi-estado'),
}