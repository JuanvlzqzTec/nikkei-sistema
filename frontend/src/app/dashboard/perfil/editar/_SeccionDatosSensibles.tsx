'use client'

import { useState } from 'react'
import { Loader2, Check, X, AlertTriangle } from 'lucide-react'
import {
  perfilApi,
  type PersonaPerfil,
  type FamiliaResumen,
  type CambioSensibleInput,
} from '@/lib/perfilApi'
import { GENERACIONES, GENEROS } from '@/app/registro-comunitario/_constants'
import SelectorFamiliaSimple from './_SelectorFamiliaSimple'

interface Props {
  persona: PersonaPerfil
  familiaActual: FamiliaResumen
  onGuardadoOk: () => void
}

interface FormState {
  nombres: string
  apellido_paterno: string
  apellido_materno: string
  nombre_japones: string
  nombre_kanji: string
  fecha_nacimiento: string
  lugar_nacimiento: string
  genero: string
  generacion: string
  id_familia: number | null
}

function buildInitialForm(p: PersonaPerfil): FormState {
  return {
    nombres: p.nombres,
    apellido_paterno: p.apellido_paterno,
    apellido_materno: p.apellido_materno ?? '',
    nombre_japones: p.nombre_japones ?? '',
    nombre_kanji: p.nombre_kanji ?? '',
    fecha_nacimiento: p.fecha_nacimiento
      ? p.fecha_nacimiento.split('T')[0]
      : '',
    lugar_nacimiento: p.lugar_nacimiento ?? '',
    genero: p.genero ?? '',
    generacion: p.generacion,
    id_familia: null,
  }
}

