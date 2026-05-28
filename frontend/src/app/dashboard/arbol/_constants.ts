export const TIPOS_RELACION = [
  { value: 'padre', label: 'Padre', categoria: 'ascendente' },
  { value: 'madre', label: 'Madre', categoria: 'ascendente' },
  { value: 'hijo', label: 'Hijo', categoria: 'descendente' },
  { value: 'hija', label: 'Hija', categoria: 'descendente' },
  { value: 'esposo', label: 'Esposo', categoria: 'horizontal' },
  { value: 'esposa', label: 'Esposa', categoria: 'horizontal' },
  { value: 'hermano', label: 'Hermano', categoria: 'horizontal' },
  { value: 'hermana', label: 'Hermana', categoria: 'horizontal' },
  { value: 'abuelo', label: 'Abuelo', categoria: 'ascendente' },
  { value: 'abuela', label: 'Abuela', categoria: 'ascendente' },
  { value: 'nieto', label: 'Nieto', categoria: 'descendente' },
  { value: 'nieta', label: 'Nieta', categoria: 'descendente' },
  { value: 'tio', label: 'Tío', categoria: 'ascendente' },
  { value: 'tia', label: 'Tía', categoria: 'ascendente' },
  { value: 'sobrino', label: 'Sobrino', categoria: 'descendente' },
  { value: 'sobrina', label: 'Sobrina', categoria: 'descendente' },
  { value: 'primo', label: 'Primo', categoria: 'horizontal' },
  { value: 'prima', label: 'Prima', categoria: 'horizontal' },
  { value: 'cuniado', label: 'Cuñado', categoria: 'horizontal' },
  { value: 'cuniada', label: 'Cuñada', categoria: 'horizontal' },
  { value: 'yerno', label: 'Yerno', categoria: 'descendente' },
  { value: 'nuera', label: 'Nuera', categoria: 'descendente' },
  { value: 'suegro', label: 'Suegro', categoria: 'ascendente' },
  { value: 'suegra', label: 'Suegra', categoria: 'ascendente' },
] as const

export const TIPO_RELACION_LABELS: Record<string, string> = Object.fromEntries(
  TIPOS_RELACION.map((t) => [t.value, t.label])
)

// Para layout: nivel generacional (positivo = ascendente, negativo = descendente, 0 = misma generación)
export const NIVEL_GENERACION: Record<string, number> = {
  abuelo: 2, abuela: 2, suegro: 2, suegra: 2,
  padre: 1, madre: 1, tio: 1, tia: 1,
  esposo: 0, esposa: 0, hermano: 0, hermana: 0, primo: 0, prima: 0, cuniado: 0, cuniada: 0,
  hijo: -1, hija: -1, yerno: -1, nuera: -1,
  nieto: -2, nieta: -2, sobrino: -1, sobrina: -1,
}