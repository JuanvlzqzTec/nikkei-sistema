'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, Loader2, X, Check } from 'lucide-react'
import { sliderApi, type SliderItem } from '@/lib/adminApi'
import { Button } from '@/components/ui/button'

const emptyForm = { url_imagen: '', titulo: '', descripcion: '', orden: 0, es_activo: true }

export default function SliderAdminPage() {
  const [items, setItems] = useState<SliderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<SliderItem | null>(null)
  const [form, setForm] = useState(emptyForm)

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

  const handleSave = async () => {
    if (!form.url_imagen.trim()) {
      setError('La URL de la imagen es requerida')
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

              {/* Preview */}
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

              {/* Status badge */}
              <span className={`text-xs font-sans px-2 py-1 rounded-full shrink-0 ${
                item.es_activo
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {item.es_activo ? 'Activo' : 'Oculto'}
              </span>

              {/* Actions */}
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
              <div>
                <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">
                  URL de imagen <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.url_imagen}
                  onChange={(e) => setForm({ ...form, url_imagen: e.target.value })}
                  placeholder="https://... o /assets/..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
                />
              </div>

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

              {/* Preview */}
              {form.url_imagen && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={form.url_imagen}
                    alt="Preview"
                    fill
                    className="object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.jpg' }}
                  />
                </div>
              )}

              {error && (
                <p className="text-xs text-red-600 font-sans">{error}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-sans text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <Button onClick={handleSave} disabled={saving} className="btn-nikkei text-sm py-2 px-5">
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