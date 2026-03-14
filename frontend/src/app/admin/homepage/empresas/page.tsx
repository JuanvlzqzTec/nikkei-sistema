'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, X, Check, Loader2, Star, StarOff, Upload, ImageIcon } from 'lucide-react'
import { empresasApi, type Empresa } from '@/lib/adminApi'
import { Button } from '@/components/ui/button'

const CLOUDINARY_CLOUD_NAME = 'dyfkeoc7a'
const CLOUDINARY_UPLOAD_PRESET = 'nikkei_default'

const STATUS_APROBACION_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  aprobada: 'bg-green-100 text-green-700',
  rechazada: 'bg-red-100 text-red-600',
}

const emptyForm = {
  nombre_empresa: '', giro_comercial: '', sector: '', descripcion: '',
  telefono: '', email: '', sitio_web: '', direccion: '', ciudad: '',
  estado: 'Sinaloa', logo_empresa: '',
}

export default function EmpresasAdminPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [tab, setTab] = useState<'todas' | 'pendientes' | 'homepage'>('todas')

  // Cloudinary upload state
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (tab === 'pendientes') params.status = 'pendiente'
      if (tab === 'homepage') params.homepage = 'true'
      const res = await empresasApi.getAll(params)
      setEmpresas(res.data || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar empresas')
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { load() }, [load])

  const f = (key: keyof typeof emptyForm, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }))

  const openCreate = () => {
    setEditingEmpresa(null)
    setForm(emptyForm)
    setUploadError('')
    setShowModal(true)
  }

  const openEdit = (em: Empresa) => {
    setEditingEmpresa(em)
    setForm({
      nombre_empresa: em.nombre_empresa,
      giro_comercial: em.giro_comercial || '',
      sector: em.sector || '',
      descripcion: em.descripcion || '',
      telefono: em.telefono || '',
      email: em.email || '',
      sitio_web: em.sitio_web || '',
      direccion: em.direccion || '',
      ciudad: em.ciudad || '',
      estado: em.estado || 'Sinaloa',
      logo_empresa: em.logo_empresa || '',
    })
    setUploadError('')
    setShowModal(true)
  }

  // Cloudinary upload
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
    formData.append('folder', 'nikkei-sinaloa/empresas')
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      if (data.secure_url) {
        f('logo_empresa', data.secure_url)
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
    if (!form.nombre_empresa.trim()) { setError('El nombre es requerido'); return }
    try {
      setSaving(true)
      setError('')
      if (editingEmpresa) {
        await empresasApi.update(editingEmpresa.id_empresa, form)
        setSuccess('Empresa actualizada')
      } else {
        await empresasApi.create(form)
        setSuccess('Empresa creada')
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
    if (!confirm('¿Eliminar esta empresa?')) return
    try {
      await empresasApi.delete(id)
      setSuccess('Empresa eliminada')
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    }
  }

  const handleAprobacion = async (id: number, status: string) => {
    try {
      await empresasApi.updateAprobacion(id, status)
      setSuccess(`Empresa ${status}`)
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al actualizar')
    }
  }

  const handleToggleHomepage = async (empresa: Empresa) => {
    try {
      await empresasApi.setHomepage(empresa.id_empresa, {
        en_homepage: !empresa.en_homepage,
        orden_homepage: empresa.orden_homepage,
      })
      setSuccess(empresa.en_homepage ? 'Empresa quitada del homepage' : 'Empresa agregada al homepage')
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    }
  }

  const homepageCount = empresas.filter((e) => e.en_homepage).length

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-serif text-gray-900">Impulso Nikkei — Empresas</h1>
          <p className="text-sm text-gray-500 font-sans mt-0.5">
            Gestiona el directorio empresarial. Máximo 5 empresas en homepage.
          </p>
        </div>
        <Button onClick={openCreate} className="btn-nikkei text-sm py-2 px-4">
          <Plus size={16} /> Agregar empresa
        </Button>
      </div>

      {/* Homepage counter */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-sans ${
        homepageCount >= 5
          ? 'bg-amber-50 border-amber-200 text-amber-700'
          : 'bg-blue-50 border-blue-200 text-blue-700'
      }`}>
        <Star size={16} className="shrink-0" />
        <span>
          <strong>{homepageCount}/5</strong> empresas seleccionadas para el homepage.
          {homepageCount >= 5 && ' Quita una para poder agregar otra.'}
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

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['todas', 'pendientes', 'homepage'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-sans font-medium transition-all capitalize ${
              tab === t ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'pendientes' ? '⏳ Pendientes' : t === 'homepage' ? '⭐ En homepage' : 'Todas'}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-red-800" size={28} /></div>
      ) : empresas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 font-sans text-sm">
            {tab === 'pendientes' ? 'No hay solicitudes pendientes.' : 'No hay empresas todavía.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {empresas.map((em) => (
            <div key={em.id_empresa} className={`bg-white rounded-xl border p-4 flex gap-4 items-start transition-all ${
              em.en_homepage ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-200'
            }`}>
              {/* Logo */}
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                {em.logo_empresa ? (
                  <Image src={em.logo_empresa} alt={em.nombre_empresa} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl font-serif">
                    {em.nombre_empresa.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-sans px-2 py-0.5 rounded-full ${
                        STATUS_APROBACION_COLORS[em.status_aprobacion || 'pendiente']
                      }`}>
                        {em.status_aprobacion || 'pendiente'}
                      </span>
                      {em.en_homepage && (
                        <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                          <Star size={10} /> Homepage
                        </span>
                      )}
                    </div>
                    <p className="font-sans font-semibold text-gray-800 mt-1">{em.nombre_empresa}</p>
                    <p className="text-xs text-gray-400 font-sans mt-0.5">
                      {[em.giro_comercial, em.ciudad].filter(Boolean).join(' · ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    {em.status_aprobacion === 'pendiente' && (
                      <>
                        <button
                          onClick={() => handleAprobacion(em.id_empresa, 'aprobada')}
                          className="px-2 py-1 text-xs font-sans rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors flex items-center gap-1"
                        >
                          <Check size={12} /> Aprobar
                        </button>
                        <button
                          onClick={() => handleAprobacion(em.id_empresa, 'rechazada')}
                          className="px-2 py-1 text-xs font-sans rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1"
                        >
                          <X size={12} /> Rechazar
                        </button>
                      </>
                    )}

                    {em.status_aprobacion === 'aprobada' && (
                      <button
                        onClick={() => handleToggleHomepage(em)}
                        title={em.en_homepage ? 'Quitar del homepage' : 'Poner en homepage'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          em.en_homepage
                            ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                            : 'hover:bg-amber-50 text-gray-400 hover:text-amber-500'
                        }`}
                      >
                        {em.en_homepage ? <Star size={15} /> : <StarOff size={15} />}
                      </button>
                    )}

                    <button onClick={() => openEdit(em)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(em.id_empresa)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
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
                {editingEmpresa ? 'Editar empresa' : 'Agregar empresa'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Nombre */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">
                    Nombre de empresa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nombre_empresa}
                    onChange={(e) => f('nombre_empresa', e.target.value)}
                    placeholder="Restaurante Tanaka"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
                  />
                </div>

                {/* Giro comercial */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Giro comercial</label>
                  <input
                    type="text"
                    value={form.giro_comercial}
                    onChange={(e) => f('giro_comercial', e.target.value)}
                    placeholder="Gastronomía"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Sector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Sector</label>
                  <input
                    type="text"
                    value={form.sector}
                    onChange={(e) => f('sector', e.target.value)}
                    placeholder="Restaurantes"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Teléfono</label>
                  <input
                    type="text"
                    value={form.telefono}
                    onChange={(e) => f('telefono', e.target.value)}
                    placeholder="+52 667 000 0000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Email</label>
                  <input
                    type="text"
                    value={form.email}
                    onChange={(e) => f('email', e.target.value)}
                    placeholder="contacto@empresa.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Sitio web */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Sitio web</label>
                  <input
                    type="text"
                    value={form.sitio_web}
                    onChange={(e) => f('sitio_web', e.target.value)}
                    placeholder="https://..."
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

                {/* Estado */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">Estado</label>
                  <input
                    type="text"
                    value={form.estado}
                    onChange={(e) => f('estado', e.target.value)}
                    placeholder="Sinaloa"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-sans focus:outline-none focus:border-red-400"
                  />
                </div>

                {/* Logo — Cloudinary upload */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 font-sans mb-1.5">
                    Logo de la empresa
                  </label>

                  {form.logo_empresa ? (
                    <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 group">
                      <Image src={form.logo_empresa} alt="Preview logo" fill className="object-contain bg-gray-50" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white text-gray-800 text-xs font-sans font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-gray-100 transition-colors"
                        >
                          <Upload size={13} /> Cambiar
                        </button>
                        <button
                          type="button"
                          onClick={() => f('logo_empresa', '')}
                          className="bg-red-600 text-white text-xs font-sans font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-red-700 transition-colors"
                        >
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
                          <p className="text-xs font-sans text-gray-500">Subiendo logo...</p>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={22} className="text-gray-300" />
                          <p className="text-xs font-sans text-gray-500 text-center px-4">
                            Arrastra el logo o <span className="text-red-700 font-medium">haz clic para seleccionar</span>
                          </p>
                          <p className="text-[10px] font-sans text-gray-400">JPG, PNG, WEBP · Máx 10MB</p>
                        </>
                      )}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {uploadError && (
                    <p className="text-xs text-red-600 font-sans mt-1.5">{uploadError}</p>
                  )}
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

              </div>

              {error && <p className="text-xs text-red-600 font-sans">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-sans text-gray-600 hover:text-gray-800">Cancelar</button>
              <Button onClick={handleSave} disabled={saving || uploading} className="btn-nikkei text-sm py-2 px-5">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {editingEmpresa ? 'Guardar cambios' : 'Agregar empresa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}