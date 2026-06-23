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

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || data.message || 'Error en la solicitud')
  return data
}

// Tipos

export interface SliderItem {
  id_slider: number
  url_imagen: string
  titulo?: string
  orden: number
  es_activo: boolean
  created_at: string
  updated_at: string
}

export interface Evento {
  id_evento: number
  id_organizador: number
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
  created_at: string
  updated_at: string
}

export interface Empresa {
  id_empresa: number
  id_propietario: number
  nombre_empresa: string
  razon_social?: string
  rfc?: string
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
  orden_homepage: number
  created_at: string
  updated_at: string
}

export interface GaleriaItem {
  id_galeria: number
  titulo: string
  descripcion?: string
  url_imagen: string
  fecha_hito?: string
  categoria: string
  es_destacado: boolean
  orden: number
  created_at: string
  updated_at: string
}

// Slider

export const sliderApi = {
  getAll: () => apiFetch<{ data: SliderItem[] }>('/admin/slider/'),
  create: (data: Partial<SliderItem>) =>
    apiFetch<{ data: SliderItem }>('/admin/slider/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<SliderItem>) =>
    apiFetch<{ data: SliderItem }>(`/admin/slider/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    apiFetch<{ message: string }>(`/admin/slider/${id}`, { method: 'DELETE' }),
  reorder: (items: { id: number; orden: number }[]) =>
    apiFetch<{ message: string }>('/admin/slider/reorder', { method: 'PUT', body: JSON.stringify(items) }),
}

// Eventos

export const eventosApi = {
  getAll: (params?: { status?: string; tipo?: string }) => {
    const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
    return apiFetch<{ data: Evento[] }>(`/admin/eventos/${qs ? '?' + qs : ''}`)
  },
  create: (data: Partial<Evento>) =>
    apiFetch<{ data: Evento }>('/admin/eventos/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Evento>) =>
    apiFetch<{ data: Evento }>(`/admin/eventos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    apiFetch<{ message: string }>(`/admin/eventos/${id}`, { method: 'DELETE' }),
  updateStatus: (id: number, status: string) =>
    apiFetch<{ message: string }>(`/admin/eventos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

// Empresas

export const empresasApi = {
  getAll: (params?: { status?: string; homepage?: string }) => {
    const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
    return apiFetch<{ data: Empresa[] }>(`/admin/empresas/${qs ? '?' + qs : ''}`)
  },
  create: (data: Partial<Empresa>) =>
    apiFetch<{ data: Empresa }>('/admin/empresas/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Empresa>) =>
    apiFetch<{ data: Empresa }>(`/admin/empresas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    apiFetch<{ message: string }>(`/admin/empresas/${id}`, { method: 'DELETE' }),
  updateAprobacion: (id: number, status: string) =>
    apiFetch<{ message: string }>(`/admin/empresas/${id}/aprobacion`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  setHomepage: (id: number, data: { en_homepage: boolean; orden_homepage?: number }) =>
    apiFetch<{ message: string }>(`/admin/empresas/${id}/homepage`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
}

// Galeria

export const galeriaApi = {
  getAll: () => apiFetch<{ data: GaleriaItem[] }>('/galeria/'),
  create: (data: Partial<GaleriaItem>) =>
    apiFetch<{ data: GaleriaItem }>('/admin/galeria/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<GaleriaItem>) =>
    apiFetch<{ data: GaleriaItem }>(`/admin/galeria/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    apiFetch<{ message: string }>(`/admin/galeria/${id}`, { method: 'DELETE' }),
}

// Registros comunitarios pendientes

export interface PersonaPendiente {
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
  telefono_principal?: string
  ciudad?: string
  estado: string
  nivel_japones?: string
  acepta_directorio_publico: boolean
  acepta_comunicaciones: boolean
  created_at: string
}

export interface FamiliaPendiente {
  id_familia: number
  apellido_jp: string
  apellido_romanji?: string
  apellido_kanji?: string
  prefectura_origen?: string
  anio_llegada_mexico?: number
  lugar_llegada?: string
  pendiente_aprobacion: boolean
}

export interface RegistroPendiente {
  id_user: number
  email: string
  created_at: string
  motivo_pendiente?: string | null
  persona: PersonaPendiente
  familia: FamiliaPendiente
  familia_es_nueva: boolean
}

export const registrosPendientesApi = {
  getPendientes: () =>
    apiFetch<{ message: string; data: RegistroPendiente[]; count: number }>(
      '/admin/registros-pendientes'
    ),

  aprobar: (idUser: number) =>
    apiFetch<{ message: string }>(
      `/admin/registros-pendientes/${idUser}/aprobar`,
      { method: 'PATCH' }
    ),

  rechazar: (idUser: number, motivo?: string) =>
    apiFetch<{ message: string }>(
      `/admin/registros-pendientes/${idUser}/rechazar`,
      {
        method: 'PATCH',
        body: JSON.stringify({ motivo: motivo || undefined }),
      }
    ),
}

// Miembros

export interface MiembroListItem {
  id_persona: number
  id_user?: number
  email?: string
  nombres: string
  apellido_paterno: string
  apellido_materno?: string
  generacion: string
  ciudad?: string
  foto_perfil?: string
  es_miembro_activo: boolean
  familia_apellido: string
}

export interface MiembroDetalle {
  id_persona: number
  id_user?: number
  email?: string
  registro_estado?: string
  nombres: string
  apellido_paterno: string
  apellido_materno?: string
  nombre_japones?: string
  nombre_kanji?: string
  nombre_japones_registrado?: boolean
  genero?: string
  fecha_nacimiento?: string
  fecha_fallecimiento?: string
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
  es_miembro_activo: boolean
  nivel_japones?: string
  participa_eventos: boolean
  ha_recibido_beca?: boolean
  acepta_directorio_publico: boolean
  acepta_comunicaciones: boolean
  fecha_ingreso_asociacion?: string
  puesto?: string
  familia: { id_familia: number; apellido_jp: string; apellido_kanji?: string }
  empleo?: { id_empresa_empleadora: number; nombre_empresa: string; ciudad?: string; estado?: string }
  empresa_propia?: { id_empresa: number; nombre_empresa: string; giro_comercial?: string; status_aprobacion?: string }
}

export const miembrosApi = {
  getAll: (params?: { q?: string; generacion?: string; activos?: string }) => {
    const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
    return apiFetch<{ data: MiembroListItem[]; count: number }>(`/admin/miembros${qs ? '?' + qs : ''}`)
  },
  getDetalle: (id: number) =>
    apiFetch<{ data: MiembroDetalle }>(`/admin/miembros/${id}`),
}