import Image from 'next/image'
import { type GaleriaItem, CATEGORIA_LABELS, CATEGORIA_SOLID, getAnio } from './_types'

interface Props {
  items: GaleriaItem[]
  onSelect: (item: GaleriaItem) => void
}

// Agrupar items por década
function agruparPorDecada(items: GaleriaItem[]): Map<string, GaleriaItem[]> {
  const grupos = new Map<string, GaleriaItem[]>()

  // Primero los que no tienen fecha
  const sinFecha = items.filter((i) => !i.fecha_hito)
  if (sinFecha.length > 0) grupos.set('Sin fecha', sinFecha)

  // Los que tienen fecha, ordenados y agrupados por década
  const conFecha = items
    .filter((i) => i.fecha_hito)
    .sort((a, b) => new Date(a.fecha_hito!).getTime() - new Date(b.fecha_hito!).getTime())

  for (const item of conFecha) {
    const anio = parseInt(getAnio(item))
    const decada = isNaN(anio) ? 'Sin fecha' : `${Math.floor(anio / 10) * 10}s`
    if (!grupos.has(decada)) grupos.set(decada, [])
    grupos.get(decada)!.push(item)
  }

  return grupos
}

export default function GaleriaTimeline({ items, onSelect }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="font-serif text-xl text-gray-400">No hay elementos para mostrar.</p>
      </div>
    )
  }

  const grupos = agruparPorDecada(items)

  return (
    <div className="relative">
      {/* Línea central de tiempo — solo desktop */}
      <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-linear-to-b from-red-200 via-amber-200 to-red-200 opacity-60" />

      <div className="space-y-16">
        {Array.from(grupos.entries()).map(([decada, grupoItems], grupoIndex) => (
          <div key={decada}>
            {/* Encabezado de década */}
            <div className="relative flex items-center justify-center mb-10">
              {/* Línea decorativa */}
              <div className="absolute inset-x-0 h-px bg-linear-to-r from-transparent via-red-300 to-transparent" />

              <div className="relative z-10 bg-white border border-red-200 rounded-full px-6 py-2 shadow-sm">
                <span className="font-serif text-red-800 text-lg">{decada}</span>
              </div>
            </div>

            {/* Items de esta década */}
            <div className="space-y-8">
              {grupoItems.map((item, itemIndex) => {
                const isLeft = itemIndex % 2 === 0
                const anio = getAnio(item)

                return (
                  <div key={item.id_galeria} className="relative">
                    {/* Punto en la línea central — solo desktop */}
                    <div className="hidden lg:flex absolute left-1/2 top-8 -translate-x-1/2 z-10 items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-red-700 border-2 border-white shadow-sm" />
                    </div>

                    {/* Layout alternado desktop / stack mobile */}
                    <div className={`flex flex-col lg:flex-row items-start gap-6 lg:gap-0 ${isLeft ? '' : 'lg:flex-row-reverse'}`}>

                      {/* Panel de la tarjeta */}
                      <div className={`w-full lg:w-[calc(50%-2rem)] ${isLeft ? 'lg:pr-8' : 'lg:pl-8'}`}>
                        <button
                          onClick={() => onSelect(item)}
                          className="group w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-400 hover:-translate-y-1 overflow-hidden"
                        >
                          {/* Imagen */}
                          <div className="relative h-52 overflow-hidden bg-amber-50">
                            <Image
                              src={item.url_imagen}
                              alt={item.titulo}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

                            {/* Año sobre imagen */}
                            {anio && (
                              <span className="absolute bottom-3 right-3 font-serif text-white/90 text-2xl leading-none">
                                {anio}
                              </span>
                            )}
                          </div>

                          {/* Contenido */}
                          <div className="p-5">
                            <h3 className="font-serif text-gray-900 text-lg leading-tight group-hover:text-red-800 transition-colors">
                              {item.titulo}
                            </h3>
                            {item.descripcion && (
                              <p className="text-base font-sans text-gray-500 mt-2 leading-relaxed line-clamp-2">
                                {item.descripcion}
                              </p>
                            )}
                            <p className="text-xs font-sans text-red-700 mt-3 font-semibold">
                              Ver más →
                            </p>
                          </div>
                        </button>
                      </div>

                      {/* Espacio opuesto en desktop */}
                      <div className="hidden lg:block lg:w-[calc(50%-2rem)]" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pie de línea de tiempo */}
      <div className="relative flex items-center justify-center mt-16">
        <div className="absolute inset-x-0 h-px bg-linear-to-r from-transparent via-red-200 to-transparent" />
        <div className="relative z-10 bg-white border border-red-200 rounded-full px-6 py-2 shadow-sm">
          <span className="font-serif text-red-400 text-base">根 · Raíces</span>
        </div>
      </div>
    </div>
  )
}