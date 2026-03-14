'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, X, Check, Loader2, Calendar, MapPin, Upload, ImageIcon } from 'lucide-react'
import { eventosApi, type Evento } from '@/lib/adminApi'
import { Button } from '@/components/ui/button'

const CLOUDINARY_CLOUD_NAME = 'dyfkeoc7a'
const CLOUDINARY_UPLOAD_PRESET = 'nikkei_default'

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
  contacto_organizador: '', status: 'publicado', requiere_registro: true,
}

function utcToLocalInput(utcString: string): string {
  if (!utcString) return ''
  const date = new Date(utcString)
  const localMs = date.getTime() - 7 * 60 * 60 * 1000
  const local = new Date(localMs)
  return local.toISOString().slice(0, 16)
}

function localInputToOffset(localStr: string): string {
  if (!localStr) return ''
  return `${localStr}:00-07:00`
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

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setUploadError('')
    setShowModal(true)
  }

  const openEdit = (ev: Evento) => {
    setEditingEvento(ev)
    setForm({
      titulo: ev.titulo,
      descripcion: ev.descripcion || '',
      tipo_evento: ev.tipo_evento,
      fecha_inicio: utcToLocalInput(ev.fecha_inicio),
      fecha_fin: ev.fecha_fin ? utcToLocalInput(ev.fecha_fin) : '',
      ubicacion: ev.ubicacion || '',
      ciudad: ev.ciudad || '',
      capacidad_maxima: ev.capacidad_maxima?.toString() || '',
      imagen_evento: ev.imagen_evento || '',
      link_transmision: ev.link_transmision || '',
      requisitos: ev.requisitos || '',
      contacto_organizador: ev.contacto_organizador || '',
      status: ev.status,
      requiere_registro: ev.requiere_registro,
    })
    setUploadError('')
    setShowModal(true)
  }

  const uploadToCloudinary = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Solo se permiten imágenes')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('La imagen no puede superar 10MB')
      return
    }
    setUploading(true)
    setUploadError('')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', 'nikkei-sinaloa/eventos')
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      if (data.secure_url) {
        f('imagen_evento', data.secure_url)
      } else {
        setUploadError('Error al subir imagen')
      }
    } catch {
      setUploadError('Error de conexión al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadToCloudinary(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadToCloudinary(file)
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
        fecha_inicio: localInputToOffset(form.fecha_inicio),
        fecha_fin: form.fecha_fin ? localInputToOffset(form.fecha_fin) : undefined,
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

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-red-800" size={28} /></div>
      ) : eventos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 font-sans text-sm">No hay eventos todavía.</p>
          <button onClick={openCreate} className="mt-3 text-red-700 text-sm font-sans underline cursor-pointer">Crear el primero</button>
        </div>
      ) : (
        <div className="space-y-3">
          {eventos.map((ev) => (
            <div key={ev.id_evento} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-start">
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
                      {ev.requiere_registro && (
                        <span className="text-xs text-blue-600 font-sans bg-blue-50 px-2 py-0.5 rounded-full">
                          Requiere registro
                        </span>
                      )}
                    </div>
                    <p className="font-sans font-semibold text-gray-800 mt-1">{ev.titulo}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 font-sans flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(ev.fecha_inicio).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Mazatlan' })}
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

                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Fecha fin</label>
                  <input
                    type="datetime-local"
                    value={form.fecha_fin}
                    onChange={(e) => f('fecha_fin', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

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

                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Ciudad</label>
                  <input
                    type="text"
                    value={form.ciudad}
                    onChange={(e) => f('ciudad', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

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

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">
                    Imagen del evento
                  </label>
                  {form.imagen_evento ? (
                    <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 group">
                      <Image src={form.imagen_evento} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="bg-white text-gray-800 text-xs font-sans font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-gray-100 transition-colors">
                          <Upload size={13} /> Cambiar
                        </button>
                        <button type="button" onClick={() => f('imagen_evento', '')}
                          className="bg-red-600 text-white text-xs font-sans font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-red-700 transition-colors">
                          <X size={13} /> Quitar
                        </button>
                      </div>
                      {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 size={24} className="animate-spin text-white" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                        dragOver ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-red-300 hover:bg-red-50/50'
                      }`}
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={22} className="animate-spin text-red-700" />
                          <p className="text-xs font-sans text-gray-500">Subiendo imagen...</p>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={22} className="text-gray-300" />
                          <p className="text-xs font-sans text-gray-500 text-center px-4">
                            Arrastra una imagen o <span className="text-red-700 font-medium">haz clic para seleccionar</span>
                          </p>
                          <p className="text-[10px] font-sans text-gray-400">JPG, PNG, WEBP · Máx 10MB</p>
                        </>
                      )}
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  {uploadError && <p className="text-xs text-red-600 font-sans mt-1.5">{uploadError}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Descripción</label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => f('descripcion', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Contacto organizador</label>
                  <input
                    type="text"
                    value={form.contacto_organizador}
                    onChange={(e) => f('contacto_organizador', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Link transmisión</label>
                  <input
                    type="text"
                    value={form.link_transmision}
                    onChange={(e) => f('link_transmision', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-sans text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.requiere_registro}
                      onChange={(e) => f('requiere_registro', e.target.checked)}
                      className="w-4 h-4 rounded accent-red-700"
                    />
                    Requiere registro para asistir
                  </label>
                  <p className="text-xs text-gray-400 font-sans mt-1 ml-6">
                    Si está activo, aparecerá el botón &quot;Registrarme ahora&quot; en el homepage.
                  </p>
                </div>
              </div>

              {error && <p className="text-xs text-red-600 font-sans">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-sans text-gray-600 hover:text-gray-800">
                Cancelar
              </button>
              <Button onClick={handleSave} disabled={saving || uploading} className="btn-nikkei text-sm py-2 px-5">
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