'use client'

import { useState, useEffect, useCallback } from 'react'
import { LayoutGrid, Clock } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import GaleriaGrid from './_GaleriaGrid'
import GaleriaTimeline from './_GaleriaTimeline'
import GaleriaModal from './_GaleriaModal'
import { type GaleriaItem } from './_types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Skeleton para el grid
function SkeletonGrid() {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {[260, 200, 320, 180, 280, 220, 300, 170].map((h, i) => (
        <div
          key={i}
          className="break-inside-avoid rounded-xl bg-gray-100 animate-pulse"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  )
}

export default function HistoriaPage() {
  const [items, setItems] = useState<GaleriaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [vista, setVista] = useState<'grid' | 'timeline'>('timeline')
  const [itemActivo, setItemActivo] = useState<GaleriaItem | null>(null)
  const [indexActivo, setIndexActivo] = useState<number>(-1)

  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)
      const res = await fetch(`${API_URL}/api/v1/galeria/`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setItems(data.data || [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const handleSelect = (item: GaleriaItem) => {
    const idx = items.findIndex((i) => i.id_galeria === item.id_galeria)
    setIndexActivo(idx)
    setItemActivo(item)
  }

  const handlePrev = () => {
    if (indexActivo > 0) {
      const prev = items[indexActivo - 1]
      setIndexActivo(indexActivo - 1)
      setItemActivo(prev)
    }
  }

  const handleNext = () => {
    if (indexActivo < items.length - 1) {
      const next = items[indexActivo + 1]
      setIndexActivo(indexActivo + 1)
      setItemActivo(next)
    }
  }

  // Contar categorías únicas
  const categoriasUnicas = new Set(items.map((i) => i.categoria)).size
  const anioMasAntiguo = items
    .filter((i) => i.fecha_hito)
    .map((i) => new Date(i.fecha_hito!).getFullYear())
    .sort((a, b) => a - b)[0]

  return (
    <>
      <SiteHeader variant="page" />

      <div
        className="min-h-screen"
        style={{ background: 'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)' }}
      >
        {/* Header con patrón de puntos */}
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle, #8B2635 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          <div className="relative z-10 container-nikkei pt-12 pb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 pt-2">
                <h1 className="text-4xl lg:text-5xl font-serif text-gray-900 leading-tight">
                  歴史の記録
                </h1>
                <h2 className="text-2xl font-serif text-red-800">
                  Archivo Histórico
                </h2>
                <div className="w-16 h-0.5 bg-linear-to-r from-red-700 to-amber-400 rounded-full" />
                <p className="text-lg font-sans text-gray-600 max-w-lg">
                  Memoria visual de nuestra comunidad. Fotografías, personajes y momentos
                  que forjan la identidad Nikkei en Sinaloa a través del tiempo.
                </p>
              </div>

              {/* Contadores */}
              {!loading && items.length > 0 && (
                <div className="flex gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-3xl font-serif text-red-800">{items.length}</p>
                    <p className="text-xs font-sans text-gray-500 uppercase tracking-wider">Fotografías</p>
                  </div>
                  {categoriasUnicas > 0 && (
                    <>
                      <div className="w-px bg-red-200" />
                      <div className="text-center">
                        <p className="text-3xl font-serif text-gray-500">{categoriasUnicas}</p>
                        <p className="text-xs font-sans text-gray-500 uppercase tracking-wider">Categorías</p>
                      </div>
                    </>
                  )}
                  {anioMasAntiguo && (
                    <>
                      <div className="w-px bg-red-200" />
                      <div className="text-center">
                        <p className="text-3xl font-serif text-gray-500">{anioMasAntiguo}</p>
                        <p className="text-xs font-sans text-gray-500 uppercase tracking-wider">Primer registro</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ola de transición */}
        <div className="relative -mb-1">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full block"
          >
            <path
              d="M0 10 L0 35 Q360 65 720 35 Q1080 5 1440 35 L1440 60 L0 60 Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Contenido principal */}
        <div className="bg-white">
          <div className="container-nikkei pt-8 pb-20">

            {/* Tabs de vista */}
            <div className="flex gap-1 bg-gray-100 p-1.5 rounded-2xl w-fit mb-10 shadow-sm">
             <button
                onClick={() => setVista('timeline')}
                className={`px-6 py-2.5 rounded-xl text-base font-sans font-semibold transition-all duration-200 flex items-center gap-2 ${
                  vista === 'timeline'
                    ? 'bg-red-800 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                <Clock size={16} />
                Línea de tiempo
              </button>
              <button
                onClick={() => setVista('grid')}
                className={`px-6 py-2.5 rounded-xl text-base font-sans font-semibold transition-all duration-200 flex items-center gap-2 ${
                  vista === 'grid'
                    ? 'bg-red-800 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                <LayoutGrid size={16} />
                Galería
              </button>
            </div>

            {/* Estados */}
            {error ? (
              <div className="text-center py-24">
                <p className="text-gray-400 font-sans mb-4">
                  No se pudo cargar el archivo histórico.
                </p>
                <button
                  onClick={cargar}
                  className="text-red-700 font-sans text-sm underline cursor-pointer hover:text-red-900"
                >
                  Intentar de nuevo
                </button>
              </div>
            ) : loading ? (
              <SkeletonGrid />
            ) : vista === 'grid' ? (
              <GaleriaGrid items={items} onSelect={handleSelect} />
            ) : (
              <GaleriaTimeline items={items} onSelect={handleSelect} />
            )}

            {/* Pie decorativo */}
            {!loading && items.length > 0 && (
              <div className="text-center mt-16 pt-12 border-t border-gray-100">
                <p className="font-serif text-4xl text-red-900/10 select-none">歴</p>
                <p className="text-xs font-sans text-gray-400 mt-2 uppercase tracking-wider">
                  Nikkei Culiacán AC · Sinaloa
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {itemActivo && (
        <GaleriaModal
          item={itemActivo}
          onClose={() => setItemActivo(null)}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={indexActivo > 0}
          hasNext={indexActivo < items.length - 1}
        />
      )}
    </>
  )
}