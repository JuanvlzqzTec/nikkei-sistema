import Image from 'next/image'
import { MapPin, ArrowRight, Globe } from 'lucide-react'
import { type Empresa, getSectorColor } from './_types'

interface Props {
  empresa: Empresa
  onClick: () => void
}

export default function EmpresaCard({ empresa, onClick }: Props) {
  const inicial = empresa.nombre_empresa.charAt(0).toUpperCase()

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Cabecera con logo */}
      <div className="relative h-36 bg-linear-to-br from-amber-50 to-orange-100 overflow-hidden shrink-0">
        {empresa.logo_empresa ? (
          <>
            <Image
              src={empresa.logo_empresa}
              alt={empresa.nombre_empresa}
              fill
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-serif text-amber-300/60 select-none">
              {inicial}
            </span>
          </div>
        )}

        {/* Badge sector/giro */}
        {empresa.giro_comercial && (
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getSectorColor(empresa.giro_comercial)}`}>
              {empresa.giro_comercial}
            </span>
          </div>
        )}

        {/* Indicador de sitio web */}
        {empresa.sitio_web && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Globe size={13} className="text-amber-700" />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-1 gap-2">
        <h3 className="font-serif text-gray-900 text-lg leading-snug group-hover:text-red-800 transition-colors line-clamp-2">
          {empresa.nombre_empresa}
        </h3>

        {empresa.descripcion && (
          <p className="text-sm font-sans text-gray-500 leading-relaxed line-clamp-2 flex-1">
            {empresa.descripcion}
          </p>
        )}

        {/* Pie */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
          {(empresa.ciudad || empresa.estado) && (
            <span className="flex items-center gap-1 text-xs font-sans text-gray-400">
              <MapPin size={11} />
              {[empresa.ciudad, empresa.estado].filter(Boolean).join(', ')}
            </span>
          )}
          <span className="flex items-center gap-1 text-sm font-sans font-semibold text-red-700 group-hover:gap-2 transition-all ml-auto">
            Ver más <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </button>
  )
}