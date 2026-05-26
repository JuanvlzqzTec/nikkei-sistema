'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Loader2, Check, X, ClipboardList, Filter, Sparkles, RefreshCw } from 'lucide-react'
import { registrosPendientesApi, type RegistroPendiente } from '@/lib/adminApi'
import RegistroCard from './_RegistroCard'
import ModalConfirmacion from './_ModalConfirmacion'

type FiltroFamilia = 'todos' | 'familia_nueva' | 'familia_existente' | 'nuevo_registro' | 'cambio_solicitado'

export default function RegistrosPendientesPage() {
  const [registros, setRegistros] = useState<RegistroPendiente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [filtro, setFiltro] = useState<FiltroFamilia>('todos')

  const [modalState, setModalState] = useState<{
    modo: 'aprobar' | 'rechazar'
    registro: RegistroPendiente
  } | null>(null)

  // Estado de "procesando" por id de user (para deshabilitar la card durante la op)
  const [procesandoId, setProcesandoId] = useState<number | null>(null)

  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await registrosPendientesApi.getPendientes()
      setRegistros(res.data || [])
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudieron cargar los registros pendientes'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const listaFiltrada = useMemo(() => {
    if (filtro === 'familia_nueva') return registros.filter((r) => r.familia_es_nueva)
    if (filtro === 'familia_existente') return registros.filter((r) => !r.familia_es_nueva)
    if (filtro === 'nuevo_registro') return registros.filter((r) => r.motivo_pendiente === 'nuevo_registro')
    if (filtro === 'cambio_solicitado') return registros.filter((r) => r.motivo_pendiente === 'cambio_solicitado')
    return registros
  }, [registros, filtro])

  const conteoFamiliaNueva = useMemo(
    () => registros.filter((r) => r.familia_es_nueva).length,
    [registros]
  )

  const conteoCambioSolicitado = useMemo(
    () => registros.filter((r) => r.motivo_pendiente === 'cambio_solicitado').length,
    [registros]
  )

  const conteoNuevoRegistro = useMemo(
    () => registros.filter((r) => r.motivo_pendiente === 'nuevo_registro').length,
    [registros]
  )

  const handleAbrirAprobar = (registro: RegistroPendiente) => {
    setModalState({ modo: 'aprobar', registro })
  }

  const handleAbrirRechazar = (registro: RegistroPendiente) => {
    setModalState({ modo: 'rechazar', registro })
  }

  const handleConfirmar = async (motivo?: string) => {
    if (!modalState) return
    const { modo, registro } = modalState
    setProcesandoId(registro.id_user)

    try {
      if (modo === 'aprobar') {
        await registrosPendientesApi.aprobar(registro.id_user)
        setSuccess(
          `Registro de ${registro.persona.nombres} ${registro.persona.apellido_paterno} aprobado exitosamente`
        )
      } else {
        await registrosPendientesApi.rechazar(registro.id_user, motivo)
        setSuccess(
          `Registro de ${registro.persona.nombres} ${registro.persona.apellido_paterno} rechazado`
        )
      }
      // Quitar el registro de la lista local sin recargar
      setRegistros((prev) => prev.filter((r) => r.id_user !== registro.id_user))
      setModalState(null)
    } catch (e: unknown) {
      // El error se muestra dentro del modal; el throw lo captura allá
      throw e
    } finally {
      setProcesandoId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-serif text-gray-900">
            Registros Comunitarios
          </h1>
          <p className="text-sm text-gray-500 font-sans mt-0.5">
            Revisa y aprueba las solicitudes de nuevos miembros de la comunidad.
          </p>
        </div>
        {!loading && registros.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            <p className="text-xs font-sans text-amber-700 uppercase tracking-wide">
              Pendientes
            </p>
            <p className="text-2xl font-serif text-amber-800 leading-none mt-0.5">
              {registros.length}
            </p>
          </div>
        )}
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
          <button
            onClick={() => setSuccess('')}
            className="ml-auto cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filtros */}
      {!loading && registros.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-gray-400" />
          <button
            onClick={() => setFiltro('todos')}
            className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
              filtro === 'todos'
                ? 'bg-red-800 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Todos ({registros.length})
          </button>
          <button
            onClick={() => setFiltro('nuevo_registro')}
            className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors flex items-center gap-1 ${
              filtro === 'nuevo_registro'
                ? 'bg-green-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Sparkles size={11} />
            Nuevos registros ({conteoNuevoRegistro})
          </button>
          <button
            onClick={() => setFiltro('cambio_solicitado')}
            className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors flex items-center gap-1 ${
              filtro === 'cambio_solicitado'
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <RefreshCw size={11} />
            Cambios solicitados ({conteoCambioSolicitado})
          </button>
          <button
            onClick={() => setFiltro('familia_nueva')}
            className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors flex items-center gap-1 ${
              filtro === 'familia_nueva'
                ? 'bg-amber-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Sparkles size={11} />
            Con familia nueva ({conteoFamiliaNueva})
          </button>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-red-800" size={28} />
        </div>
      ) : registros.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="w-14 h-14 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-3">
            <Check size={24} className="text-green-600" />
          </div>
          <p className="font-serif text-gray-700 text-lg mb-1">
            No hay solicitudes pendientes
          </p>
          <p className="text-sm text-gray-400 font-sans">
            Todas las solicitudes han sido revisadas. Volveremos cuando alguien
            nuevo se registre.
          </p>
        </div>
      ) : listaFiltrada.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <ClipboardList size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-sans">
            No hay solicitudes que coincidan con este filtro.
          </p>
          <button
            onClick={() => setFiltro('todos')}
            className="mt-3 text-red-700 text-sm font-sans underline cursor-pointer"
          >
            Ver todas
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {listaFiltrada.map((registro) => (
            <RegistroCard
              key={registro.id_user}
              registro={registro}
              onAprobar={() => handleAbrirAprobar(registro)}
              onRechazar={() => handleAbrirRechazar(registro)}
              procesando={procesandoId === registro.id_user}
            />
          ))}
        </div>
      )}

      {/* Modal de confirmación */}
      {modalState && (
        <ModalConfirmacion
          modo={modalState.modo}
          nombrePersona={[
            modalState.registro.persona.nombres,
            modalState.registro.persona.apellido_paterno,
            modalState.registro.persona.apellido_materno,
          ]
            .filter(Boolean)
            .join(' ')}
          emailUsuario={modalState.registro.email}
          familiaEsNueva={modalState.registro.familia_es_nueva}
          apellidoFamilia={modalState.registro.familia.apellido_jp}
          onConfirm={handleConfirmar}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  )
}