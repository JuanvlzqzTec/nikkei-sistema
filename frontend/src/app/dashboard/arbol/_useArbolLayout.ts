import { useMemo } from 'react'
import type { MiArbolResponse } from '@/lib/genealogiaApi'
import { construirLayout, type RelacionInput } from './_layoutEngine'

export function useArbolLayout(arbol: MiArbolResponse | null) {
  return useMemo(() => {
    if (!arbol) return { nodes: [], edges: [] }

    // Mapa de personas: yo + todos los parientes
    const personas = new Map()
    personas.set(arbol.yo.id_persona, arbol.yo)
    for (const rel of arbol.relaciones) {
      personas.set(rel.pariente.id_persona, rel.pariente)
    }

    // En MiArbol, cada relación es "yo → pariente" con tipo_relacion ya
    // ajustado a la perspectiva de "yo". Reconstruimos el input del motor.
    const relaciones: RelacionInput[] = arbol.relaciones.map((rel) => ({
      id_genealogia: rel.id_genealogia,
      id_persona: arbol.yo.id_persona,
      id_pariente: rel.pariente.id_persona,
      tipo_relacion: rel.tipo_relacion,
      confirmado_ambas_partes: rel.confirmado_ambas_partes,
    }))

    return construirLayout({ personas, relaciones, yoId: arbol.yo.id_persona })
  }, [arbol])
}