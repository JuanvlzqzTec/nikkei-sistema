'use client'

import { useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
  type Edge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Loader2, Trash2, X } from 'lucide-react'
import PersonaNode from './_PersonaNode'
import { useArbolLayout } from './_useArbolLayout'
import { genealogiaApi } from '@/lib/genealogiaApi'

import type { ArbolFamiliarResponse } from '@/lib/genealogiaApi'

interface Props {
  arbol: ArbolFamiliarResponse
  onUpdated: () => void
}

export default function ArbolView({ arbol, onUpdated }: Props) {
  const nodeTypes: NodeTypes = useMemo(() => ({ persona: PersonaNode }), [])
  const { nodes, edges } = useArbolLayout(arbol)
  const [edgeActivo, setEdgeActivo] = useState<Edge | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState('')

  const handleEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setEdgeActivo(edge)
    setError('')
  }

  const handleEliminar = async () => {
    if (!edgeActivo) return
    const id = parseInt(edgeActivo.id.replace('e-', ''), 10)
    if (isNaN(id)) return

    setEliminando(true)
    setError('')
    try {
      await genealogiaApi.eliminarRelacion(id)
      setEdgeActivo(null)
      onUpdated()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <>
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
          elementsSelectable
          onEdgeClick={handleEdgeClick}
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

      {/* Modal al hacer clic en edge */}
      {edgeActivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !eliminando && setEdgeActivo(null)}
          />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-xl text-red-800 leading-tight">
                  Relación: {String(edgeActivo.label)}
                </h3>
                <p className="font-sans text-sm text-gray-500 mt-1">
                  ¿Quieres eliminar esta relación de tu árbol?
                </p>
              </div>
              <button
                onClick={() => setEdgeActivo(null)}
                disabled={eliminando}
                className="text-gray-400 hover:text-gray-700 cursor-pointer disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-sm font-sans text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setEdgeActivo(null)}
                disabled={eliminando}
                className="flex-1 min-h-12 px-5 py-2.5 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-sans font-semibold text-base rounded-xl cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminando}
                className="flex-1 min-h-12 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-sans font-semibold text-base rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {eliminando ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}