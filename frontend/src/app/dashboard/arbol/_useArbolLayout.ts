import { useMemo } from 'react'
import type { Node, Edge } from 'reactflow'
import dagre from 'dagre'
import type { MiArbolResponse } from '@/lib/genealogiaApi'
import { TIPO_RELACION_LABELS, NIVEL_GENERACION } from './_constants'

const NODE_WIDTH = 208
const NODE_HEIGHT = 140

export function useArbolLayout(arbol: MiArbolResponse | null) {
  return useMemo(() => {
    if (!arbol) return { nodes: [], edges: [] }

    const nodes: Node[] = []
    const edges: Edge[] = []
    const personasMap = new Map<number, boolean>()

    // Nodo principal: yo
    nodes.push({
      id: `p-${arbol.yo.id_persona}`,
      type: 'persona',
      position: { x: 0, y: 0 },
      data: { persona: arbol.yo, esYo: true },
    })
    personasMap.set(arbol.yo.id_persona, true)

    // Nodos de parientes + edges
    for (const rel of arbol.relaciones) {
      const idP = rel.pariente.id_persona
      if (!personasMap.has(idP)) {
        nodes.push({
          id: `p-${idP}`,
          type: 'persona',
          position: { x: 0, y: 0 },
          data: { persona: rel.pariente, esYo: false },
        })
        personasMap.set(idP, true)
      }

      // Dirección del edge según generación
      const nivel = NIVEL_GENERACION[rel.tipo_relacion] ?? 0
      const idYo = arbol.yo.id_persona

      // Si el tipo es ascendente (padre, abuelo...) el pariente está ARRIBA
      // Si es descendente (hijo, nieto...) el pariente está ABAJO
      let source: string
      let target: string
      if (nivel > 0) {
        source = `p-${idP}`
        target = `p-${idYo}`
      } else if (nivel < 0) {
        source = `p-${idYo}`
        target = `p-${idP}`
      } else {
        source = `p-${idYo}`
        target = `p-${idP}`
      }

      edges.push({
        id: `e-${rel.id_genealogia}`,
        source,
        target,
        label: TIPO_RELACION_LABELS[rel.tipo_relacion] ?? rel.tipo_relacion,
        labelStyle: { fontSize: 11, fontWeight: 600, fill: '#8B2635' },
        labelBgStyle: { fill: '#FEF7F0', fillOpacity: 0.95 },
        labelBgPadding: [4, 6],
        labelBgBorderRadius: 4,
        style: {
          stroke: rel.confirmado_ambas_partes ? '#8B2635' : '#D97706',
          strokeWidth: 2,
          strokeDasharray: rel.confirmado_ambas_partes ? undefined : '6 4',
        },
        animated: !rel.confirmado_ambas_partes,
      })
    }

    // Layout automático con dagre
    const g = new dagre.graphlib.Graph()
    g.setDefaultEdgeLabel(() => ({}))
    g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80 })

    nodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
    edges.forEach((e) => g.setEdge(e.source, e.target))

    dagre.layout(g)

    const positioned = nodes.map((n) => {
      const pos = g.node(n.id)
      return {
        ...n,
        position: {
          x: pos.x - NODE_WIDTH / 2,
          y: pos.y - NODE_HEIGHT / 2,
        },
      }
    })

    return { nodes: positioned, edges }
  }, [arbol])
}