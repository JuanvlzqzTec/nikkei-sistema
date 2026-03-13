'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, X, Check, Loader2, Calendar, MapPin } from 'lucide-react'
import { eventosApi, type Evento } from '@/lib/adminApi'
import { Button } from '@/components/ui/button'

const TIPOS = ['matsuri', 'reunion', 'cultural', 'deportivo', 'educativo', 'empresarial', 'ceremonia']
const STATUS_OPTS = ['borrador', 'publicado', 'en_curso', 'finalizado', 'cancelado']

const STATUS_COLORS: Record<string, string> = {
  borrador: 'bg-gray-100 text-gray-600',
  publicado: 'bg-green-100 text-green-700',
  en_curso: 'bg-blue-100 text-blue-700',
  finalizado: 'bg-purple-100 text-purple-700',
  cancelado: 'bg-red-100 text-red-600',
}

const emptyForm = {
  titulo: '', descripcion: '', tipo_evento: 'matsuri', fecha_inicio: '',
  fecha_fin: '', ubicacion: '', ciudad: '', capacidad_maxima: '',
  imagen_evento: '', link_transmision: '', requisitos: '',
  contacto_organizador: '', status: 'publicado', es_publico: true, requiere_registro: true,
}

export default function EventosAdminPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [filterStatus, setFilterStatus] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await eventosApi.getAll(filterStatus ? { status: filterStatus } : undefined)
      setEventos(res.data || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar eventos')
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { load() }, [load])

  const f = (key: keyof typeof emptyForm, val: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: val }))

  const openCreate = () => {
    setEditingEvento(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (ev: Evento) => {
    setEditingEvento(ev)
    setForm({
      titulo: ev.titulo,
      descripcion: ev.descripcion || '',
      tipo_evento: ev.tipo_evento,
      fecha_inicio: ev.fecha_inicio?.slice(0, 16) || '',
      fecha_fin: ev.fecha_fin?.slice(0, 16) || '',
      ubicacion: ev.ubicacion || '',
      ciudad: ev.ciudad || '',
      capacidad_maxima: ev.capacidad_maxima?.toString() || '',
      imagen_evento: ev.imagen_evento || '',
      link_transmision: ev.link_transmision || '',
      requisitos: ev.requisitos || '',
      contacto_organizador: ev.contacto_organizador || '',
      status: ev.status,
      es_publico: ev.es_publico,
      requiere_registro: ev.requiere_registro,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.titulo.trim()) { setError('El título es requerido'); return }
    if (!form.fecha_inicio) { setError('La fecha de inicio es requerida'); return }
    if (!form.tipo_evento) { setError('El tipo de evento es requerido'); return }

    try {
      setSaving(true)
      setError('')
      const payload = {
        ...form,
        capacidad_maxima: form.capacidad_maxima ? Number(form.capacidad_maxima) : undefined,
        fecha_fin: form.fecha_fin || undefined,
      }
      if (editingEvento) {
        await eventosApi.update(editingEvento.id_evento, payload)
        setSuccess('Evento actualizado')
      } else {
        await eventosApi.create(payload)
        setSuccess('Evento creado')
      }
      setShowModal(false)
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este evento?')) return
    try {
      await eventosApi.delete(id)
      setSuccess('Evento eliminado')
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  const handleStatus = async (id: number, status: string) => {
    try {
      await eventosApi.updateStatus(id, status)
      setSuccess('Status actualizado')
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al actualizar status')
    }
  }

  // Próximos publicados (los que aparecerán en homepage)
  const proximos = eventos
    .filter((e) => e.status === 'publicado' && new Date(e.fecha_inicio) > new Date())
    .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())
    .slice(0, 2)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-serif text-gray-900">Eventos</h1>
          <p className="text-sm text-gray-500 font-sans mt-0.5">
            Los 2 próximos publicados aparecen automáticamente en el homepage.
          </p>
        </div>
        <Button onClick={openCreate} className="btn-nikkei text-sm py-2 px-4">
          <Plus size={16} /> Crear evento
        </Button>
      </div>

      {/* Homepage preview */}
      {proximos.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-green-700 font-sans uppercase tracking-wide mb-2">
            Aparecerán en el homepage
          </p>
          <div className="flex flex-wrap gap-3">
            {proximos.map((ev) => (
              <div key={ev.id_evento} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-200 text-sm font-sans text-green-800">
                <Calendar size={13} />
                <span className="font-medium">{ev.titulo}</span>
                <span className="text-green-500 text-xs">
                  {new Date(ev.fecha_inicio).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-sans">
          <X size={15} />{error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-sans">
          <Check size={15} />{success}
          <button onClick={() => setSuccess('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Filtro */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
            filterStatus === '' ? 'bg-red-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Todos
        </button>
        {STATUS_OPTS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors capitalize ${
              filterStatus === s ? 'bg-red-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-red-800" size={28} /></div>
      ) : eventos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 font-sans text-sm">No hay eventos todavía.</p>
          <button onClick={openCreate} className="mt-3 text-red-700 text-sm font-sans underline">Crear el primero</button>
        </div>
      ) : (
        <div className="space-y-3">
          {eventos.map((ev) => (
            <div key={ev.id_evento} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-start">
              {/* Imagen */}
              {ev.imagen_evento && (
                <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <Image src={ev.imagen_evento} alt={ev.titulo} fill className="object-cover" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-sans px-2 py-0.5 rounded-full ${STATUS_COLORS[ev.status] || 'bg-gray-100 text-gray-600'}`}>
                        {ev.status}
                      </span>
                      <span className="text-xs text-gray-400 font-sans bg-gray-100 px-2 py-0.5 rounded-full">
                        {ev.tipo_evento}
                      </span>
                    </div>
                    <p className="font-sans font-semibold text-gray-800 mt-1">{ev.titulo}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 font-sans flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(ev.fecha_inicio).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {ev.ciudad && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {ev.ubicacion ? `${ev.ubicacion}, ` : ''}{ev.ciudad}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Quick status */}
                    <select
                      value={ev.status}
                      onChange={(e) => handleStatus(ev.id_evento, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 font-sans text-gray-600 focus:outline-none focus:border-red-400"
                    >
                      {STATUS_OPTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button onClick={() => openEdit(ev)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(ev.id_evento)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-serif text-gray-900 text-lg">
                {editingEvento ? 'Editar evento' : 'Crear evento'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Título */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.titulo}
                    onChange={(e) => f('titulo', e.target.value)}
                    placeholder="Nombre del evento"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.tipo_evento}
                    onChange={(e) => f('tipo_evento', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  >
                    {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => f('status', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  >
                    {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Fecha inicio */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">
                    Fecha inicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.fecha_inicio}
                    onChange={(e) => f('fecha_inicio', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Fecha fin */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Fecha fin</label>
                  <input
                    type="datetime-local"
                    value={form.fecha_fin}
                    onChange={(e) => f('fecha_fin', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Ubicación / Venue</label>
                  <input
                    type="text"
                    value={form.ubicacion}
                    onChange={(e) => f('ubicacion', e.target.value)}
                    placeholder="Nombre del lugar"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Ciudad</label>
                  <input
                    type="text"
                    value={form.ciudad}
                    onChange={(e) => f('ciudad', e.target.value)}
                    placeholder="Culiacán"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Capacidad */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Capacidad máxima</label>
                  <input
                    type="number"
                    value={form.capacidad_maxima}
                    onChange={(e) => f('capacidad_maxima', e.target.value)}
                    placeholder="Ilimitada si se deja vacío"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Imagen */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">URL de imagen</label>
                  <input
                    type="text"
                    value={form.imagen_evento}
                    onChange={(e) => f('imagen_evento', e.target.value)}
                    placeholder="https://... o /assets/..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Descripción */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Descripción</label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => f('descripcion', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400 resize-none"
                  />
                </div>

                {/* Contacto */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Contacto organizador</label>
                  <input
                    type="text"
                    value={form.contacto_organizador}
                    onChange={(e) => f('contacto_organizador', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Link transmisión */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Link transmisión</label>
                  <input
                    type="text"
                    value={form.link_transmision}
                    onChange={(e) => f('link_transmision', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Checkboxes */}
                <div className="sm:col-span-2 flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-sans text-gray-700">
                    <input type="checkbox" checked={form.es_publico} onChange={(e) => f('es_publico', e.target.checked)} className="w-4 h-4 rounded accent-red-700" />
                    Evento público
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-sans text-gray-700">
                    <input type="checkbox" checked={form.requiere_registro} onChange={(e) => f('requiere_registro', e.target.checked)} className="w-4 h-4 rounded accent-red-700" />
                    Requiere registro
                  </label>
                </div>
              </div>

              {error && <p className="text-xs text-red-600 font-sans">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-sans text-gray-600 hover:text-gray-800">
                Cancelar
              </button>
              <Button onClick={handleSave} disabled={saving} className="btn-nikkei text-sm py-2 px-5">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {editingEvento ? 'Guardar cambios' : 'Crear evento'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}