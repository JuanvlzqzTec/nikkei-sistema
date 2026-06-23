export type Generacion = 'issei' | 'nisei' | 'sansei' | 'yonsei' | 'gosei' | 'roksei'
export type Genero = 'masculino' | 'femenino'
export type NivelJapones = 'ninguno' | 'basico' | 'intermedio' | 'avanzado' | 'nativo'

export interface WizardData {
  nombres: string
  apellido_paterno: string
  apellido_materno: string
  nombre_japones: string
  nombre_kanji: string
  nombre_japones_registrado: boolean

  generacion: Generacion | ''
  id_familia: number | null
  nueva_familia: NuevaFamiliaData | null

  fecha_nacimiento: string
  genero: Genero | ''
  lugar_nacimiento: string

  telefono_principal: string
  ciudad: string
  estado: string
  pais: string

  nivel_japones: NivelJapones | ''
  ha_recibido_beca: boolean
  acepta_directorio_publico: boolean
  acepta_comunicaciones: boolean
}

export interface NuevaFamiliaData {
  apellido_jp: string 
  apellido_kanji: string
  prefectura_origen: string
  anio_llegada_mexico: string
  lugar_llegada: string
}

export interface WizardDraft {
  data: WizardData
  currentStep: number
  savedAt: string
}

export interface FamiliaPublica {
  id_familia: number
  apellido_jp: string
  apellido_romanji: string | null
  apellido_kanji: string | null
  prefectura_origen: string | null
  anio_llegada_mexico: number | null
  lugar_llegada: string | null
  total_miembros: number
  miembros_publicos: number
}

export interface MiembroPublico {
  id_persona: number
  nombres: string
  apellido_paterno: string
  apellido_materno: string | null
  generacion: Generacion
}

export interface MiembrosPublicosResponse {
  message: string
  familia: {
    id_familia: number
    apellido_jp: string
    apellido_romanji: string | null
    apellido_kanji: string | null
    prefectura_origen: string | null
    anio_llegada_mexico: number | null
  }
  miembros_publicos: MiembroPublico[]
  total_miembros: number
  miembros_visibles: number
}

export interface MiEstadoResponse {
  registro_estado: string
  tiene_persona: boolean
  role: string
}

export interface RegistroComunitarioPayload {
  nombres: string
  apellido_paterno: string
  apellido_materno?: string
  nombre_japones?: string
  nombre_kanji?: string
  nombre_japones_registrado?: boolean

  generacion: Generacion
  id_familia?: number
  nueva_familia?: {
    apellido_jp: string
    apellido_kanji?: string
    prefectura_origen?: string
    anio_llegada_mexico?: number
    lugar_llegada?: string
  }

  fecha_nacimiento: string
  genero: Genero
  lugar_nacimiento?: string

  telefono_principal: string
  ciudad?: string
  estado: string

  nivel_japones?: NivelJapones
  ha_recibido_beca?: boolean
  acepta_directorio_publico: boolean
  acepta_comunicaciones: boolean
}

export const TOTAL_PASOS = 5

export const PASOS_LABELS: Record<number, string> = {
  1: 'Tu nombre',
  2: 'Tu origen Nikkei',
  3: 'Datos personales',
  4: 'Cómo contactarte',
  5: 'Tus preferencias',
}

export const WIZARD_INITIAL_DATA: WizardData = {
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  nombre_japones: '',
  nombre_kanji: '',
  nombre_japones_registrado: false,

  generacion: '',
  id_familia: null,
  nueva_familia: null,

  fecha_nacimiento: '',
  genero: '',
  lugar_nacimiento: '',

  telefono_principal: '',
  ciudad: '',
  estado: 'Sinaloa',
  pais: '',

  nivel_japones: '',
  ha_recibido_beca: false,
  acepta_directorio_publico: false,
  acepta_comunicaciones: true,
}