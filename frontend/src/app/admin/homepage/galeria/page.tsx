'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, X, Check, Loader2, Star, StarOff } from 'lucide-react'
import { galeriaApi, type GaleriaItem } from '@/lib/adminApi'
import { Button } from '@/components/ui/button'

const CATEGORIAS = ['inmigracion', 'fundacion', 'evento_historico', 'cultura', 'personaje_clave']
const CATEGORIA_LABELS: Record<string, string> = {
  inmigracion: 'Inmigración',
  fundacion: 'Fundación',
  evento_historico: 'Evento Histórico',
  cultura: 'Cultura',
  personaje_clave: 'Personaje Clave',
}
const CATEGORIA_COLORS: Record<string, string> = {
  inmigracion: 'bg-blue-100 text-blue-700',
  fundacion: 'bg-purple-100 text-purple-700',
  evento_historico: 'bg-orange-100 text-orange-700',
  cultura: 'bg-pink-100 text-pink-700',
  personaje_clave: 'bg-teal-100 text-teal-700',
}

const emptyForm = {
  titulo: '', descripcion: '', url_imagen: '',
  fecha_hito: '', categoria: 'cultura', es_destacado: false, orden: 0,
}

export default function GaleriaAdminPage() {
  const [items, setItems] = useState<GaleriaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<GaleriaItem | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [filterCategoria, setFilterCategoria] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const res = await galeriaApi.getAll()
      setItems(res.data || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = filterCategoria
    ? items.filter((i) => i.categoria === filterCategoria)
    : items

  const destacadosCount = items.filter((i) => i.es_destacado).length

  const openCreate = () => {
    setEditingItem(null)
    setForm({ ...emptyForm, orden: items.length + 1 })
    setShowModal(true)
  }

  const openEdit = (item: GaleriaItem) => {
    setEditingItem(item)
    setForm({
      titulo: item.titulo,
      descripcion: item.descripcion || '',
      url_imagen: item.url_imagen,
      fecha_hito: item.fecha_hito?.slice(0, 10) || '',
      categoria: item.categoria,
      es_destacado: item.es_destacado,
      orden: item.orden,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.titulo.trim()) { setError('El título es requerido'); return }
    if (!form.url_imagen.trim()) { setError('La URL de imagen es requerida'); return }
    try {
      setSaving(true)
      setError('')
      if (editingItem) {
        await galeriaApi.update(editingItem.id_galeria, form)
        setSuccess('Elemento actualizado')
      } else {
        await galeriaApi.create(form)
        setSuccess('Elemento creado')
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
    if (!confirm('¿Eliminar este elemento de la galería?')) return
    try {
      await galeriaApi.delete(id)
      setSuccess('Elemento eliminado')
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  const handleToggleDestacado = async (item: GaleriaItem) => {
    if (!item.es_destacado && destacadosCount >= 3) {
      setError('Ya hay 3 elementos destacados. Quita uno antes de agregar otro.')
      return
    }
    try {
      await galeriaApi.update(item.id_galeria, { es_destacado: !item.es_destacado })
      setSuccess(item.es_destacado ? 'Quitado del homepage' : 'Marcado para homepage')
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-serif text-gray-900">Galería Histórica</h1>
          <p className="text-sm text-gray-500 font-sans mt-0.5">
            Gestiona el archivo histórico. Marca exactamente 3 como destacados para el homepage.
          </p>
        </div>
        <Button onClick={openCreate} className="btn-nikkei text-sm py-2 px-4">
          <Plus size={16} /> Agregar fotografía
        </Button>
      </div>

      {/* Destacados counter */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-sans ${
        destacadosCount >= 3
          ? 'bg-amber-50 border-amber-200 text-amber-700'
          : 'bg-blue-50 border-blue-200 text-blue-700'
      }`}>
        <Star size={16} className="shrink-0" />
        <span>
          <strong>{destacadosCount}/3</strong> elementos marcados para el homepage (Sección &quot;Nuestras Raíces&quot;).
          {destacadosCount >= 3 && ' Quita uno para poder marcar otro.'}
        </span>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-sans">
          <X size={15} />{error}<button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-sans">
          <Check size={15} />{success}<button onClick={() => setSuccess('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Filtro por categoría */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategoria('')}
          className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
            filterCategoria === '' ? 'bg-red-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Todas
        </button>
        {CATEGORIAS.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategoria(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
              filterCategoria === cat ? 'bg-red-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {CATEGORIA_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-red-800" size={28} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 font-sans text-sm">No hay elementos todavía.</p>
          <button onClick={openCreate} className="mt-3 text-red-700 text-sm font-sans underline cursor-pointer">Agregar el primero</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id_galeria}
              className={`bg-white rounded-xl border overflow-hidden transition-all ${
                item.es_destacado ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-200'
              }`}
            >
              {/* Imagen */}
              <div className="relative h-40 bg-gray-100">
                <Image
                  src={item.url_imagen}
                  alt={item.titulo}
                  fill
                  className="object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.jpg' }}
                />
                {/* Destacado badge */}
                {item.es_destacado && (
                  <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[10px] font-sans font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={9} /> Homepage
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className={`inline-block text-[10px] font-sans px-2 py-0.5 rounded-full mb-1 ${CATEGORIA_COLORS[item.categoria]}`}>
                      {CATEGORIA_LABELS[item.categoria]}
                    </span>
                    <p className="font-sans font-semibold text-sm text-gray-800 leading-tight">{item.titulo}</p>
                    {item.fecha_hito && (
                      <p className="text-xs text-gray-400 font-sans mt-0.5">
                        {new Date(item.fecha_hito).getFullYear()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
                  <button
                    onClick={() => handleToggleDestacado(item)}
                    title={item.es_destacado ? 'Quitar del homepage' : 'Poner en homepage'}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-sans transition-colors ${
                      item.es_destacado
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600'
                    }`}
                  >
                    {item.es_destacado ? <Star size={12} /> : <StarOff size={12} />}
                    {item.es_destacado ? 'En homepage' : 'Destacar'}
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id_galeria)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-serif text-gray-900 text-lg">
                {editingItem ? 'Editar fotografía' : 'Agregar fotografía'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Título */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Primeros inmigrantes en Mazatlán"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
                />
              </div>

              {/* URL imagen */}
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
                {form.url_imagen && (
                  <div className="relative w-full h-28 rounded-lg overflow-hidden bg-gray-100 mt-2">
                    <Image src={form.url_imagen} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Categoría */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Categoría</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c} value={c}>{CATEGORIA_LABELS[c]}</option>
                    ))}
                  </select>
                </div>

                {/* Fecha hito */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Fecha del hito</label>
                  <input
                    type="date"
                    value={form.fecha_hito}
                    onChange={(e) => setForm({ ...form, fecha_hito: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400 resize-none"
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
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.es_destacado}
                      onChange={(e) => setForm({ ...form, es_destacado: e.target.checked })}
                      className="w-4 h-4 rounded accent-amber-500"
                    />
                    <span className="text-sm font-sans text-gray-700 flex items-center gap-1">
                      <Star size={13} className="text-amber-500" /> Destacar en homepage
                    </span>
                  </label>
                </div>
              </div>

              {error && <p className="text-xs text-red-600 font-sans">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-sans text-gray-600 hover:text-gray-800">Cancelar</button>
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