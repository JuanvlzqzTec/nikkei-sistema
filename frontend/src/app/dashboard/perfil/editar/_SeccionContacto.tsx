'use client'

import { useState } from 'react'
import { Loader2, Check, X } from 'lucide-react'
import { perfilApi, type PersonaPerfil, type DatosLibresInput } from '@/lib/perfilApi'
import {
  ESTADOS_MEXICO,
  ESTADO_OTRO_EXTRANJERO,
} from '@/app/registro-comunitario/_constants'

interface Props {
  persona: PersonaPerfil
  onGuardadoOk: () => void
}

interface FormState {
  telefono_principal: string
  telefono_alternativo: string
  email_personal: string
  direccion_completa: string
  ciudad: string
  estado: string
  codigo_postal: string
}

function buildInitialForm(p: PersonaPerfil): FormState {
  return {
    telefono_principal: p.telefono_principal ?? '',
    telefono_alternativo: p.telefono_alternativo ?? '',
    email_personal: p.email_personal ?? '',
    direccion_completa: p.direccion_completa ?? '',
    ciudad: p.ciudad ?? '',
    estado: p.estado ?? 'Sinaloa',
    codigo_postal: p.codigo_postal ?? '',
  }
}

export default function SeccionContacto({ persona, onGuardadoOk }: Props) {
  const [form, setForm] = useState<FormState>(buildInitialForm(persona))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setCampo = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const handleGuardar = async () => {
    if (!form.telefono_principal.trim()) {
      setError('Por favor escribe tu teléfono principal')
      return
    }
    if (!form.estado.trim()) {
      setError('Por favor elige tu estado')
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload: DatosLibresInput = {
        telefono_principal: form.telefono_principal.trim(),
        telefono_alternativo: form.telefono_alternativo.trim() || null,
        email_personal: form.email_personal.trim() || null,
        direccion_completa: form.direccion_completa.trim() || null,
        ciudad: form.ciudad.trim() || null,
        estado: form.estado,
        codigo_postal: form.codigo_postal.trim() || null,
      }

      await perfilApi.actualizarDatosLibres(payload)
      onGuardadoOk()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelar = () => {
    setForm(buildInitialForm(persona))
    setError('')
  }

  return (
    <div className="space-y-5 pt-2">
      {/* Teléfono principal */}
      <div>
        <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
          Teléfono principal <span className="text-red-600">*</span>
        </label>
        <input
          type="tel"
          value={form.telefono_principal}
          onChange={(e) => setCampo('telefono_principal', e.target.value)}
          placeholder="667 123 4567"
          className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
        />
      </div>

      {/* Teléfono alternativo */}
      <div>
        <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
          Teléfono alternativo
          <span className="font-normal text-sm text-gray-400 ml-2">(opcional)</span>
        </label>
        <input
          type="tel"
          value={form.telefono_alternativo}
          onChange={(e) => setCampo('telefono_alternativo', e.target.value)}
          placeholder="Otro teléfono donde podamos localizarte"
          className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
        />
      </div>

      {/* Email personal */}
      <div>
        <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
          Correo personal
          <span className="font-normal text-sm text-gray-400 ml-2">(opcional)</span>
        </label>
        <input
          type="email"
          value={form.email_personal}
          onChange={(e) => setCampo('email_personal', e.target.value)}
          placeholder="Distinto al de tu cuenta"
          className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
        />
      </div>

      {/* Dirección */}
      <div>
        <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
          Dirección
          <span className="font-normal text-sm text-gray-400 ml-2">(opcional)</span>
        </label>
        <textarea
          value={form.direccion_completa}
          onChange={(e) => setCampo('direccion_completa', e.target.value)}
          rows={2}
          placeholder="Calle, número, colonia..."
          className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ciudad */}
        <div>
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Ciudad
            <span className="font-normal text-sm text-gray-400 ml-2">(opcional)</span>
          </label>
          <input
            type="text"
            value={form.ciudad}
            onChange={(e) => setCampo('ciudad', e.target.value)}
            placeholder="Culiacán"
            className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Estado <span className="text-red-600">*</span>
          </label>
          <select
            value={form.estado}
            onChange={(e) => setCampo('estado', e.target.value)}
            className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="">Elige un estado...</option>
            {ESTADOS_MEXICO.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
          {form.estado === ESTADO_OTRO_EXTRANJERO && (
            <p className="font-sans text-xs text-amber-700 mt-1.5 leading-relaxed">
              Si vives en el extranjero, agrega el país dentro del campo
              &ldquo;Ciudad&rdquo;.
            </p>
          )}
        </div>
      </div>

      {/* Código postal */}
      <div>
        <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
          Código postal
          <span className="font-normal text-sm text-gray-400 ml-2">(opcional)</span>
        </label>
        <input
          type="text"
          value={form.codigo_postal}
          onChange={(e) => setCampo('codigo_postal', e.target.value)}
          placeholder="80000"
          maxLength={10}
          className="w-full sm:w-40 text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
        />
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-2">
          <X size={16} className="text-red-700 shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-amber-100">
        <button
          onClick={handleCancelar}
          disabled={saving}
          className="sm:flex-1 min-h-13 px-5 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-sans font-semibold text-base rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          disabled={saving}
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
              Guardar cambios
            </>
          )}
        </button>
      </div>
    </div>
  )
}