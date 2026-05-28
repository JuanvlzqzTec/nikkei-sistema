'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import dagre from 'dagre'
import { Loader2, ArrowLeft, Users, GitBranch, Eye, EyeOff } from 'lucide-react'
import { adminArbolesApi, type ArbolFamiliaResponse } from '@/lib/adminArbolesApi'
import PersonaNode, { type PersonaNodeData } from '@/app/dashboard/arbol/_PersonaNode'
import { TIPO_RELACION_LABELS, NIVEL_GENERACION } from '@/app/dashboard/arbol/_constants'

const NODE_WIDTH = 208
const NODE_HEIGHT = 140

export default function AdminArbolFamiliaPage() {
  const params = useParams<{ id: string }>()
  const idFamilia = parseInt(params.id, 10)

  const [arbol, setArbol] = useState<ArbolFamiliaResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNaN(idFamilia)) return
    const cargar = async () => {
      try {
        setLoading(true)
        const res = await adminArbolesApi.getArbolFamilia(idFamilia)
        setArbol(res)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error al cargar árbol')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [idFamilia])

  const nodeTypes: NodeTypes = useMemo(() => ({ persona: PersonaNode }), [])

  const { nodes, edges } = useMemo(() => {
    if (!arbol) return { nodes: [] as Node[], edges: [] as Edge[] }

    const nodos: Node[] = arbol.personas.map((p) => ({
      id: `p-${p.id_persona}`,
      type: 'persona',
      position: { x: 0, y: 0 },
      data: {
        persona: {
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
        },
        esYo: false,
      } as PersonaNodeData,
    }))

    const aristas: Edge[] = arbol.relaciones.map((r) => {
      const nivel = NIVEL_GENERACION[r.tipo_relacion] ?? 0
      let source: string
      let target: string
      if (nivel > 0) {
        source = `p-${r.id_pariente}`
        target = `p-${r.id_persona}`
      } else {
        source = `p-${r.id_persona}`
        target = `p-${r.id_pariente}`
      }
      return {
        id: `e-${r.id_genealogia}`,
        source,
        target,
        label: TIPO_RELACION_LABELS[r.tipo_relacion] ?? r.tipo_relacion,
        labelStyle: { fontSize: 11, fontWeight: 600, fill: '#8B2635' },
        labelBgStyle: { fill: '#FEF7F0', fillOpacity: 0.95 },
        labelBgPadding: [4, 6],
        labelBgBorderRadius: 4,
        style: {
          stroke: r.confirmado_ambas_partes ? '#8B2635' : '#D97706',
          strokeWidth: 2,
          strokeDasharray: r.confirmado_ambas_partes ? undefined : '6 4',
        },
        animated: !r.confirmado_ambas_partes,
      }
    })

    // Layout con dagre
    const g = new dagre.graphlib.Graph()
    g.setDefaultEdgeLabel(() => ({}))
    g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 90 })
    nodos.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
    aristas.forEach((e) => g.setEdge(e.source, e.target))
    dagre.layout(g)

    const posicionados = nodos.map((n) => {
      const pos = g.node(n.id)
      return {
        ...n,
        position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      }
    })

    return { nodes: posicionados, edges: aristas }
  }, [arbol])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-red-800" size={32} />
      </div>
    )
  }

  if (error || !arbol) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Link href="/admin/arboles" className="inline-flex items-center gap-2 text-sm font-sans text-red-700 hover:text-red-900">
          <ArrowLeft size={15} /> Volver a familias
        </Link>
        <div className="text-center py-16 bg-white rounded-xl border border-red-200">
          <p className="font-sans text-red-700">{error || 'No se pudo cargar el árbol'}</p>
        </div>
      </div>
    )
  }

  const miembrosActivos = arbol.personas.filter((p) => p.es_miembro_activo).length
  const miembrosPublicos = arbol.personas.filter((p) => p.es_publico).length

  return (
    <div className="space-y-5 max-w-6xl">
      <Link href="/admin/arboles" className="inline-flex items-center gap-2 text-sm font-sans text-red-700 hover:text-red-900 cursor-pointer">
        <ArrowLeft size={15} /> Volver a familias
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-serif text-gray-900">
            Familia {arbol.familia.apellido_jp}
            {arbol.familia.apellido_kanji && (
              <span className="ml-2 text-base text-gray-400">({arbol.familia.apellido_kanji})</span>
            )}
          </h1>
          {arbol.familia.prefectura_origen && (
            <p className="text-sm text-gray-500 font-sans mt-0.5">
              Origen: {arbol.familia.prefectura_origen}
              {arbol.familia.anio_llegada_mexico && ` · Llegó a México en ${arbol.familia.anio_llegada_mexico}`}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Users size={16} />} label="Total miembros" value={arbol.personas.filter((p) => p.id_familia === arbol.familia.id_familia).length} />
        <StatCard icon={<Eye size={16} />} label="Públicos" value={miembrosPublicos} />
        <StatCard icon={<EyeOff size={16} />} label="Privados" value={arbol.personas.length - miembrosPublicos} />
        <StatCard icon={<GitBranch size={16} />} label="Activos" value={miembrosActivos} />
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 text-xs font-sans text-gray-500 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-red-700" /> Confirmada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-600" /> Pendiente
        </span>
        <span className="ml-auto text-gray-400">Vista de solo lectura</span>
      </div>

      {arbol.personas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-sm text-gray-400 font-sans">Esta familia no tiene miembros registrados todavía.</p>
        </div>
      ) : (
        <div className="w-full h-150 rounded-2xl border-2 border-amber-100 bg-white overflow-hidden shadow-sm">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
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
      )}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-serif text-xl text-gray-900 leading-none">{value}</p>
        <p className="font-sans text-xs text-gray-500 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  )
}