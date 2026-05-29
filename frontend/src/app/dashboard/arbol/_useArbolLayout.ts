import { useMemo } from 'react'
import type { ArbolFamiliarResponse } from '@/lib/genealogiaApi'
import type { PersonaResumen } from '@/lib/genealogiaApi'
import { construirLayout, type RelacionInput } from './_layoutEngine'

export function useArbolLayout(arbol: ArbolFamiliarResponse | null) {
  return useMemo(() => {
    if (!arbol) return { nodes: [], edges: [] }

    const personas = new Map<number, PersonaResumen>()
    for (const p of arbol.personas) {
      personas.set(p.id_persona, {
        id_persona: p.id_persona,
        nombres: p.nombre_completo.split(' ')[0],
        apellido_paterno: '',
        apellido_materno: undefined,
        nombre_completo: p.nombre_completo,
        generacion: p.generacion,
        foto_perfil: p.foto_perfil,
        id_familia: p.id_familia,
        apellido_familia: p.apellido_familia,
        es_miembro_activo: p.es_miembro_activo,
      } as PersonaResumen)
    }

    const relaciones: RelacionInput[] = arbol.relaciones.map((r) => ({
      id_genealogia: r.id_genealogia,
      id_persona: r.id_persona,
      id_pariente: r.id_pariente,
      tipo_relacion: r.tipo_relacion,
      confirmado_ambas_partes: r.confirmado_ambas_partes,
    }))

    return construirLayout({ personas, relaciones, yoId: arbol.yo_id })
  }, [arbol])
}