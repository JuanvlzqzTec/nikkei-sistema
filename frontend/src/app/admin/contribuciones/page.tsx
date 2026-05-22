'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, Check, X, MessageSquare, Filter } from 'lucide-react'
import {
  contribucionesAdminApi,
  type ContribucionAdmin,
} from '@/lib/contribucionesApi'
import ContribucionCard from './_ContribucionCard'

type Filtro = 'pendiente' | 'atendida' | 'descartada' | 'todos'

export default function ContribucionesAdminPage() {
  const [items, setItems] = useState<ContribucionAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('pendiente')
  const [procesandoId, setProcesandoId] = useState<number | null>(null)

  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await contribucionesAdminApi.getPendientes(filtro)
      setItems(res.data || [])
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudieron cargar las contribuciones'
      )
    } finally {
      setLoading(false)
    }
  }, [filtro])

  useEffect(() => {
    cargar()
  }, [cargar])

  const handleMarcar = async (
    id: number,
    estado: 'atendida' | 'descartada',
    notaAdmin?: string
  ) => {
    setProcesandoId(id)
    try {
      await contribucionesAdminApi.marcarEstado(id, estado, notaAdmin)
      setSuccess(
        estado === 'atendida'
          ? 'Contribución marcada como atendida'
          : 'Contribución descartada'
      )
      // Quitar de la lista actual si el filtro no la incluye
      if (filtro !== 'todos' && filtro !== estado) {
        setItems((prev) => prev.filter((i) => i.id_contribucion !== id))
      } else {
        await cargar()
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al actualizar')
    } finally {
      setProcesandoId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-serif text-gray-900">Contribuciones</h1>
          <p className="text-sm text-gray-500 font-sans mt-0.5">
            Materiales, historias y donaciones ofrecidas por miembros de la comunidad.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-sans">
          <X size={15} />
          {error}
          <button onClick={() => setError('')} className="ml-auto cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-sans">
          <Check size={15} />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-gray-400" />
        {(['pendiente', 'atendida', 'descartada', 'todos'] as Filtro[]).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors capitalize ${
              filtro === f
                ? 'bg-red-800 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'pendiente'
              ? '⏳ Pendientes'
              : f === 'atendida'
                ? '✅ Atendidas'
                : f === 'descartada'
                  ? '❌ Descartadas'
                  : 'Todas'}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-red-800" size={28} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <MessageSquare size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="font-serif text-gray-700 text-lg mb-1">
            {filtro === 'pendiente'
              ? 'Sin contribuciones pendientes'
              : 'No hay contribuciones en este estado'}
          </p>
          <p className="text-sm text-gray-400 font-sans">
            {filtro === 'pendiente'
              ? 'Cuando un miembro envíe una contribución, aparecerá aquí.'
              : 'Cambia el filtro para ver contribuciones en otro estado.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <ContribucionCard
              key={c.id_contribucion}
              contribucion={c}
              onMarcar={(estado, nota) =>
                handleMarcar(c.id_contribucion, estado, nota)
              }
              procesando={procesandoId === c.id_contribucion}
            />
          ))}
        </div>
      )}
    </div>
  )
}