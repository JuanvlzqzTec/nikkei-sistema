import Image from 'next/image'
import { type GaleriaItem, CATEGORIA_LABELS, CATEGORIA_COLORS } from './_types'

interface Props {
  items: GaleriaItem[]
  onSelect: (item: GaleriaItem) => void
}

export default function GaleriaGrid({ items, onSelect }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="font-serif text-xl text-gray-400">No hay fotografías disponibles.</p>
      </div>
    )
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {items.map((item, index) => (
        <button
          key={item.id_galeria}
          onClick={() => onSelect(item)}
          className="group w-full break-inside-avoid block text-left relative overflow-hidden rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          {/* Imagen */}
          <div className="relative overflow-hidden">
            <Image
              src={item.url_imagen}
              alt={item.titulo}
              width={600}
              height={400}
              className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ height: 'auto' }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

            {/* Contenido en hover */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
              <span className={`text-[11px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full self-start mb-2 ${CATEGORIA_COLORS[item.categoria]}`}>
                {CATEGORIA_LABELS[item.categoria]}
              </span>
              <h3 className="font-serif text-white text-base leading-tight">
                {item.titulo}
              </h3>
              {item.fecha_hito && (
                <p className="text-white/60 font-sans text-sm mt-1">
                  {new Date(item.fecha_hito).getFullYear()}
                </p>
              )}
            </div>

            {/* Badge año siempre visible */}
            {item.fecha_hito && (
              <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white font-serif text-sm px-2 py-0.5 rounded-full group-hover:opacity-0 transition-opacity duration-300">
                {new Date(item.fecha_hito).getFullYear()}
              </div>
            )}
          </div>

          {/* Pie siempre visible */}
          <div className="bg-white px-4 py-3 border-b border-l border-r border-gray-100 rounded-b-xl group-hover:hidden">
            <span className={`text-[11px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORIA_COLORS[item.categoria]}`}>
              {CATEGORIA_LABELS[item.categoria]}
            </span>
            <p className="font-serif text-gray-800 text-base mt-1.5 leading-snug line-clamp-2">
              {item.titulo}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}