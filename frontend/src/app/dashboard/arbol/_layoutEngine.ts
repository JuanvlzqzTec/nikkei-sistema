import type { Node, Edge } from 'reactflow'
import dagre from 'dagre'
import type { PersonaResumen } from '@/lib/genealogiaApi'
import { TIPO_RELACION_LABELS, NIVEL_GENERACION } from './_constants'

const NODE_WIDTH = 208
const NODE_HEIGHT = 140

export interface RelacionInput {
  id_genealogia: number
  id_persona: number   // quien creó la relación
  id_pariente: number  // el otro
  tipo_relacion: string // tipo desde la perspectiva de id_persona
  confirmado_ambas_partes: boolean
}

export interface LayoutInput {
  personas: Map<number, PersonaResumen>
  relaciones: RelacionInput[]
  yoId?: number // opcional: marca el nodo "Tú"
}

/**
 * Motor de layout único para los árboles genealógicos.
 * - Relaciones verticales (padre/hijo/abuelo/nieto/tío/sobrino) → jerarquía arriba/abajo.
 * - Relaciones horizontales (hermano/esposo/primo/cuñado) → mismo nivel, conexión lateral.
 * - Handles laterales se eligen según la posición X real tras el layout.
 */
export function construirLayout({
  personas,
  relaciones,
  yoId,
}: LayoutInput): { nodes: Node[]; edges: Edge[] } {
  // 1. Nodos
  const nodes: Node[] = []
  for (const [id, persona] of personas) {
    nodes.push({
      id: `p-${id}`,
      type: 'persona',
      position: { x: 0, y: 0 },
      data: { persona, esYo: yoId === id },
    })
  }

  // 2. Edges
  const edges: Edge[] = relaciones.map((r) => {
    const nivel = NIVEL_GENERACION[r.tipo_relacion] ?? 0
    // nivel > 0: el pariente es de generación MAYOR → va arriba (source)
    // si no, el id_persona va arriba
    let source = `p-${r.id_persona}`
    let target = `p-${r.id_pariente}`
    if (nivel > 0) {
      source = `p-${r.id_pariente}`
      target = `p-${r.id_persona}`
    }

    return {
      id: `e-${r.id_genealogia}`,
      source,
      target,
      sourceHandle: 'bottom',
      targetHandle: 'top',
      type: 'smoothstep',
      label: TIPO_RELACION_LABELS[r.tipo_relacion] ?? r.tipo_relacion,
      labelStyle: { fontSize: 11, fontWeight: 600, fill: '#8B2635' },
      labelBgStyle: { fill: '#FEF7F0', fillOpacity: 0.95 },
      labelBgPadding: [4, 6] as [number, number],
      labelBgBorderRadius: 4,
      style: {
        stroke: r.confirmado_ambas_partes ? '#8B2635' : '#D97706',
        strokeWidth: 2,
        strokeDasharray: r.confirmado_ambas_partes ? undefined : '6 4',
      },
      animated: !r.confirmado_ambas_partes,
    }
  })

  // 3. Layout dagre — solo las relaciones verticales generan jerarquía
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 120, edgesep: 40 })

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
  relaciones.forEach((r, i) => {
    const nivel = NIVEL_GENERACION[r.tipo_relacion] ?? 0
    if (nivel === 0) return // hermanos/parejas no generan jerarquía vertical
    g.setEdge(edges[i].source, edges[i].target)
  })
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

  // 4. Handles laterales para relaciones horizontales según posición X real
  const posMap = new Map(positioned.map((n) => [n.id, n.position.x]))
  relaciones.forEach((r, i) => {
    const nivel = NIVEL_GENERACION[r.tipo_relacion] ?? 0
    if (nivel !== 0) return
    const xSource = posMap.get(edges[i].source) ?? 0
    const xTarget = posMap.get(edges[i].target) ?? 0
    if (xSource <= xTarget) {
      edges[i].sourceHandle = 'right'
      edges[i].targetHandle = 'left-target'
    } else {
      edges[i].sourceHandle = 'left'
      edges[i].targetHandle = 'right-target'
    }
  })

  return { nodes: positioned, edges }
}