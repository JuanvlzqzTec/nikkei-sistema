'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, Loader2, X, Check, Upload, ImageIcon } from 'lucide-react'
import { sliderApi, type SliderItem } from '@/lib/adminApi'
import { Button } from '@/components/ui/button'

const CLOUDINARY_CLOUD_NAME = 'dyfkeoc7a'
const CLOUDINARY_UPLOAD_PRESET = 'nikkei_default'

const emptyForm = { url_imagen: '', titulo: '', descripcion: '', orden: 0, es_activo: true }

export default function SliderAdminPage() {
  const [items, setItems] = useState<SliderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<SliderItem | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      setLoading(true)
      const res = await sliderApi.getAll()
      setItems(res.data || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditingItem(null)
    setForm({ ...emptyForm, orden: items.length + 1 })
    setShowModal(true)
  }

  const openEdit = (item: SliderItem) => {
    setEditingItem(item)
    setForm({
      url_imagen: item.url_imagen,
      titulo: item.titulo || '',
      descripcion: item.descripcion || '',
      orden: item.orden,
      es_activo: item.es_activo,
    })
    setShowModal(true)
  }

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no puede pesar más de 10MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )

      if (!res.ok) throw new Error('Error al subir la imagen')

      const data = await res.json()
      setForm((prev) => ({ ...prev, url_imagen: data.secure_url }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  const handleSave = async () => {
    if (!form.url_imagen.trim()) {
      setError('Debes subir una imagen')
      return
    }
    try {
      setSaving(true)
      setError('')
      if (editingItem) {
        await sliderApi.update(editingItem.id_slider, form)
        setSuccess('Imagen actualizada')
      } else {
        await sliderApi.create(form)
        setSuccess('Imagen agregada')
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
    if (!confirm('¿Eliminar esta imagen del slider?')) return
    try {
      await sliderApi.delete(id)
      setSuccess('Imagen eliminada')
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  const handleToggleActivo = async (item: SliderItem) => {
    try {
      await sliderApi.update(item.id_slider, { es_activo: !item.es_activo })
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al actualizar')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif text-gray-900">Slider Hero</h1>
          <p className="text-sm text-gray-500 font-sans mt-0.5">
            Gestiona las imágenes del carrusel principal del homepage.
          </p>
        </div>
        <Button onClick={openCreate} className="btn-nikkei text-sm py-2 px-4">
          <Plus size={16} /> Agregar imagen
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-sans">
          <X size={15} className="shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-sans">
          <Check size={15} className="shrink-0" />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-red-800" size={28} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 font-sans text-sm">No hay imágenes en el slider todavía.</p>
          <button onClick={openCreate} className="mt-3 text-red-700 text-sm font-sans underline">
            Agregar la primera imagen
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id_slider}
              className={`flex items-center gap-4 bg-white rounded-xl border p-4 transition-all ${
                item.es_activo ? 'border-gray-200' : 'border-gray-100 opacity-60'
              }`}
            >
              <GripVertical size={16} className="text-gray-300 cursor-grab shrink-0" />

              <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <Image
                  src={item.url_imagen}
                  alt={item.titulo || 'Slide'}
                  fill
                  className="object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.jpg' }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-sm text-gray-800 truncate">
                  {item.titulo || <span className="text-gray-400 italic">Sin título</span>}
                </p>
                <p className="text-xs text-gray-400 font-sans mt-0.5 truncate">{item.url_imagen}</p>
                <p className="text-xs text-gray-400 font-sans mt-0.5">Orden: {item.orden}</p>
              </div>

              <span className={`text-xs font-sans px-2 py-1 rounded-full shrink-0 ${
                item.es_activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {item.es_activo ? 'Activo' : 'Oculto'}
              </span>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggleActivo(item)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                  title={item.es_activo ? 'Ocultar' : 'Mostrar'}
                >
                  {item.es_activo ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  onClick={() => openEdit(item)}
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(item.id_slider)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-serif text-gray-900 text-lg">
                {editingItem ? 'Editar imagen' : 'Agregar imagen'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">

              {/* Upload zone */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">
                  Imagen <span className="text-red-500">*</span>
                </label>

                {form.url_imagen ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gray-100 group">
                    <Image
                      src={form.url_imagen}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-white text-gray-800 text-xs font-sans font-semibold px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                        Cambiar imagen
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, url_imagen: '' }))}
                        className="flex items-center gap-2 bg-red-500 text-white text-xs font-sans font-semibold px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X size={13} /> Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`w-full h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all
                      ${uploading
                        ? 'border-red-300 bg-red-50/30 cursor-wait'
                        : 'border-gray-300 cursor-pointer hover:border-red-400 hover:bg-red-50/30'
                      }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={28} className="animate-spin text-red-600" />
                        <p className="text-sm text-gray-500 font-sans">Subiendo imagen...</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <ImageIcon size={22} className="text-gray-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-sans text-gray-600">
                            <span className="text-red-600 font-semibold">Haz clic para subir</span> o arrastra aquí
                          </p>
                          <p className="text-xs text-gray-400 font-sans mt-1">PNG, JPG, WEBP · máx. 10MB</p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Título */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Título</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Título opcional"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Descripción opcional"
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Orden</label>
                  <input
                    type="number"
                    value={form.orden}
                    onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })}
                    min={1}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.es_activo}
                      onChange={(e) => setForm({ ...form, es_activo: e.target.checked })}
                      className="w-4 h-4 rounded accent-red-700"
                    />
                    <span className="text-sm font-sans text-gray-700">Activo</span>
                  </label>
                </div>
              </div>

              {error && <p className="text-xs text-red-600 font-sans">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-sans text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <Button onClick={handleSave} disabled={saving || uploading} className="btn-nikkei text-sm py-2 px-5">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {editingItem ? 'Guardar cambios' : 'Agregar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}