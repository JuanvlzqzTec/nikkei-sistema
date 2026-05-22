'use client'

import { Building2 } from 'lucide-react'
import MiEmpresaBloque from './_MiNegocio_MiEmpresa'
import MiTrabajoBloque from './_MiNegocio_MiTrabajo'

export default function MiNegocio() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Building2 size={20} className="text-red-700" />
        <h2 className="font-serif text-2xl text-red-800">
          Mi empresa y trabajo
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MiEmpresaBloque />
        <MiTrabajoBloque />
      </div>
    </section>
  )
}