export default function SeccionDatosSensibles({
  persona,
  familiaActual,
  onGuardadoOk,
}: Props) {
  const [form, setForm] = useState<FormState>(buildInitialForm(persona))
  const [confirmando, setConfirmando] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setCampo = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  // Calcular qué cambió respecto al original
  const cambios = (): CambioSensibleInput => {
    const c: CambioSensibleInput = {}

    if (form.nombres.trim() !== persona.nombres) c.nombres = form.nombres.trim()
    if (form.apellido_paterno.trim() !== persona.apellido_paterno)
      c.apellido_paterno = form.apellido_paterno.trim()

    const matOrig = persona.apellido_materno ?? ''
    if (form.apellido_materno.trim() !== matOrig)
      c.apellido_materno = form.apellido_materno.trim() || null

    const jpOrig = persona.nombre_japones ?? ''
    if (form.nombre_japones.trim() !== jpOrig)
      c.nombre_japones = form.nombre_japones.trim() || null

    const kanjiOrig = persona.nombre_kanji ?? ''
    if (form.nombre_kanji.trim() !== kanjiOrig)
      c.nombre_kanji = form.nombre_kanji.trim() || null

    const fechaOrig = persona.fecha_nacimiento
      ? persona.fecha_nacimiento.split('T')[0]
      : ''
    if (form.fecha_nacimiento !== fechaOrig)
      c.fecha_nacimiento = form.fecha_nacimiento

    const lugarOrig = persona.lugar_nacimiento ?? ''
    if (form.lugar_nacimiento.trim() !== lugarOrig)
      c.lugar_nacimiento = form.lugar_nacimiento.trim() || null

    if (form.genero !== (persona.genero ?? '')) c.genero = form.genero
    if (form.generacion !== persona.generacion) c.generacion = form.generacion

    if (form.id_familia !== null && form.id_familia !== familiaActual.id_familia)
      c.id_familia = form.id_familia

    return c
  }

  const hayCambios = Object.keys(cambios()).length > 0

  const handleSolicitar = async () => {
    const c = cambios()
    if (Object.keys(c).length === 0) {
      setError('No hiciste ningún cambio')
      return
    }

    // Validaciones básicas
    if (!form.nombres.trim()) {
      setError('Los nombres no pueden quedar vacíos')
      return
    }
    if (!form.apellido_paterno.trim()) {
      setError('El apellido paterno no puede quedar vacío')
      return
    }
    if (!form.fecha_nacimiento) {
      setError('La fecha de nacimiento no puede quedar vacía')
      return
    }

    setSaving(true)
    setError('')

    try {
      await perfilApi.solicitarCambio(c)
      onGuardadoOk()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al solicitar el cambio')
      setConfirmando(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelar = () => {
    setForm(buildInitialForm(persona))
    setError('')
    setConfirmando(false)
  }

  return (
    <div className="space-y-5 pt-2">
      {/* Aviso de impacto */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-serif text-base text-amber-900 font-semibold mb-1">
            Importante antes de continuar
          </p>
          <p className="font-sans text-sm text-amber-800 leading-relaxed">
            Cualquier cambio aquí pondrá tu registro nuevamente en revisión.
            Mientras un administrador no apruebe los cambios, tu cuenta quedará
            temporalmente inactiva. Tu acceso al sistema se mantiene, pero no
            podrás participar plenamente en la comunidad.
          </p>
        </div>
      </div>

      {/* Nombres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Nombres <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={form.nombres}
            onChange={(e) => setCampo('nombres', e.target.value)}
            className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
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
            className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Apellido materno
            <span className="font-normal text-sm text-gray-400 ml-2">
              (opcional)
            </span>
          </label>
          <input
            type="text"
            value={form.apellido_materno}
            onChange={(e) => setCampo('apellido_materno', e.target.value)}
            className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Nombres japonés / kanji */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
        <div>
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Nombre en japonés
            <span className="font-normal text-sm text-gray-400 ml-2">
              (opcional)
            </span>
          </label>
          <input
            type="text"
            value={form.nombre_japones}
            onChange={(e) => setCampo('nombre_japones', e.target.value)}
            className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Nombre en kanji
            <span className="font-normal text-sm text-gray-400 ml-2">
              (opcional)
            </span>
          </label>
          <input
            type="text"
            value={form.nombre_kanji}
            onChange={(e) => setCampo('nombre_kanji', e.target.value)}
            lang="ja"
            className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Fecha y género */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
        <div>
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Fecha de nacimiento <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            value={form.fecha_nacimiento}
            onChange={(e) => setCampo('fecha_nacimiento', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Género
          </label>
          <select
            value={form.genero}
            onChange={(e) => setCampo('genero', e.target.value)}
            className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="">Sin especificar</option>
            {GENEROS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
            Lugar de nacimiento
            <span className="font-normal text-sm text-gray-400 ml-2">
              (opcional)
            </span>
          </label>
          <input
            type="text"
            value={form.lugar_nacimiento}
            onChange={(e) => setCampo('lugar_nacimiento', e.target.value)}
            placeholder="Culiacán, Sinaloa"
            className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Generación */}
      <div className="pt-2 border-t border-gray-100">
        <label className="block font-sans text-base font-semibold text-gray-800 mb-3">
          Generación Nikkei
        </label>
        <div className="space-y-2">
          {GENERACIONES.map((g) => {
            const seleccionado = form.generacion === g.value
            return (
              <button
                key={g.value}
                type="button"
                onClick={() => setCampo('generacion', g.value)}
                className={`w-full text-left min-h-15 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${
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
                    {g.label}
                  </span>
                  <span className="font-sans text-sm text-gray-500">
                    — {g.descripcion}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Familia */}
      <div className="pt-2 border-t border-gray-100">
        <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
          Familia
        </label>
        <p className="font-sans text-sm text-gray-500 mb-3 leading-relaxed">
          Actualmente perteneces a la{' '}
          <strong className="text-red-800">
            Familia {familiaActual.apellido_jp}
            {familiaActual.apellido_kanji && ` (${familiaActual.apellido_kanji})`}
          </strong>
          . Si quieres cambiarla, busca y selecciona la nueva familia abajo.
        </p>
        <SelectorFamiliaSimple
          idFamiliaActual={familiaActual.id_familia}
          idFamiliaSeleccionada={form.id_familia}
          onSelect={(id) => setCampo('id_familia', id)}
        />
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-start gap-2">
          <X size={16} className="text-red-700 shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Confirmación de envío */}
      {confirmando && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={22} className="text-red-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-serif text-lg text-red-900 mb-1">
                ¿Confirmas estos cambios?
              </p>
              <p className="font-sans text-sm text-red-800 leading-relaxed">
                Tu registro pasará a estado pendiente de revisión y un
                administrador deberá aprobarlo. Esto puede tardar algunos días.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setConfirmando(false)}
              disabled={saving}
              className="sm:flex-1 min-h-13 px-5 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-sans font-semibold text-base rounded-xl cursor-pointer disabled:opacity-50"
            >
              No, regresar
            </button>
            <button
              onClick={handleSolicitar}
              disabled={saving}
              className="sm:flex-1 min-h-13 px-6 py-3 bg-red-700 hover:bg-red-800 disabled:bg-gray-400 text-white font-sans font-semibold text-base rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Sí, enviar solicitud
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Acciones principales */}
      {!confirmando && (
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-amber-100">
          <button
            onClick={handleCancelar}
            disabled={saving || !hayCambios}
            className="sm:flex-1 min-h-13 px-5 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-sans font-semibold text-base rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={() => setConfirmando(true)}
            disabled={saving || !hayCambios}
            className="sm:flex-1 min-h-13 px-6 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 disabled:from-gray-300 disabled:to-gray-400 text-white font-sans font-semibold text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <AlertTriangle size={16} />
            Solicitar cambio
          </button>
        </div>
      )}
    </div>
  )
}