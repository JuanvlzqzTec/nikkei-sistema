'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { Search, X, Loader2, Users, ChevronRight, Filter } from 'lucide-react'
import { miembrosApi, type MiembroListItem, type MiembroDetalle } from '@/lib/adminApi'

const GENERACION_LABEL: Record<string, string> = {
  issei: 'Issei (1ª)', nisei: 'Nisei (2ª)', sansei: 'Sansei (3ª)',
  yonsei: 'Yonsei (4ª)', gosei: 'Gosei (5ª)', roksei: 'Roksei (6ª)',
}

const GENERACIONES = ['issei', 'nisei', 'sansei', 'yonsei', 'gosei', 'roksei']

function Avatar({ foto, nombre, size = 10 }: { foto?: string; nombre: string; size?: number }) {
  const cls = `w-${size} h-${size} rounded-full shrink-0 overflow-hidden bg-red-100 flex items-center justify-center`
  return foto ? (
    <div className={cls} style={{ width: size * 4, height: size * 4 }}>
      <Image src={foto} alt={nombre} width={size * 4} height={size * 4} className="object-cover w-full h-full" />
    </div>
  ) : (
    <div className={cls} style={{ width: size * 4, height: size * 4 }}>
      <span className="text-red-800 font-semibold font-serif" style={{ fontSize: size * 1.6 }}>
        {nombre.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

function Campo({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-sans text-gray-800 mt-0.5">{value}</p>
    </div>
  )
}

function ModalDetalle({ id, onClose }: { id: number; onClose: () => void }) {
  const [detalle, setDetalle] = useState<MiembroDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    miembrosApi.getDetalle(id)
      .then(r => setDetalle(r.data))
      .catch(() => setError('No se pudo cargar el perfil'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif text-lg text-gray-900">Perfil del miembro</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-red-800" size={28} />
            </div>
          )}

          {error && (
            <p className="text-center text-red-600 font-sans text-sm py-8">{error}</p>
          )}

          {detalle && (
            <div className="space-y-6">

              {/* Cabecera del perfil */}
              <div className="flex items-center gap-4">
                <Avatar foto={detalle.foto_perfil} nombre={detalle.nombres} size={16} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-xl text-gray-900">
                    {[detalle.nombres, detalle.apellido_paterno, detalle.apellido_materno].filter(Boolean).join(' ')}
                  </h3>
                  {detalle.nombre_kanji && (
                    <p className="text-sm text-gray-400 font-serif">{detalle.nombre_kanji}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium">
                      {GENERACION_LABEL[detalle.generacion] ?? detalle.generacion}
                    </span>
                    <span className={`text-xs font-sans px-2 py-0.5 rounded-full font-medium ${
                      detalle.es_miembro_activo
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {detalle.es_miembro_activo ? 'Miembro activo' : 'Inactivo'}
                    </span>
                    {detalle.familia && (
                      <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                        Familia {detalle.familia.apellido_jp}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Datos personales */}
              <div>
                <p className="text-xs font-sans font-bold text-gray-400 uppercase tracking-widest mb-3">Datos personales</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <Campo label="Nombre japonés" value={detalle.nombre_japones} />
                  <Campo label="Género" value={detalle.genero} />
                  <Campo label="Fecha de nacimiento" value={detalle.fecha_nacimiento} />
                  <Campo label="Lugar de nacimiento" value={detalle.lugar_nacimiento} />
                  <Campo label="Estado civil" value={detalle.estado_civil} />
                  <Campo label="Nivel de japonés" value={detalle.nivel_japones} />
                  {detalle.nombre_japones_registrado !== undefined && (
                    <div>
                      <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider">Nombre japonés registrado</p>
                      <p className="text-sm font-sans text-gray-800 mt-0.5">
                        {detalle.nombre_japones_registrado ? 'Sí' : 'No'}
                      </p>
                    </div>
                  )}
                  <Campo label="Fecha de ingreso" value={detalle.fecha_ingreso_asociacion} />
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Contacto */}
              <div>
                <p className="text-xs font-sans font-bold text-gray-400 uppercase tracking-widest mb-3">Contacto</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <Campo label="Correo de cuenta" value={detalle.email} />
                  <Campo label="Correo personal" value={detalle.email_personal} />
                  <Campo label="Teléfono principal" value={detalle.telefono_principal} />
                  <Campo label="Teléfono alternativo" value={detalle.telefono_alternativo} />
                  <Campo label="Ciudad" value={detalle.ciudad} />
                  <Campo label="Estado" value={detalle.estado} />
                  <Campo label="Código postal" value={detalle.codigo_postal} />
                  <Campo label="Dirección" value={detalle.direccion_completa} />
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Preferencias */}
              <div>
                <p className="text-xs font-sans font-bold text-gray-400 uppercase tracking-widest mb-3">Preferencias</p>
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs font-sans px-3 py-1.5 rounded-full border ${
                    detalle.participa_eventos ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    {detalle.participa_eventos ? '✓' : '✗'} Participa en eventos
                  </span>
                  <span className={`text-xs font-sans px-3 py-1.5 rounded-full border ${
                    detalle.acepta_directorio_publico ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    {detalle.acepta_directorio_publico ? '✓' : '✗'} En directorio público
                  </span>
                  <span className={`text-xs font-sans px-3 py-1.5 rounded-full border ${
                    detalle.acepta_comunicaciones ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    {detalle.acepta_comunicaciones ? '✓' : '✗'} Acepta comunicaciones
                  </span>
                  <span className={`text-xs font-sans px-3 py-1.5 rounded-full border ${
                    detalle.ha_recibido_beca ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    {detalle.ha_recibido_beca ? '✓' : '✗'} Ha recibido beca
                  </span>
                </div>
              </div>

              {/* Empleo */}
              {(detalle.empleo || detalle.empresa_propia) && (
                <>
                  <div className="h-px bg-gray-100" />
                  <div>
                    <p className="text-xs font-sans font-bold text-gray-400 uppercase tracking-widest mb-3">Situación laboral</p>
                    <div className="space-y-2">
                      {detalle.empresa_propia && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                          <p className="text-[10px] font-sans font-bold text-amber-600 uppercase tracking-wider mb-1">Empresa propia</p>
                          <p className="text-sm font-sans font-semibold text-gray-800">{detalle.empresa_propia.nombre_empresa}</p>
                          {detalle.empresa_propia.giro_comercial && (
                            <p className="text-xs text-gray-500 font-sans">{detalle.empresa_propia.giro_comercial}</p>
                          )}
                          <span className={`text-[10px] font-sans px-2 py-0.5 rounded-full mt-1 inline-block ${
                            detalle.empresa_propia.status_aprobacion === 'aprobada'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {detalle.empresa_propia.status_aprobacion}
                          </span>
                        </div>
                      )}
                      {detalle.empleo && (
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                          <p className="text-[10px] font-sans font-bold text-blue-600 uppercase tracking-wider mb-1">Empleado en</p>
                          <p className="text-sm font-sans font-semibold text-gray-800">{detalle.empleo.nombre_empresa}</p>
                          {detalle.puesto && (
                            <p className="text-xs text-gray-500 font-sans">{detalle.puesto}</p>
                          )}
                          {detalle.empleo.ciudad && (
                            <p className="text-xs text-gray-400 font-sans">{detalle.empleo.ciudad}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MiembrosPage() {
  const [miembros, setMiembros] = useState<MiembroListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [generacionFiltro, setGeneracionFiltro] = useState('')
  const [activoFiltro, setActivoFiltro] = useState('')
  const [miembroSeleccionado, setMiembroSeleccionado] = useState<number | null>(null)

  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      const res = await miembrosApi.getAll()
      setMiembros(res.data || [])
    } catch {
      // silencioso — la lista queda vacía
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // Filtrado en cliente para búsqueda en tiempo real sin debounce
  const lista = useMemo(() => {
    return miembros.filter(m => {
      const nombreCompleto = `${m.nombres} ${m.apellido_paterno} ${m.apellido_materno ?? ''} ${m.familia_apellido}`.toLowerCase()
      const emailMatch = m.email?.toLowerCase().includes(busqueda.toLowerCase()) ?? false
      const matchBusqueda = !busqueda || nombreCompleto.includes(busqueda.toLowerCase()) || emailMatch
      const matchGen = !generacionFiltro || m.generacion === generacionFiltro
      const matchActivo = !activoFiltro || String(m.es_miembro_activo) === activoFiltro
      return matchBusqueda && matchGen && matchActivo
    })
  }, [miembros, busqueda, generacionFiltro, activoFiltro])

  const activos = useMemo(() => miembros.filter(m => m.es_miembro_activo).length, [miembros])

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-serif text-gray-900">Miembros</h1>
          <p className="text-sm text-gray-500 font-sans mt-0.5">
            Directorio completo de personas registradas en el sistema.
          </p>
        </div>
        {!loading && (
          <div className="flex gap-3 shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-center">
              <p className="text-[10px] font-sans text-gray-400 uppercase tracking-wide">Total</p>
              <p className="text-xl font-serif text-gray-800">{miembros.length}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-center">
              <p className="text-[10px] font-sans text-green-600 uppercase tracking-wide">Activos</p>
              <p className="text-xl font-serif text-green-800">{activos}</p>
            </div>
          </div>
        )}
      </div>

      {/* Buscador y filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, apellido, correo o familia..."
            className="w-full pl-9 pr-4 py-2.5 text-sm font-sans border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 bg-white"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-gray-400 shrink-0" />
            <select
              value={generacionFiltro}
              onChange={e => setGeneracionFiltro(e.target.value)}
              className="text-sm font-sans border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-400 bg-white cursor-pointer"
            >
              <option value="">Todas las generaciones</option>
              {GENERACIONES.map(g => (
                <option key={g} value={g}>{GENERACION_LABEL[g]}</option>
              ))}
            </select>
          </div>

          <select
            value={activoFiltro}
            onChange={e => setActivoFiltro(e.target.value)}
            className="text-sm font-sans border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-400 bg-white cursor-pointer"
          >
            <option value="">Todos</option>
            <option value="true">Solo activos</option>
            <option value="false">Solo inactivos</option>
          </select>
        </div>
      </div>

      {/* Contador de resultados */}
      {!loading && (busqueda || generacionFiltro || activoFiltro) && (
        <p className="text-xs font-sans text-gray-400">
          {lista.length} {lista.length === 1 ? 'resultado' : 'resultados'}
        </p>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-red-800" size={28} />
        </div>
      ) : lista.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="w-14 h-14 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <Users size={24} className="text-gray-300" />
          </div>
          <p className="font-serif text-gray-600 text-lg mb-1">
            {busqueda || generacionFiltro || activoFiltro ? 'Sin resultados' : 'No hay miembros registrados'}
          </p>
          {(busqueda || generacionFiltro || activoFiltro) && (
            <button
              onClick={() => { setBusqueda(''); setGeneracionFiltro(''); setActivoFiltro('') }}
              className="mt-2 text-red-700 text-sm font-sans underline cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50 overflow-hidden">
          {lista.map(m => (
            <button
              key={m.id_persona}
              onClick={() => setMiembroSeleccionado(m.id_persona)}
              className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50/70 transition-colors text-left group"
            >
              <Avatar foto={m.foto_perfil} nombre={m.nombres} size={10} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-sans font-semibold text-sm text-gray-800 truncate">
                    {[m.nombres, m.apellido_paterno, m.apellido_materno].filter(Boolean).join(' ')}
                  </p>
                  <span className={`text-[10px] font-sans px-1.5 py-0.5 rounded-full shrink-0 ${
                    m.es_miembro_activo ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {m.es_miembro_activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-xs font-sans text-red-700">
                    {GENERACION_LABEL[m.generacion] ?? m.generacion}
                  </span>
                  <span className="text-xs font-sans text-gray-400">
                    Familia {m.familia_apellido}
                  </span>
                  {m.ciudad && (
                    <span className="text-xs font-sans text-gray-400">{m.ciudad}</span>
                  )}
                </div>
              </div>

              <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Modal detalle */}
      {miembroSeleccionado && (
        <ModalDetalle
          id={miembroSeleccionado}
          onClose={() => setMiembroSeleccionado(null)}
        />
      )}
    </div>
  )
}