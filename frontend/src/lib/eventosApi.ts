import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface RegistroEventoInput {
  nombre_visitante?: string
  edad_visitante?: number
  acompaniantes: number
}

export async function registrarseEvento(idEvento: number, data: RegistroEventoInput) {
  const token = Cookies.get('auth-token')
  const res = await fetch(`${API_URL}/api/v1/eventos/${idEvento}/registrarse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || json.message || 'Error al registrarse')
  return json
}