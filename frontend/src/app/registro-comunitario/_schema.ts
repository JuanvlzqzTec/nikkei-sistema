import { z } from 'zod'
import {
  ANIO_LLEGADA_MIN,
  ANIO_LLEGADA_MAX,
  ESTADO_OTRO_EXTRANJERO,
} from './_constants'

const optionalString = z
  .string()
  .trim()
  .transform((v) => (v === '' ? undefined : v))
  .optional()

export const paso1Schema = z.object({
  nombres: z
    .string()
    .trim()
    .min(1, 'Por favor escribe tu nombre')
    .max(150, 'El nombre es demasiado largo'),
  apellido_paterno: z
    .string()
    .trim()
    .min(1, 'Por favor escribe tu apellido paterno')
    .max(100, 'El apellido es demasiado largo'),
  apellido_materno: z
    .string()
    .trim()
    .min(1, 'Por favor escribe tu apellido materno. Si no tienes, escribe X')
    .max(100, 'El apellido es demasiado largo'),
  nombre_japones: z
    .string()
    .trim()
    .max(150)
    .optional()
    .or(z.literal('')),
  nombre_kanji: z
    .string()
    .trim()
    .max(150)
    .optional()
    .or(z.literal('')),
  nombre_japones_registrado: z.boolean(),
})

export const nuevaFamiliaSchema = z.object({
  apellido_jp: z
    .string()
    .trim()
    .min(1, 'Escribe el apellido de tu familia')
    .max(100, 'El apellido es demasiado largo'),
  apellido_kanji: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal('')),
  prefectura_origen: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal('')),
  anio_llegada_mexico: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine(
      (v) => {
        if (!v || v === '') return true
        const n = parseInt(v, 10)
        return !isNaN(n) && n >= ANIO_LLEGADA_MIN && n <= ANIO_LLEGADA_MAX
      },
      {
        message: `El año debe estar entre ${ANIO_LLEGADA_MIN} y ${ANIO_LLEGADA_MAX}`,
      }
    ),
  lugar_llegada: z
  .string()
  .trim()
  .max(150)
  .optional()
  .or(z.literal('')),
})

const paso2BaseSchema = z.object({
  generacion: z.enum(
    ['issei', 'nisei', 'sansei', 'yonsei', 'gosei', 'roksei'],
    { message: 'Por favor elige tu generación Nikkei' }
  ),
  id_familia: z.number().int().positive().nullable(),
  nueva_familia: nuevaFamiliaSchema.nullable(),
})

export const paso2Schema = paso2BaseSchema.refine(
  (data) => data.id_familia !== null || data.nueva_familia !== null,
  {
    message: 'Debes seleccionar tu familia o registrar una nueva',
    path: ['id_familia'],
  }
)

export const paso3Schema = z.object({
  fecha_nacimiento: z
    .string()
    .min(1, 'Por favor indícanos tu fecha de nacimiento')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido')
    .refine(
      (v) => {
        const d = new Date(v)
        if (isNaN(d.getTime())) return false
        const hoy = new Date()
        const hace150 = new Date()
        hace150.setFullYear(hoy.getFullYear() - 150)
        return d <= hoy && d >= hace150
      },
      { message: 'Por favor revisa la fecha' }
    ),
  genero: z.enum(['masculino', 'femenino'], {
  message: 'Por favor elige una opción',
  }),
  lugar_nacimiento: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal('')),
})

const paso4BaseSchema = z.object({
  telefono_principal: z
    .string()
    .trim()
    .min(1, 'Por favor escribe tu número de teléfono')
    .max(20, 'El teléfono es demasiado largo')
    .regex(
      /^[\d\s\-+().]+$/,
      'Solo se permiten números y los caracteres + - ( ) .'
    ),
  ciudad: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal('')),
  estado: z
    .string()
    .trim()
    .min(1, 'Por favor elige tu estado'),
  pais: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal('')),
})

export const paso4Schema = paso4BaseSchema.refine(
  (data) => {
    if (data.estado === ESTADO_OTRO_EXTRANJERO) {
      return data.pais && data.pais.trim().length > 0
    }
    return true
  },
  {
    message: 'Por favor indícanos tu país',
    path: ['pais'],
  }
)

export const paso5Schema = z.object({
  nivel_japones: z.enum(
    ['ninguno', 'basico', 'intermedio', 'avanzado', 'nativo'],
    { message: 'Por favor elige una opción' }
  ),
  ha_recibido_beca: z.boolean(),
  acepta_directorio_publico: z.boolean(),
  acepta_comunicaciones: z.boolean(),
})

export const wizardCompleteSchema = z.object({
  ...paso1Schema.shape,
  ...paso2BaseSchema.shape,
  ...paso3Schema.shape,
  ...paso4BaseSchema.shape,
  ...paso5Schema.shape,
})

export type Paso1FormData = z.infer<typeof paso1Schema>
export type Paso2FormData = z.infer<typeof paso2Schema>
export type Paso3FormData = z.infer<typeof paso3Schema>
export type Paso4FormData = z.infer<typeof paso4Schema>
export type Paso5FormData = z.infer<typeof paso5Schema>
export type NuevaFamiliaFormData = z.infer<typeof nuevaFamiliaSchema>

export function getSchemaForStep(step: number) {
  switch (step) {
    case 1: return paso1Schema
    case 2: return paso2Schema
    case 3: return paso3Schema
    case 4: return paso4Schema
    case 5: return paso5Schema
    default: return paso1Schema
  }
}