'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { X, Calendar, Tag } from 'lucide-react'
import { type GaleriaItem, CATEGORIA_LABELS, CATEGORIA_COLORS, CATEGORIA_SOLID, getFechaDisplay } from './_types'

interface Props {
  item: GaleriaItem
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
}

export default function GaleriaModal({ item, onClose, onPrev, onNext, hasPrev, hasNext }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onPrev?.()
      if (e.key === 'ArrowRight' && hasNext) onNext?.()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose, onPrev, onNext, hasPrev, hasNext])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-10 overflow-hidden">

        {/* Imagen grande */}
        <div className="relative bg-gray-900" style={{ aspectRatio: '16/9' }}>
          <Image
            src={item.url_imagen}
            alt={item.titulo}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 768px"
          />

          {/* Cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>

          {/* Navegación prev/next */}
          {hasPrev && (
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors text-lg font-serif"
            >
              ‹
            </button>
          )}
          {hasNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors text-lg font-serif"
            >
              ›
            </button>
          )}
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">

          {/* Título */}
          <h2 className="font-serif text-2xl text-gray-900 leading-tight">
            {item.titulo}
          </h2>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3">
            {item.fecha_hito && (
              <div className="flex items-center gap-1.5 text-base font-sans text-gray-500">
                <span>{getFechaDisplay(item)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm font-sans">
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${CATEGORIA_COLORS[item.categoria]}`}>
                {CATEGORIA_LABELS[item.categoria]}
              </span>
            </div>
          </div>

          {/* Descripción */}
          {item.descripcion ? (
            <>
              <div className="h-px bg-gray-100" />
              <p className="text-base font-sans text-gray-600 leading-relaxed">
                {item.descripcion}
              </p>
            </>
          ) : (
            <p className="text-sm font-sans text-gray-400 italic">
              Sin descripción disponible para este elemento.
            </p>
          )}

          {/* Pie decorativo */}
          <div className="pt-2 text-center">
            <span className="font-serif text-red-900/10 text-3xl select-none">歴</span>
          </div>
        </div>
      </div>
    </div>
  )
}