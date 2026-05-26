'use client'

import { useState } from 'react'
import { Loader2, Check, X } from 'lucide-react'
import { perfilApi, type PersonaPerfil, type DatosLibresInput } from '@/lib/perfilApi'
import { NIVELES_JAPONES } from '@/app/registro-comunitario/_constants'

const ESTADOS_CIVIL: { value: string; label: string }[] = [
  { value: '', label: 'Prefiero no decir' },
  { value: 'soltero', label: 'Soltero/a' },
  { value: 'casado', label: 'Casado/a' },
  { value: 'union_libre', label: 'Unión libre' },
  { value: 'divorciado', label: 'Divorciado/a' },
  { value: 'viudo', label: 'Viudo/a' },
]

interface Props {
  persona: PersonaPerfil
  onGuardadoOk: () => void
}

interface FormState {
  estado_civil: string
  nivel_japones: string
  acepta_directorio_publico: boolean
  acepta_comunicaciones: boolean
  participa_eventos: boolean
}

function buildInitialForm(p: PersonaPerfil): FormState {
  return {
    estado_civil: p.estado_civil ?? '',
    nivel_japones: p.nivel_japones ?? '',
    acepta_directorio_publico: p.acepta_directorio_publico,
    acepta_comunicaciones: p.acepta_comunicaciones,
    participa_eventos: p.participa_eventos,
  }
}

export default function SeccionPreferencias({ persona, onGuardadoOk }: Props) {
  const [form, setForm] = useState<FormState>(buildInitialForm(persona))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setCampo = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const handleGuardar = async () => {
    setSaving(true)
    setError('')

    try {
      const payload: DatosLibresInput = {
        estado_civil: form.estado_civil || null,
        nivel_japones: form.nivel_japones || null,
        acepta_directorio_publico: form.acepta_directorio_publico,
        acepta_comunicaciones: form.acepta_comunicaciones,
        participa_eventos: form.participa_eventos,
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
      {/* Estado civil */}
      <div>
        <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
          Estado civil
        </label>
        <select
          value={form.estado_civil}
          onChange={(e) => setCampo('estado_civil', e.target.value)}
          className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors cursor-pointer"
        >
          {ESTADOS_CIVIL.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </select>
      </div>

      {/* Nivel de japonés */}
      <div>
        <label className="block font-sans text-base font-semibold text-gray-800 mb-3">
          Nivel de japonés
        </label>
        <div className="space-y-2">
          {NIVELES_JAPONES.map((nivel) => {
            const seleccionado = form.nivel_japones === nivel.value
            return (
              <button
                key={nivel.value}
                type="button"
                onClick={() => setCampo('nivel_japones', nivel.value)}
                className={`w-full text-left min-h-15 px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  seleccionado
                    ? 'border-red-700 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-red-300 hover:bg-amber-50/50'
                }`}
              >
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span
                    className={`font-sans text-base font-bold ${
                      seleccionado ? 'text-red-800' : 'text-gray-800'
                    }`}
                  >
                    {nivel.label}
                  </span>
                  <span className="font-sans text-sm text-gray-500">
                    — {nivel.descripcion}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Toggles de privacidad */}
      <div className="pt-2 space-y-3 border-t border-gray-100">
        <label
          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            form.acepta_directorio_publico
              ? 'border-red-700 bg-red-50'
              : 'border-gray-200 bg-white hover:border-red-300 hover:bg-amber-50/50'
          }`}
        >
          <input
            type="checkbox"
            checked={form.acepta_directorio_publico}
            onChange={(e) =>
              setCampo('acepta_directorio_publico', e.target.checked)
            }
            className="w-6 h-6 mt-0.5 rounded accent-red-700 cursor-pointer shrink-0"
          />
          <div>
            <p className="font-sans text-base font-semibold text-gray-800">
              Aparecer en el directorio de mi familia
            </p>
            <p className="font-sans text-sm text-gray-500 mt-1 leading-relaxed">
              Otros miembros podrán ver tu nombre al explorar el árbol familiar.
            </p>
          </div>
        </label>

        <label
          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            form.acepta_comunicaciones
              ? 'border-red-700 bg-red-50'
              : 'border-gray-200 bg-white hover:border-red-300 hover:bg-amber-50/50'
          }`}
        >
          <input
            type="checkbox"
            checked={form.acepta_comunicaciones}
            onChange={(e) => setCampo('acepta_comunicaciones', e.target.checked)}
            className="w-6 h-6 mt-0.5 rounded accent-red-700 cursor-pointer shrink-0"
          />
          <div>
            <p className="font-sans text-base font-semibold text-gray-800">
              Recibir noticias y eventos
            </p>
            <p className="font-sans text-sm text-gray-500 mt-1 leading-relaxed">
              Te avisaremos sobre matsuris, ceremonias y actividades.
            </p>
          </div>
        </label>

        <label
          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            form.participa_eventos
              ? 'border-red-700 bg-red-50'
              : 'border-gray-200 bg-white hover:border-red-300 hover:bg-amber-50/50'
          }`}
        >
          <input
            type="checkbox"
            checked={form.participa_eventos}
            onChange={(e) => setCampo('participa_eventos', e.target.checked)}
            className="w-6 h-6 mt-0.5 rounded accent-red-700 cursor-pointer shrink-0"
          />
          <div>
            <p className="font-sans text-base font-semibold text-gray-800">
              Quiero participar activamente en eventos
            </p>
            <p className="font-sans text-sm text-gray-500 mt-1 leading-relaxed">
              Si lo desactivas, no aparecerás en convocatorias de organizadores.
            </p>
          </div>
        </label>
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