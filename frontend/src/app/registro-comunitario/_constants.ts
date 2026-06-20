import type { Generacion, Genero, NivelJapones } from './_types'

export const DRAFT_STORAGE_KEY = 'nikkei_registro_comunitario_draft'

export const GENERACIONES: { value: Generacion; label: string; descripcion: string }[] = [
  { value: 'issei',  label: 'Issei',  descripcion: 'Primera generación — Nací en Japón y emigré a México' },
  { value: 'nisei',  label: 'Nisei',  descripcion: 'Segunda generación — Mis padres nacieron en Japón' },
  { value: 'sansei', label: 'Sansei', descripcion: 'Tercera generación — Mis abuelos nacieron en Japón' },
  { value: 'yonsei', label: 'Yonsei', descripcion: 'Cuarta generación — Mis bisabuelos nacieron en Japón' },
  { value: 'gosei',  label: 'Gosei',  descripcion: 'Quinta generación — Mis tatarabuelos nacieron en Japón' },
  { value: 'roksei', label: 'Roksei', descripcion: 'Sexta generación o más lejana' },
]

export const GENEROS: { value: Genero; label: string }[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino',  label: 'Femenino' },
]

export const NIVELES_JAPONES: { value: NivelJapones; label: string; descripcion: string }[] = [
  { value: 'ninguno',     label: 'Ninguno',     descripcion: 'No hablo japonés' },
  { value: 'basico',      label: 'Básico',      descripcion: 'Algunas palabras o frases' },
  { value: 'intermedio',  label: 'Intermedio',  descripcion: 'Puedo tener conversaciones simples' },
  { value: 'avanzado',    label: 'Avanzado',    descripcion: 'Hablo japonés con fluidez' },
  { value: 'nativo',      label: 'Nativo',      descripcion: 'Es mi lengua materna' },
]

export const ESTADOS_MEXICO: string[] = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Coahuila',
  'Colima',
  'Durango',
  'Estado de México',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
  'Otro/Extranjero',
]

export const ESTADO_OTRO_EXTRANJERO = 'Otro/Extranjero'

export const PREFECTURAS_JAPON: string[] = [
  'Aichi',
  'Akita',
  'Aomori',
  'Chiba',
  'Ehime',
  'Fukui',
  'Fukuoka',
  'Fukushima',
  'Gifu',
  'Gunma',
  'Hiroshima',
  'Hokkaido',
  'Hyogo',
  'Ibaraki',
  'Ishikawa',
  'Iwate',
  'Kagawa',
  'Kagoshima',
  'Kanagawa',
  'Kochi',
  'Kumamoto',
  'Kyoto',
  'Mie',
  'Miyagi',
  'Miyazaki',
  'Nagano',
  'Nagasaki',
  'Nara',
  'Niigata',
  'Oita',
  'Okayama',
  'Okinawa',
  'Osaka',
  'Saga',
  'Saitama',
  'Shiga',
  'Shimane',
  'Shizuoka',
  'Tochigi',
  'Tokushima',
  'Tokyo',
  'Tottori',
  'Toyama',
  'Wakayama',
  'Yamagata',
  'Yamaguchi',
  'Yamanashi',
]

export const ANIO_LLEGADA_MIN = 1880
export const ANIO_LLEGADA_MAX = new Date().getFullYear()