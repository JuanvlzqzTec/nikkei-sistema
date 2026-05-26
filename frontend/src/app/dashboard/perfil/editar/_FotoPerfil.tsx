'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import {
  Camera,
  Upload,
  X,
  Loader2,
  Check,
  Image as ImageIcon,
} from 'lucide-react'
import { perfilApi } from '@/lib/perfilApi'

const CLOUDINARY_CLOUD_NAME = 'dyfkeoc7a'
const CLOUDINARY_UPLOAD_PRESET = 'nikkei_default'

interface Props {
  fotoActual?: string
  onGuardadoOk: () => void
}

export default function FotoPerfil({ fotoActual, onGuardadoOk }: Props) {
  const [fotoNueva, setFotoNueva] = useState<string | null>(fotoActual ?? null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hayCambios = fotoNueva !== (fotoActual ?? null)

  const uploadToCloudinary = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La foto no puede pesar más de 5MB')
      return
    }

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', 'nikkei-sinaloa/personas')

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      if (data.secure_url) {
        setFotoNueva(data.secure_url)
      } else {
        setError('Error al subir la foto')
      }
    } catch {
      setError('Error de conexión al subir la foto')
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

  const handleQuitar = () => {
    setFotoNueva(null)
  }

  const handleGuardar = async () => {
    setSaving(true)
    setError('')
    try {
      await perfilApi.actualizarFoto(fotoNueva)
      onGuardadoOk()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar la foto')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelar = () => {
    setFotoNueva(fotoActual ?? null)
    setError('')
  }

  return (
    <div className="space-y-5 pt-2">
      {/* Preview */}
      <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-amber-100 shrink-0 bg-amber-50">
          {fotoNueva ? (
            <Image
              src={fotoNueva}
              alt="Foto de perfil"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera size={32} className="text-amber-300" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2 text-center sm:text-left">
          <p className="font-sans text-base text-gray-600 leading-relaxed">
            {fotoNueva
              ? 'Esta es tu foto actual. Puedes cambiarla o quitarla.'
              : 'Aún no tienes foto. Sube una para personalizar tu perfil.'}
          </p>
        </div>
      </div>

      {/* Drag & drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full min-h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 p-5 cursor-pointer transition-colors ${
          dragOver
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:border-red-300 hover:bg-red-50/40'
        }`}
      >
        {uploading ? (
          <>
            <Loader2 size={26} className="animate-spin text-red-700" />
            <p className="font-sans text-base text-gray-500">Subiendo foto...</p>
          </>
        ) : (
          <>
            <ImageIcon size={26} className="text-gray-400" />
            <p className="font-sans text-base text-gray-600 text-center">
              Arrastra una foto o{' '}
              <span className="text-red-700 font-semibold">
                haz clic para seleccionar
              </span>
            </p>
            <p className="font-sans text-sm text-gray-400">
              JPG, PNG, WEBP · Máx 5MB
            </p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-2">
          <X size={16} className="text-red-700 shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Acciones */}
      {hayCambios && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-amber-100">
          {fotoNueva && fotoActual && (
            <button
              onClick={handleQuitar}
              disabled={saving || uploading}
              className="min-h-13 px-5 py-3 bg-white border-2 border-red-300 hover:border-red-500 hover:bg-red-50 text-red-700 font-sans font-semibold text-base rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Quitar foto
            </button>
          )}
          <button
            onClick={handleCancelar}
            disabled={saving || uploading}
            className="sm:flex-1 min-h-13 px-5 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-sans font-semibold text-base rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={saving || uploading}
            className="sm:flex-1 min-h-13 px-6 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 disabled:from-gray-300 disabled:to-gray-400 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check size={16} />
                Guardar foto
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}