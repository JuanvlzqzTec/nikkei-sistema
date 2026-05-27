'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import {
  X,
  Check,
  Loader2,
  Upload,
  Image as ImageIcon,
  Info,
} from 'lucide-react'
import { miEmpresaApi, type MiEmpresa, type MiEmpresaInput } from '@/lib/empresasMiembroApi'
import { GIROS_COMERCIALES } from '@/lib/constants'

const CLOUDINARY_CLOUD_NAME = 'dyfkeoc7a'
const CLOUDINARY_UPLOAD_PRESET = 'nikkei_default'

interface Props {
  empresaActual: MiEmpresa | null
  onClose: () => void
  onSaved: () => void
}

const emptyForm: MiEmpresaInput = {
  nombre_empresa: '',
  giro_comercial: '',
  descripcion: '',
  telefono: '',
  email: '',
  sitio_web: '',
  ciudad: '',
  estado: 'Sinaloa',
  logo_empresa: '',
  acepta_promocion_directorio: true,
}

export default function MiEmpresaModal({ empresaActual, onClose, onSaved }: Props) {
  const [form, setForm] = useState<MiEmpresaInput>(
    empresaActual
      ? {
          nombre_empresa: empresaActual.nombre_empresa,
          giro_comercial: empresaActual.giro_comercial ?? '',
          descripcion: empresaActual.descripcion ?? '',
          telefono: empresaActual.telefono ?? '',
          email: empresaActual.email ?? '',
          sitio_web: empresaActual.sitio_web ?? '',
          ciudad: empresaActual.ciudad ?? '',
          estado: empresaActual.estado ?? 'Sinaloa',
          logo_empresa: empresaActual.logo_empresa ?? '',
          acepta_promocion_directorio: empresaActual.acepta_promocion_directorio,
        }
      : emptyForm
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const esEdicion = empresaActual !== null

  // Cerrar con Escape + bloquear scroll del body
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose, saving])

  const setCampo = <K extends keyof MiEmpresaInput>(key: K, val: MiEmpresaInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }))

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
        setCampo('logo_empresa', data.secure_url)
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

  const handleSubmit = async () => {
    if (!form.nombre_empresa.trim()) {
      setError('Por favor escribe el nombre de tu empresa')
      return
    }

    setSaving(true)
    setError('')

    try {
      if (esEdicion) {
        await miEmpresaApi.actualizar(form)
      } else {
        await miEmpresaApi.crear(form)
      }
      onSaved()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !saving && onClose()}
      />

      {/* Panel */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-serif text-2xl text-red-800 leading-tight">
              {esEdicion ? 'Editar mi empresa' : 'Registrar mi empresa'}
            </h2>
            <p className="font-sans text-base text-gray-500 mt-1">
              {esEdicion
                ? 'Los cambios serán revisados por un administrador.'
                : 'Comparte los detalles de tu empresa Nikkei.'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Aviso de re-aprobación si es edición */}
        {esEdicion && empresaActual?.status_aprobacion === 'aprobada' && (
          <div className="mx-6 mt-4 bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Info size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <p className="font-sans text-base text-amber-900 leading-relaxed">
              Al guardar los cambios, tu empresa volverá a estado{' '}
              <strong>En revisión</strong> hasta que un administrador apruebe
              las modificaciones.
            </p>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Nombre */}
          <div>
            <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
              Nombre de tu empresa <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={form.nombre_empresa}
              onChange={(e) => setCampo('nombre_empresa', e.target.value)}
              placeholder="Por ejemplo: Restaurante Sakura"
              className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Giro */}
          <div>
            <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
              ¿A qué se dedica?
            </label>
            <select
              value={form.giro_comercial}
              onChange={(e) => setCampo('giro_comercial', e.target.value)}
              className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="">Selecciona un giro...</option>
              {GIROS_COMERCIALES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
              Descripción
              <span className="font-normal text-sm text-gray-400 ml-2">
                (opcional)
              </span>
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setCampo('descripcion', e.target.value)}
              rows={3}
              placeholder="Cuéntale a la comunidad sobre tu empresa..."
              className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Logo */}
          <div>
            <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
              Logo de tu empresa
              <span className="font-normal text-sm text-gray-400 ml-2">
                (opcional)
              </span>
            </label>
            {form.logo_empresa ? (
              <div className="relative w-full h-44 rounded-xl overflow-hidden border-2 border-gray-200 group bg-gray-50">
                <Image
                  src={form.logo_empresa}
                  alt="Logo preview"
                  fill
                  className="object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-gray-800 text-sm font-sans font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-gray-100 cursor-pointer"
                  >
                    <Upload size={14} /> Cambiar
                  </button>
                  <button
                    type="button"
                    onClick={() => setCampo('logo_empresa', '')}
                    className="bg-red-600 text-white text-sm font-sans font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-red-700 cursor-pointer"
                  >
                    <X size={14} /> Quitar
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
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 bg-gray-50 hover:border-red-300 hover:bg-red-50/50'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 size={26} className="animate-spin text-red-700" />
                    <p className="text-sm font-sans text-gray-500">Subiendo logo...</p>
                  </>
                ) : (
                  <>
                    <ImageIcon size={26} className="text-gray-300" />
                    <p className="text-sm font-sans text-gray-500 text-center px-4">
                      Arrastra el logo o{' '}
                      <span className="text-red-700 font-semibold">
                        haz clic para seleccionar
                      </span>
                    </p>
                    <p className="text-xs font-sans text-gray-400">
                      JPG, PNG, WEBP · Máx 10MB
                    </p>
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
              <p className="text-sm text-red-600 font-sans mt-2">{uploadError}</p>
            )}
          </div>

          {/* Datos de contacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => setCampo('telefono', e.target.value)}
                placeholder="667 123 4567"
                className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setCampo('email', e.target.value)}
                placeholder="contacto@empresa.com"
                className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
                Sitio web
              </label>
              <input
                type="text"
                value={form.sitio_web}
                onChange={(e) => setCampo('sitio_web', e.target.value)}
                placeholder="https://..."
                className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                value={form.ciudad}
                onChange={(e) => setCampo('ciudad', e.target.value)}
                placeholder="Culiacán"
                className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
                Estado
              </label>
              <input
                type="text"
                value={form.estado}
                onChange={(e) => setCampo('estado', e.target.value)}
                placeholder="Sinaloa"
                className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Toggle directorio público */}
          <div className="pt-2 border-t border-gray-100">
            <label
              className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                form.acepta_promocion_directorio
                  ? 'border-red-700 bg-red-50'
                  : 'border-gray-200 bg-white hover:border-red-300 hover:bg-amber-50/50'
              }`}
            >
              <input
                type="checkbox"
                checked={form.acepta_promocion_directorio}
                onChange={(e) =>
                  setCampo('acepta_promocion_directorio', e.target.checked)
                }
                className="w-6 h-6 mt-0.5 rounded accent-red-700 cursor-pointer shrink-0"
              />
              <div>
                <p className="font-sans text-base font-semibold text-gray-800 mb-1">
                  Quiero aparecer en el directorio público
                </p>
                <p className="font-sans text-base text-gray-500 leading-relaxed">
                  Tu empresa aparecerá en{' '}
                  <strong>Impulso Nikkei</strong>, la sección pública del
                  sitio donde la comunidad puede descubrirla. Si lo desactivas,
                  tu empresa quedará registrada pero no será visible
                  públicamente.
                </p>
              </div>
            </label>
          </div>

          {/* Error general */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-2">
              <X size={16} className="text-red-700 shrink-0 mt-0.5" />
              <p className="font-sans text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 px-6 py-5 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={saving}
            className="min-h-12 px-5 py-2.5 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-sans font-semibold text-base rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || uploading}
            className="min-h-12 px-6 py-2.5 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 disabled:from-gray-300 disabled:to-gray-400 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check size={16} />
                {esEdicion ? 'Guardar cambios' : 'Registrar empresa'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}