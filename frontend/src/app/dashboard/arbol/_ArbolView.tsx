'use client'

import { useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import PersonaNode from './_PersonaNode'
import { useArbolLayout } from './_useArbolLayout'
import type { MiArbolResponse } from '@/lib/genealogiaApi'

interface Props {
  arbol: MiArbolResponse
}

export default function ArbolView({ arbol }: Props) {
  const nodeTypes: NodeTypes = useMemo(() => ({ persona: PersonaNode }), [])
  const { nodes, edges } = useArbolLayout(arbol)

  return (
    <div className="w-full h-150 sm:h-175 rounded-2xl border-2 border-amber-100 bg-white overflow-hidden shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#D4AF37" gap={20} size={1} style={{ opacity: 0.15 }} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor="#FEF7F0"
          nodeStrokeColor="#8B2635"
          maskColor="rgba(254, 247, 240, 0.6)"
          style={{ background: '#FEF7F0' }}
        />
      </ReactFlow>
    </div>
  )
}