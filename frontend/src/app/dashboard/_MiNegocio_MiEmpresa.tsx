'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Building2,
  Plus,
  Pencil,
  Loader2,
  Clock,
  Check,
  AlertCircle,
  EyeOff,
  Globe,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'
import { miEmpresaApi, type MiEmpresa } from '@/lib/empresasMiembroApi'
import MiEmpresaModal from './_MiNegocio_MiEmpresaModal'

export default function MiEmpresaBloque() {
  const [empresa, setEmpresa] = useState<MiEmpresa | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const cargar = async () => {
    try {
      setLoading(true)
      setError(false)
      const res = await miEmpresaApi.get()
      if (res.tiene_empresa && res.data) {
        setEmpresa(res.data)
      } else {
        setEmpresa(null)
      }
    } catch {
      setEmpresa(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleSaved = () => {
    setShowModal(false)
    cargar()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={20} className="text-red-700" />
          <h3 className="font-serif text-xl text-red-800">Mi empresa</h3>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-red-700" />
        </div>
      </div>
    )
  }

  // Sin empresa: CTA grande para crear
  if (!empresa) {
    return (
      <>
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={20} className="text-red-700" />
            <h3 className="font-serif text-xl text-red-800">Mi empresa</h3>
          </div>

          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center">
              <Building2 size={28} className="text-amber-400" />
            </div>
            <div>
              <p className="font-serif text-lg text-gray-700 mb-1">
                ¿Tienes un negocio propio?
              </p>
              <p className="font-sans text-base text-gray-500 max-w-sm mx-auto leading-relaxed">
                Regístralo y, si quieres, aparecerá en el directorio Impulso Nikkei.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 min-h-13 px-6 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all duration-200 cursor-pointer"
            >
              <Plus size={18} />
              Registrar mi empresa
            </button>
          </div>
        </div>

        {showModal && (
          <MiEmpresaModal
            empresaActual={null}
            onClose={() => setShowModal(false)}
            onSaved={handleSaved}
          />
        )}
      </>
    )
  }

  // Con empresa: card con estado + botón editar
  const status = empresa.status_aprobacion ?? 'pendiente'
  const visibleEnDirectorio =
    status === 'aprobada' && empresa.acepta_promocion_directorio

  return (
    <>
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between gap-2 mb-5 flex-wrap">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-red-700" />
            <h3 className="font-serif text-xl text-red-800">Mi empresa</h3>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-sans font-semibold text-red-700 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <Pencil size={14} />
            Editar
          </button>
        </div>

        {/* Card de la empresa */}
        <div className="flex items-start gap-4 mb-5">
          {/* Logo o placeholder */}
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-amber-50 shrink-0 border border-amber-100">
            {empresa.logo_empresa ? (
              <Image
                src={empresa.logo_empresa}
                alt={empresa.nombre_empresa}
                fill
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-amber-300 font-serif text-2xl">
                {empresa.nombre_empresa.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-serif text-lg text-gray-900 leading-tight">
              {empresa.nombre_empresa}
            </p>
            {empresa.giro_comercial && (
              <p className="font-sans text-base text-amber-700 mt-0.5">
                {empresa.giro_comercial}
              </p>
            )}
            {empresa.ciudad && (
              <p className="font-sans text-sm text-gray-500 mt-1 flex items-center gap-1">
                <MapPin size={11} />
                {empresa.ciudad}
              </p>
            )}
          </div>
        </div>

        {/* Badges de estado */}
        <div className="space-y-3 mb-4">
          {/* Estado de aprobación */}
          {status === 'pendiente' && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <Clock size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <p className="font-sans text-sm text-amber-900 leading-relaxed">
                <strong>En revisión.</strong> Un administrador está revisando
                tu solicitud. Te avisaremos cuando sea aprobada.
              </p>
            </div>
          )}

          {status === 'aprobada' && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
              <Check size={16} className="text-green-700 shrink-0 mt-0.5" />
              <div className="font-sans text-sm text-green-900 leading-relaxed">
                <strong>Aprobada.</strong>{' '}
                {visibleEnDirectorio ? (
                  <span>
                    Tu empresa aparece en el directorio público{' '}
                    <strong>Impulso Nikkei</strong>.
                  </span>
                ) : (
                  <span className="flex items-center gap-1 mt-1">
                    <EyeOff size={12} />
                    No visible públicamente (oculta por preferencia)
                  </span>
                )}
              </div>
            </div>
          )}

          {status === 'rechazada' && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={16} className="text-red-700 shrink-0 mt-0.5" />
              <p className="font-sans text-sm text-red-900 leading-relaxed">
                <strong>Solicitud rechazada.</strong> Por favor contacta a un
                administrador para conocer los detalles.
              </p>
            </div>
          )}
        </div>

        {/* Datos de contacto resumidos */}
        {(empresa.telefono || empresa.email || empresa.sitio_web) && (
          <div className="pt-4 border-t border-amber-100 space-y-1.5">
            {empresa.telefono && (
              <div className="flex items-center gap-2 text-sm font-sans text-gray-600">
                <Phone size={12} className="text-amber-600 shrink-0" />
                {empresa.telefono}
              </div>
            )}
            {empresa.email && (
              <div className="flex items-center gap-2 text-sm font-sans text-gray-600">
                <Mail size={12} className="text-amber-600 shrink-0" />
                <span className="truncate">{empresa.email}</span>
              </div>
            )}
            {empresa.sitio_web && (
              <div className="flex items-center gap-2 text-sm font-sans text-gray-600">
                <Globe size={12} className="text-amber-600 shrink-0" />
                <span className="truncate">{empresa.sitio_web}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <MiEmpresaModal
          empresaActual={empresa}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}