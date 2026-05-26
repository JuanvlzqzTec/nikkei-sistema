import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

export interface User {
  id: number
  email: string
  role: string
  registro_estado: string
  is_active: boolean
  email_verified: boolean
  id_persona?: number | null
  nombre_completo?: string | null
  motivo_pendiente?: string | null
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  checkAuth: () => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      // Acción de login
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${API_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Error en el login')
          }

          const { user, token } = data.data

          // Guardar token en cookies (más seguro)
          Cookies.set('auth-token', token, { 
            expires: 1, // 1 día
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          })

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
          })
          throw error
        }
      },

      // Acción de registro
      register: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${API_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Error en el registro')
          }

          const { user, token } = data.data

          // Guardar token en cookies
          Cookies.set('auth-token', token, { 
            expires: 1,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          })

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
          })
          throw error
        }
      },

      // Acción de logout
      logout: () => {
        Cookies.remove('auth-token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      // Limpiar error
      clearError: () => {
        set({ error: null })
      },

      // Establecer loading
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      // Verificar autenticación
      checkAuth: async () => {
        const token = Cookies.get('auth-token')
        
        if (!token) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          })
          return
        }

        try {
          const response = await fetch(`${API_URL}/api/v1/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            // Token inválido o expirado
            Cookies.remove('auth-token')
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            })
            return
          }

          const data = await response.json()
          const user = data.data

          set({
            user,
            token,
            isAuthenticated: true,
          })
        } catch (error) {
          // Error de red o servidor
          Cookies.remove('auth-token')
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      // Solo persistir datos básicos, no el token (va en cookies)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)