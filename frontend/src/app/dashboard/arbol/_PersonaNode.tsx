'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import Image from 'next/image'
import { User } from 'lucide-react'
import type { PersonaResumen } from '@/lib/genealogiaApi'

export interface PersonaNodeData {
  persona: PersonaResumen
  esYo?: boolean
}

function PersonaNodeBase({ data }: { data: PersonaNodeData }) {
  const { persona, esYo } = data

  return (
    <div
      className={`bg-white rounded-2xl border-2 shadow-sm hover:shadow-md transition-all p-4 w-52 ${
        esYo
          ? 'border-red-700 ring-2 ring-red-200'
          : 'border-amber-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="bg-amber-400! w-2! h-2!" />

      <div className="flex flex-col items-center gap-2">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-amber-100 border-2 border-white shadow-sm">
          {persona.foto_perfil ? (
            <Image src={persona.foto_perfil} alt={persona.nombre_completo} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={22} className="text-amber-400" />
            </div>
          )}
        </div>

        <div className="text-center min-w-0 w-full">
          <p className="font-serif text-sm text-gray-900 leading-tight truncate">
            {persona.nombre_completo}
          </p>
          <p className="font-sans text-xs text-amber-700 capitalize mt-0.5">
            {persona.generacion}
          </p>
          {esYo && (
            <span className="inline-block mt-1 text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              Tú
            </span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="bg-amber-400! w-2! h-2!" />
    </div>
  )
}

export default memo(PersonaNodeBase)