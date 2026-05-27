'use client'

import { useState } from 'react'
import { ArrowLeft, Check, Loader2, AlertCircle, Info } from 'lucide-react'
import {
  genealogiaApi,
  type PersonaResumen,
  type CrearPersonaHistoricaInput,
} from '@/lib/genealogiaApi'
import { GENERACIONES, GENEROS } from '@/app/registro-comunitario/_constants'

interface Props {
  idFamiliaMia: number
  apellidoFamilia: string
  onCreada: (p: PersonaResumen) => void
  onCancelar: () => void
}

export default function FormPersonaHistorica({
  idFamiliaMia,
  apellidoFamilia,
  onCreada,
  onCancelar,
}: Props) {
  const [form, setForm] = useState<CrearPersonaHistoricaInput>({
    id_familia: idFamiliaMia,
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    nombre_japones: '',
    nombre_kanji: '',
    generacion: 'issei',
    genero: '',
    fecha_nacimiento: '',
    notas: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setCampo = <K extends keyof CrearPersonaHistoricaInput>(
    k: K,
    v: CrearPersonaHistoricaInput[K]
  ) => setForm((prev) => ({ ...prev, [k]: v }))

  const handleGuardar = async () => {
    if (!form.nombres.trim()) {
      setError('Los nombres son requeridos')
      return
    }
    if (!form.apellido_paterno.trim()) {
      setError('El apellido paterno es requerido')
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload: CrearPersonaHistoricaInput = {
        id_familia: form.id_familia,
        nombres: form.nombres.trim(),
        apellido_paterno: form.apellido_paterno.trim(),
        apellido_materno: form.apellido_materno?.trim() || undefined,
        nombre_japones: form.nombre_japones?.trim() || undefined,
        nombre_kanji: form.nombre_kanji?.trim() || undefined,
        generacion: form.generacion,
        genero: form.genero || undefined,
        fecha_nacimiento: form.fecha_nacimiento || undefined,
        notas: form.notas?.trim() || undefined,
      }
      const res = await genealogiaApi.crearPersonaHistorica(payload)
      onCreada(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear persona')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-amber-50/60 border-2 border-amber-300 rounded-xl p-5 space-y-5">
      <div className="flex items-start gap-3">
        <Info size={20} className="text-amber-700 shrink-0 mt-1" />
        <div>
          <h3 className="font-serif text-xl text-amber-900 leading-tight mb-1">
            Registrar pariente histórico
          </h3>
          <p className="font-sans text-base text-amber-800 leading-relaxed">
            Esta persona quedará registrada como parte de la{' '}
            <strong>Familia {apellidoFamilia}</strong> pero sin cuenta de
            usuario. Úsalo solo para parientes que no podrán usar el sistema
            (por ejemplo, fallecidos o sin acceso digital).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Nombres <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={form.nombres}
            onChange={(e) => setCampo('nombres', e.target.value)}
            className="w-full text-base font-sans px-4 py-3 border-2 border-amber-200 rounded-xl bg-white focus:border-red-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Apellido paterno <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={form.apellido_paterno}
            onChange={(e) => setCampo('apellido_paterno', e.target.value)}
            className="w-full text-base font-sans px-4 py-3 border-2 border-amber-200 rounded-xl bg-white focus:border-red-400 focus:outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Apellido materno
            <span className="font-normal text-sm text-gray-400 ml-2">(opcional)</span>
          </label>
          <input
            type="text"
            value={form.apellido_materno}
            onChange={(e) => setCampo('apellido_materno', e.target.value)}
            className="w-full text-base font-sans px-4 py-3 border-2 border-amber-200 rounded-xl bg-white focus:border-red-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Nombre en japonés
            <span className="font-normal text-sm text-gray-400 ml-2">(opcional)</span>
          </label>
          <input
            type="text"
            value={form.nombre_japones}
            onChange={(e) => setCampo('nombre_japones', e.target.value)}
            className="w-full text-base font-sans px-4 py-3 border-2 border-amber-200 rounded-xl bg-white focus:border-red-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Nombre en kanji
            <span className="font-normal text-sm text-gray-400 ml-2">(opcional)</span>
          </label>
          <input
            type="text"
            value={form.nombre_kanji}
            onChange={(e) => setCampo('nombre_kanji', e.target.value)}
            lang="ja"
            className="w-full text-base font-sans px-4 py-3 border-2 border-amber-200 rounded-xl bg-white focus:border-red-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Generación <span className="text-red-600">*</span>
          </label>
          <select
            value={form.generacion}
            onChange={(e) => setCampo('generacion', e.target.value)}
            className="w-full text-base font-sans px-4 py-3 border-2 border-amber-200 rounded-xl bg-white focus:border-red-400 focus:outline-none cursor-pointer"
          >
            {GENERACIONES.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Género
            <span className="font-normal text-sm text-gray-400 ml-2">(opcional)</span>
          </label>
          <select
            value={form.genero}
            onChange={(e) => setCampo('genero', e.target.value)}
            className="w-full text-base font-sans px-4 py-3 border-2 border-amber-200 rounded-xl bg-white focus:border-red-400 focus:outline-none cursor-pointer"
          >
            <option value="">Sin especificar</option>
            {GENEROS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Fecha de nacimiento
            <span className="font-normal text-sm text-gray-400 ml-2">(opcional)</span>
          </label>
          <input
            type="date"
            value={form.fecha_nacimiento}
            onChange={(e) => setCampo('fecha_nacimiento', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full text-base font-sans px-4 py-3 border-2 border-amber-200 rounded-xl bg-white focus:border-red-400 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
          Notas
          <span className="font-normal text-sm text-gray-400 ml-2">(opcional)</span>
        </label>
        <textarea
          value={form.notas}
          onChange={(e) => setCampo('notas', e.target.value)}
          rows={2}
          placeholder="Información adicional sobre esta persona..."
          className="w-full text-base font-sans px-4 py-3 border-2 border-amber-200 rounded-xl bg-white focus:border-red-400 focus:outline-none resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-700 shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onCancelar}
          disabled={saving}
          className="flex-1 min-h-13 px-5 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-sans font-semibold text-base rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
        <button
          type="button"
          onClick={handleGuardar}
          disabled={saving}
          className="flex-1 min-h-13 px-5 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-sans font-semibold text-base rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Registrar persona
        </button>
      </div>
    </div>
  )
}