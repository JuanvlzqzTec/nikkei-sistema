'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { X, MapPin, Phone, Mail, Globe, ExternalLink } from 'lucide-react'
import { type Empresa, getSectorColor } from './_types'

interface Props {
  empresa: Empresa
  onClose: () => void
}

export default function EmpresaModal({ empresa, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const inicial = empresa.nombre_empresa.charAt(0).toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg my-10 overflow-hidden">

        {/* Cabecera con logo */}
        <div className="relative h-48 bg-linear-to-br from-amber-50 to-orange-100">
          {empresa.logo_empresa ? (
            <>
              <Image
                src={empresa.logo_empresa}
                alt={empresa.nombre_empresa}
                fill
                className="object-contain p-6"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl font-serif text-amber-300/50 select-none">{inicial}</span>
            </div>
          )}

          {/* Badge sector */}
          {(empresa.sector || empresa.giro_comercial) && (
            <span className={`absolute top-4 left-4 text-xs font-sans font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getSectorColor(empresa.sector || empresa.giro_comercial)}`}>
              {empresa.sector ?? empresa.giro_comercial}
            </span>
          )}

          {/* Cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/25 hover:bg-black/45 text-white flex items-center justify-center transition-colors"
          >
            <X size={15} />
          </button>

          {/* Nombre sobre imagen si hay logo */}
          {empresa.logo_empresa && (
            <h2 className="absolute bottom-4 left-5 right-5 text-white font-serif text-xl leading-tight drop-shadow">
              {empresa.nombre_empresa}
            </h2>
          )}
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-5">

          {/* Nombre si no hay logo */}
          {!empresa.logo_empresa && (
            <h2 className="font-serif text-2xl text-gray-900 leading-tight">
              {empresa.nombre_empresa}
            </h2>
          )}

          {/* Giro comercial si difiere del sector */}
          {empresa.giro_comercial && empresa.sector && empresa.giro_comercial !== empresa.sector && (
            <p className="text-base font-sans text-amber-700 font-medium -mt-2">
              {empresa.giro_comercial}
            </p>
          )}

          {/* Datos de contacto en línea */}
          <div className="flex flex-col gap-2">
            {(empresa.ciudad || empresa.estado) && (
              <div className="flex items-center gap-2.5 text-sm font-sans text-gray-600">
                <MapPin size={14} className="text-amber-600 shrink-0" />
                <span>{[empresa.ciudad, empresa.estado].filter(Boolean).join(', ')}</span>
              </div>
            )}

            {empresa.direccion && (
              <div className="flex items-start gap-2.5 text-sm font-sans text-gray-500">
                <MapPin size={14} className="text-gray-300 shrink-0 mt-0.5" />
                <span>{empresa.direccion}</span>
              </div>
            )}

            {empresa.telefono && (
              <div className="flex items-center gap-2.5 text-sm font-sans text-gray-600">
                <Phone size={14} className="text-amber-600 shrink-0" />
                <a
                  href={`tel:${empresa.telefono}`}
                  className="hover:text-red-700 transition-colors"
                >
                  {empresa.telefono}
                </a>
              </div>
            )}

            {empresa.email && (
              <div className="flex items-center gap-2.5 text-sm font-sans text-gray-600">
                <Mail size={14} className="text-amber-600 shrink-0" />
                <a
                  href={`mailto:${empresa.email}`}
                  className="hover:text-red-700 transition-colors truncate"
                >
                  {empresa.email}
                </a>
              </div>
            )}
          </div>

          {/* Descripción */}
          {empresa.descripcion && (
            <>
              <div className="h-px bg-gray-100" />
              <p className="text-sm font-sans text-gray-600 leading-relaxed">
                {empresa.descripcion}
              </p>
            </>
          )}

          {/* Sitio web — CTA */}
          {empresa.sitio_web && (
            <>
              <div className="h-px bg-gray-100" />
              <a
                href={empresa.sitio_web}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Globe size={15} className="text-amber-600 shrink-0" />
                  <span className="text-base font-sans text-amber-800 font-medium truncate">
                    {empresa.sitio_web.replace(/^https?:\/\//, '')}
                  </span>
                </div>
                <ExternalLink size={14} className="text-amber-400 group-hover:text-amber-600 shrink-0 transition-colors" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}