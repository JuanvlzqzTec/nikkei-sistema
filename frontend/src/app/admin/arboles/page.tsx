'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, GitBranch, Users, ChevronRight, Search, X } from 'lucide-react'
import { adminArbolesApi, type FamiliaConArbol } from '@/lib/adminArbolesApi'

export default function AdminArbolesPage() {
  const [familias, setFamilias] = useState<FamiliaConArbol[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true)
        const res = await adminArbolesApi.listarFamilias()
        setFamilias(res.data || [])
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error al cargar familias')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const filtradas = familias.filter((f) => {
    if (!busqueda.trim()) return true
    const q = busqueda.toLowerCase().trim()
    return (
      f.apellido_jp.toLowerCase().includes(q) ||
      f.apellido_kanji?.toLowerCase().includes(q) ||
      f.prefectura_origen?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-serif text-gray-900">Árboles Familiares</h1>
        <p className="text-sm text-gray-500 font-sans mt-0.5">
          Explora visualmente los árboles genealógicos de cada familia registrada.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-sans">
          <X size={15} />{error}
        </div>
      )}

      {/* Buscador */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar familia por apellido o prefectura..."
          className="w-full text-sm font-sans pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none"
        />
        {busqueda && (
          <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer">
            <X size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-red-800" size={28} /></div>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 font-sans text-sm">
            {busqueda ? 'No hay familias que coincidan con la búsqueda.' : 'No hay familias registradas aún.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map((f) => (
            <Link
              key={f.id_familia}
              href={`/admin/arboles/${f.id_familia}`}
              className="group bg-white rounded-xl border border-gray-200 hover:border-red-400 hover:shadow-md transition-all p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
                  <GitBranch size={18} />
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-red-700 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className="font-serif text-lg text-gray-900 leading-tight group-hover:text-red-800">
                  Familia {f.apellido_jp}
                  {f.apellido_kanji && (
                    <span className="ml-2 text-sm text-gray-400">({f.apellido_kanji})</span>
                  )}
                </p>
                {f.prefectura_origen && (
                  <p className="text-xs text-gray-500 font-sans mt-0.5">
                    {f.prefectura_origen}
                    {f.anio_llegada_mexico && ` · llegó en ${f.anio_llegada_mexico}`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100 text-xs font-sans text-gray-500">
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {f.total_miembros} {f.total_miembros === 1 ? 'miembro' : 'miembros'}
                </span>
                <span className="flex items-center gap-1">
                  <GitBranch size={11} />
                  {f.total_relaciones} {f.total_relaciones === 1 ? 'relación' : 'relaciones'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}