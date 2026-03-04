// lib/galeriaService.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface GaleriaItem {
  id_galeria: number
  titulo: string
  descripcion?: string
  url_imagen: string
  fecha_hito?: string
  categoria: 'inmigracion' | 'fundacion' | 'evento_historico' | 'cultura' | 'personaje_clave'
  es_destacado: boolean
  orden: number
  created_at: string
  updated_at: string
}

export interface GaleriaResponse {
  message: string
  data: GaleriaItem[]
  count?: number
}

class GaleriaService {
  async getDestacados(): Promise<GaleriaItem[]> {
    try {
      const response = await fetch(`${API_URL}/api/v1/galeria/destacados`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: GaleriaResponse = await response.json()
      return result.data || []
    } catch (error) {
      console.error('Error fetching galería destacados:', error)
      throw error // Propagar el error, no ocultarlo
    }
  }

  getAnio(item: GaleriaItem): string {
    if (!item.fecha_hito) return "19XX"
    
    try {
      return new Date(item.fecha_hito).getFullYear().toString()
    } catch {
      return "19XX"
    }
  }

  getCategoriaDisplay(categoria: string): string {
    const categoriaMap: Record<string, string> = {
      'inmigracion': 'Inmigración',
      'fundacion': 'Hito Histórico',
      'evento_historico': 'Evento Histórico',
      'cultura': 'Cultura',
      'personaje_clave': 'Personaje Clave'
    }
    
    return categoriaMap[categoria] || categoria
  }
}

export const galeriaService = new GaleriaService()