'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, X, Check, Loader2, Star, StarOff, Upload, ImageIcon } from 'lucide-react'
import { galeriaApi, type GaleriaItem } from '@/lib/adminApi'
import { Button } from '@/components/ui/button'

const CLOUDINARY_CLOUD_NAME = 'dyfkeoc7a'
const CLOUDINARY_UPLOAD_PRESET = 'nikkei_default'

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

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setUploadError('')
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
    setUploadError('')
    setShowModal(true)
  }

  const uploadToCloudinary = async (file: File) => {
    if (!file.type.startsWith('image/')) { setUploadError('Solo se permiten imágenes'); return }
    if (file.size > 10 * 1024 * 1024) { setUploadError('La imagen no puede superar 10MB'); return }
    setUploading(true)
    setUploadError('')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', 'nikkei-sinaloa/galeria')
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.secure_url) {
        setForm((prev) => ({ ...prev, url_imagen: data.secure_url }))
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
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadToCloudinary(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadToCloudinary(file)
  }

  const handleSave = async () => {
    if (!form.titulo.trim()) { setError('El título es requerido'); return }
    if (!form.url_imagen.trim()) { setError('La imagen es requerida'); return }
    try {
      setSaving(true); setError('')
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
      await galeriaApi.delete(id); setSuccess('Elemento eliminado'); await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  const handleToggleDestacado = async (item: GaleriaItem) => {
    if (!item.es_destacado && destacadosCount >= 3) {
      setError('Ya hay 3 elementos destacados. Quita uno antes de agregar otro.'); return
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
          <p className="text-sm text-gray-500 font-sans mt-0.5">Gestiona el archivo histórico. Marca exactamente 3 como destacados para el homepage.</p>
        </div>
        <Button onClick={openCreate} className="btn-nikkei text-sm py-2 px-4"><Plus size={16} /> Agregar fotografía</Button>
      </div>

      <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-sans ${destacadosCount >= 3 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
        <Star size={16} className="shrink-0" />
        <span>
          <strong>{destacadosCount}/3</strong> elementos marcados para el homepage (Sección &quot;Nuestras Raíces&quot;).
          {destacadosCount >= 3 && ' Quita uno para poder marcar otro.'}
        </span>
      </div>

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

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCategoria('')} className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${filterCategoria === '' ? 'bg-red-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Todas</button>
        {CATEGORIAS.map((cat) => (
          <button key={cat} onClick={() => setFilterCategoria(cat)} className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${filterCategoria === cat ? 'bg-red-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{CATEGORIA_LABELS[cat]}</button>
        ))}
      </div>

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
            <div key={item.id_galeria} className={`bg-white rounded-xl border overflow-hidden transition-all ${item.es_destacado ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-200'}`}>
              <div className="relative h-40 bg-gray-100">
                <Image src={item.url_imagen} alt={item.titulo} fill className="object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.jpg' }} />
                {item.es_destacado && (
                  <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[10px] font-sans font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={9} /> Homepage
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <span className={`inline-block text-[10px] font-sans px-2 py-0.5 rounded-full mb-1 ${CATEGORIA_COLORS[item.categoria]}`}>{CATEGORIA_LABELS[item.categoria]}</span>
                  <p className="font-sans font-semibold text-sm text-gray-800 leading-tight">{item.titulo}</p>
                  {item.fecha_hito && <p className="text-xs text-gray-400 font-sans mt-0.5">{new Date(item.fecha_hito).getFullYear()}</p>}
                </div>
                <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
                  <button onClick={() => handleToggleDestacado(item)} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-sans transition-colors ${item.es_destacado ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600'}`}>
                    {item.es_destacado ? <Star size={12} /> : <StarOff size={12} />}
                    {item.es_destacado ? 'En homepage' : 'Destacar'}
                  </button>
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(item.id_galeria)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-serif text-gray-900 text-lg">{editingItem ? 'Editar fotografía' : 'Agregar fotografía'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Título <span className="text-red-500">*</span></label>
                <input type="text" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Primeros inmigrantes en Mazatlán"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200" />
              </div>

              {/* Imagen — Cloudinary upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Fotografía <span className="text-red-500">*</span></label>
                {form.url_imagen ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 group">
                    <Image src={form.url_imagen} alt="Preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-gray-800 text-xs font-sans font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-gray-100 transition-colors">
                        <Upload size={13} /> Cambiar
                      </button>
                      <button type="button" onClick={() => setForm((prev) => ({ ...prev, url_imagen: '' }))} className="bg-red-600 text-white text-xs font-sans font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-red-700 transition-colors">
                        <X size={13} /> Quitar
                      </button>
                    </div>
                    {uploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-white" /></div>}
                  </div>
                ) : (
                  <div onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleFileDrop} onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${dragOver ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-red-300 hover:bg-red-50/50'}`}>
                    {uploading ? (
                      <><Loader2 size={22} className="animate-spin text-red-700" /><p className="text-xs font-sans text-gray-500">Subiendo fotografía...</p></>
                    ) : (
                      <><ImageIcon size={22} className="text-gray-300" /><p className="text-xs font-sans text-gray-500 text-center px-4">Arrastra una fotografía o <span className="text-red-700 font-medium">haz clic para seleccionar</span></p><p className="text-[10px] font-sans text-gray-400">JPG, PNG, WEBP · Máx 10MB</p></>
                    )}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                {uploadError && <p className="text-xs text-red-600 font-sans mt-1.5">{uploadError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Categoría</label>
                  <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400">
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{CATEGORIA_LABELS[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Fecha del hito</label>
                  <input type="date" value={form.fecha_hito} onChange={(e) => setForm({ ...form, fecha_hito: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Orden</label>
                  <input type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })} min={1} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400" />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.es_destacado} onChange={(e) => setForm({ ...form, es_destacado: e.target.checked })} className="w-4 h-4 rounded accent-amber-500" />
                    <span className="text-sm font-sans text-gray-700 flex items-center gap-1"><Star size={13} className="text-amber-500" /> Destacar en homepage</span>
                  </label>
                </div>
              </div>

              {error && <p className="text-xs text-red-600 font-sans">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-sans text-gray-600 hover:text-gray-800">Cancelar</button>
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