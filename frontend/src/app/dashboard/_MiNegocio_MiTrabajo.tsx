'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  Briefcase,
  Search,
  Loader2,
  Check,
  X,
  Plus,
  MapPin,
  Pencil,
} from 'lucide-react'
import {
  miEmpleoApi,
  type EmpresaEmpleadora,
} from '@/lib/empresasMiembroApi'

export default function MiTrabajoBloque() {
  const [empleo, setEmpleo] = useState<EmpresaEmpleadora | null>(null)
  const [puesto, setPuesto] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)

  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState<EmpresaEmpleadora[]>([])
  const [buscando, setBuscando] = useState(false)
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<EmpresaEmpleadora | null>(null)
  const [puestoInput, setPuestoInput] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      const res = await miEmpleoApi.get()
      if (res.tiene_empleo && res.data) {
        setEmpleo(res.data)
        setPuesto(res.puesto ?? '')
      } else {
        setEmpleo(null)
        setPuesto('')
      }
    } catch {
      setEmpleo(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  // Búsqueda con debounce
  useEffect(() => {
    if (!editando) return
    if (empresaSeleccionada) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!busqueda.trim()) {
      setResultados([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setBuscando(true)
        const res = await miEmpleoApi.buscar(busqueda)
        setResultados(res.data || [])
      } catch {
        setResultados([])
      } finally {
        setBuscando(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [busqueda, editando, empresaSeleccionada])

  const iniciarEdicion = () => {
    setEditando(true)
    setBusqueda(empleo?.nombre_empresa ?? '')
    setEmpresaSeleccionada(empleo)
    setPuestoInput(puesto)
    setError('')
  }

  const cancelarEdicion = () => {
    setEditando(false)
    setBusqueda('')
    setEmpresaSeleccionada(null)
    setPuestoInput('')
    setError('')
    setResultados([])
  }

  const seleccionarEmpresa = (empresa: EmpresaEmpleadora) => {
    setEmpresaSeleccionada(empresa)
    setBusqueda(empresa.nombre_empresa)
    setResultados([])
  }

  const limpiarSeleccion = () => {
    setEmpresaSeleccionada(null)
    setBusqueda('')
  }

  const mostrarOpcionCrear =
    busqueda.trim().length >= 2 &&
    !empresaSeleccionada &&
    !buscando &&
    !resultados.some(
      (r) => r.nombre_empresa.toLowerCase().trim() === busqueda.toLowerCase().trim()
    )

  const guardarEmpleo = async () => {
    if (!empresaSeleccionada && !busqueda.trim()) {
      setError('Selecciona o escribe el nombre de tu empresa')
      return
    }

    setGuardando(true)
    setError('')

    try {
      let idEmpresaEmpleadora: number

      if (empresaSeleccionada) {
        idEmpresaEmpleadora = empresaSeleccionada.id_empresa_empleadora
      } else {
        const nuevaRes = await miEmpleoApi.crearEmpleadora({
          nombre_empresa: busqueda.trim(),
        })
        idEmpresaEmpleadora = nuevaRes.data.id_empresa_empleadora
      }

      await miEmpleoApi.actualizar({
        id_empresa_empleadora: idEmpresaEmpleadora,
        puesto: puestoInput.trim() || null,
      })

      setEditando(false)
      await cargar()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const quitarEmpleo = async () => {
    if (!confirm('¿Quitar tu empleo actual?')) return

    setGuardando(true)
    try {
      await miEmpleoApi.actualizar({
        id_empresa_empleadora: null,
        puesto: null,
      })
      cancelarEdicion()
      await cargar()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al quitar empleo')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase size={20} className="text-red-700" />
          <h3 className="font-serif text-xl text-red-800">Donde trabajo</h3>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-red-700" />
        </div>
      </div>
    )
  }

  if (editando) {
    return (
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2">
          <Briefcase size={20} className="text-red-700" />
          <h3 className="font-serif text-xl text-red-800">Donde trabajo</h3>
        </div>

        {/* Buscador */}
        <div>
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Nombre de la empresa
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setEmpresaSeleccionada(null)
              }}
              placeholder="Busca o escribe el nombre..."
              className="w-full text-base font-sans pl-11 pr-11 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
              autoFocus
            />
            {busqueda && (
              <button
                onClick={limpiarSeleccion}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Empresa seleccionada */}
          {empresaSeleccionada && (
            <div className="mt-2 p-3 bg-green-50 border-2 border-green-300 rounded-xl flex items-start gap-2">
              <Check size={16} className="text-green-700 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-semibold text-green-900">
                  Seleccionada: {empresaSeleccionada.nombre_empresa}
                </p>
                {empresaSeleccionada.ciudad && (
                  <p className="font-sans text-xs text-green-700 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />
                    {[empresaSeleccionada.ciudad, empresaSeleccionada.estado]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Resultados del autocomplete */}
          {!empresaSeleccionada && resultados.length > 0 && (
            <div className="mt-2 border-2 border-gray-200 rounded-xl bg-white overflow-hidden max-h-60 overflow-y-auto">
              {resultados.map((r) => (
                <button
                  key={r.id_empresa_empleadora}
                  onClick={() => seleccionarEmpresa(r)}
                  className="w-full text-left px-4 py-3 hover:bg-amber-50 border-b border-gray-100 last:border-0 cursor-pointer transition-colors"
                >
                  <p className="font-sans text-base font-semibold text-gray-900">
                    {r.nombre_empresa}
                  </p>
                  {r.ciudad && (
                    <p className="font-sans text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />
                      {[r.ciudad, r.estado].filter(Boolean).join(', ')}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Estado de búsqueda */}
          {buscando && (
            <p className="mt-2 text-sm font-sans text-gray-500 flex items-center gap-2">
              <Loader2 size={13} className="animate-spin" />
              Buscando...
            </p>
          )}

          {/* Opción de crear nueva */}
          {mostrarOpcionCrear && (
            <button
              onClick={() => {
              }}
              className="mt-2 w-full text-left p-3 border-2 border-dashed border-amber-300 rounded-xl bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-default"
            >
              <p className="font-sans text-sm text-amber-900 flex items-center gap-2">
                <Plus size={14} className="text-amber-700" />
                <span>
                  No encontramos esa empresa. Al guardar, agregaremos{' '}
                  <strong>{busqueda.trim()}</strong> como nueva.
                </span>
              </p>
            </button>
          )}
        </div>

        {/* Puesto */}
        <div>
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Tu puesto
            <span className="font-normal text-sm text-gray-400 ml-2">
              (opcional)
            </span>
          </label>
          <input
            type="text"
            value={puestoInput}
            onChange={(e) => setPuestoInput(e.target.value)}
            placeholder="Por ejemplo: Gerente, Desarrollador..."
            className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
          />
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-2">
            <X size={16} className="text-red-700 shrink-0 mt-0.5" />
            <p className="font-sans text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {empleo && (
            <button
              onClick={quitarEmpleo}
              disabled={guardando}
              className="sm:flex-1 min-h-12 px-5 py-2.5 bg-white border-2 border-red-300 hover:border-red-500 hover:bg-red-50 text-red-700 font-sans font-semibold text-base rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              Quitar empleo
            </button>
          )}
          <button
            onClick={cancelarEdicion}
            disabled={guardando}
            className="sm:flex-1 min-h-12 px-5 py-2.5 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-sans font-semibold text-base rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={guardarEmpleo}
            disabled={guardando || (!empresaSeleccionada && !busqueda.trim())}
            className="sm:flex-1 min-h-12 px-5 py-2.5 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 disabled:from-gray-300 disabled:to-gray-400 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {guardando ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check size={16} />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Sin empleo: CTA
  if (!empleo) {
    return (
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase size={20} className="text-red-700" />
          <h3 className="font-serif text-xl text-red-800">Donde trabajo</h3>
        </div>

        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center">
            <Briefcase size={28} className="text-amber-400" />
          </div>
          <div>
            <p className="font-serif text-lg text-gray-700 mb-1">
              ¿Trabajas en alguna empresa?
            </p>
            <p className="font-sans text-base text-gray-500 max-w-sm mx-auto leading-relaxed">
              Cuéntanos dónde trabajas para conectarte con otros miembros del
              gremio.
            </p>
          </div>
          <button
            onClick={iniciarEdicion}
            className="inline-flex items-center gap-2 min-h-13 px-6 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all duration-200 cursor-pointer"
          >
            <Plus size={18} />
            Agregar mi empleo
          </button>
        </div>
      </div>
    )
  }

  // Con empleo: card
  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <Briefcase size={20} className="text-red-700" />
          <h3 className="font-serif text-xl text-red-800">Donde trabajo</h3>
        </div>
        <button
          onClick={iniciarEdicion}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-sans font-semibold text-red-700 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        >
          <Pencil size={14} />
          Editar
        </button>
      </div>

      <div>
        <p className="font-serif text-lg text-gray-900 leading-tight">
          {empleo.nombre_empresa}
        </p>
        {puesto && (
          <p className="font-sans text-base text-amber-700 mt-1">{puesto}</p>
        )}
        {(empleo.ciudad || empleo.estado) && (
          <p className="font-sans text-sm text-gray-500 mt-2 flex items-center gap-1">
            <MapPin size={11} />
            {[empleo.ciudad, empleo.estado].filter(Boolean).join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}