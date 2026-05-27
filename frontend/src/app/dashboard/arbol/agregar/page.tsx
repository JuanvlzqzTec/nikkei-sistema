'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2, Check, X, AlertCircle } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { genealogiaApi, type PersonaResumen } from '@/lib/genealogiaApi'
import { perfilApi } from '@/lib/perfilApi'
import { TIPOS_RELACION } from '../_constants'
import SelectorPersona from './_SelectorPersona'
import FormPersonaHistorica from './_FormPersonaHistorica'

export default function AgregarParientePage() {
  const router = useRouter()
  const { isAuthenticated, user, checkAuth } = useAuthStore()

  const [idFamiliaMia, setIdFamiliaMia] = useState<number | null>(null)
  const [apellidoFamilia, setApellidoFamilia] = useState('')
  const [loadingPerfil, setLoadingPerfil] = useState(true)

  const [seleccionada, setSeleccionada] = useState<PersonaResumen | null>(null)
  const [tipoRelacion, setTipoRelacion] = useState('')
  const [notas, setNotas] = useState('')
  const [mostrarFormularioNueva, setMostrarFormularioNueva] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) checkAuth()
  }, [isAuthenticated, checkAuth])

  const cargarPerfil = useCallback(async () => {
    try {
      setLoadingPerfil(true)
      const res = await perfilApi.get()
      setIdFamiliaMia(res.data.familia.id_familia)
      setApellidoFamilia(res.data.familia.apellido_jp)
    } catch {
      setError('No pudimos cargar tu información')
    } finally {
      setLoadingPerfil(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.registro_estado !== 'completado') {
        router.push('/dashboard')
        return
      }
      cargarPerfil()
    }
  }, [isAuthenticated, user, router, cargarPerfil])

  const handleGuardar = async () => {
    if (!seleccionada) {
      setError('Selecciona o registra al pariente')
      return
    }
    if (!tipoRelacion) {
      setError('Elige el tipo de relación')
      return
    }

    setSaving(true)
    setError('')
    try {
      await genealogiaApi.crearRelacion({
        id_pariente: seleccionada.id_persona,
        tipo_relacion: tipoRelacion,
        notas: notas.trim() || undefined,
      })
      router.push('/dashboard/arbol')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated || !user || loadingPerfil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-red-700" />
      </div>
    )
  }

  // Agrupar tipos de relación por categoría
  const grupos = {
    ascendente: TIPOS_RELACION.filter((t) => t.categoria === 'ascendente') as { value: string; label: string; categoria: string }[],
    horizontal: TIPOS_RELACION.filter((t) => t.categoria === 'horizontal') as { value: string; label: string; categoria: string }[],
    descendente: TIPOS_RELACION.filter((t) => t.categoria === 'descendente') as { value: string; label: string; categoria: string }[],
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)' }}
    >
      <header className="bg-white/80 backdrop-blur-sm border-b border-red-800/15 shadow-sm sticky top-0 z-10 p-3">
        <div className="container-nikkei py-4 flex items-center justify-between gap-4">
          <Link href="/dashboard/arbol" className="flex items-center gap-3">
            <Image
              src="/assets/Logo-Nikkei.png"
              alt="Asociación Nikkei"
              width={44}
              height={44}
              className="rounded-full"
              priority
            />
            <div className="hidden sm:block">
              <p className="font-serif text-red-800 text-base leading-tight">
                Agregar pariente
              </p>
              <p className="font-sans text-xs text-red-600/70">
                Asociación Nikkei de Sinaloa
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/arbol"
            className="flex items-center gap-2 text-base font-sans text-red-700 hover:text-red-900 font-semibold cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Volver al árbol</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </div>
      </header>

      <main className="container-nikkei py-10 lg:py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <h1 className="font-serif text-4xl text-red-800 leading-tight pt-3">
              Agregar un pariente
            </h1>
            <div className="mx-auto h-1 w-24 rounded-full bg-linear-to-r from-red-600 to-amber-400" />
            <p className="font-sans text-lg text-red-600/80 max-w-xl mx-auto">
              Conecta a otro miembro de la comunidad como tu pariente.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-700 shrink-0 mt-0.5" />
              <p className="font-sans text-base text-red-900 flex-1">{error}</p>
              <button onClick={() => setError('')} className="text-red-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>
          )}

          {/* Paso 1: ¿Quién? */}
          <section className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 sm:p-8 space-y-4">
            <div>
              <p className="font-sans text-sm text-red-700 font-bold uppercase tracking-wider mb-1">
                Paso 1
              </p>
              <h2 className="font-serif text-2xl text-red-800 leading-tight">
                ¿Quién es tu pariente?
              </h2>
            </div>

            {mostrarFormularioNueva && idFamiliaMia ? (
              <FormPersonaHistorica
                idFamiliaMia={idFamiliaMia}
                apellidoFamilia={apellidoFamilia}
                onCreada={(p) => {
                  setSeleccionada(p)
                  setMostrarFormularioNueva(false)
                }}
                onCancelar={() => setMostrarFormularioNueva(false)}
              />
            ) : (
              idFamiliaMia && (
                <SelectorPersona
                  idFamiliaMia={idFamiliaMia}
                  seleccionada={seleccionada}
                  onSelect={setSeleccionada}
                  onSolicitarCrearNueva={() => setMostrarFormularioNueva(true)}
                />
              )
            )}
          </section>

          {/* Paso 2: ¿Qué relación? */}
          {seleccionada && (
            <section className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 sm:p-8 space-y-5">
              <div>
                <p className="font-sans text-sm text-red-700 font-bold uppercase tracking-wider mb-1">
                  Paso 2
                </p>
                <h2 className="font-serif text-2xl text-red-800 leading-tight">
                  ¿Qué es {seleccionada.nombres.split(' ')[0]} para ti?
                </h2>
              </div>

              <GrupoRelaciones
                titulo="Generaciones mayores"
                opciones={grupos.ascendente}
                seleccionada={tipoRelacion}
                onSelect={setTipoRelacion}
              />
              <GrupoRelaciones
                titulo="Mi misma generación"
                opciones={grupos.horizontal}
                seleccionada={tipoRelacion}
                onSelect={setTipoRelacion}
              />
              <GrupoRelaciones
                titulo="Generaciones menores"
                opciones={grupos.descendente}
                seleccionada={tipoRelacion}
                onSelect={setTipoRelacion}
              />

              {/* Notas */}
              <div className="pt-2 border-t border-amber-100">
                <label className="block font-sans text-base font-semibold text-gray-800 mb-2">
                  Notas
                  <span className="font-normal text-sm text-gray-400 ml-2">(opcional)</span>
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={2}
                  placeholder="Información adicional sobre esta relación..."
                  className="w-full text-base font-sans px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-400 focus:outline-none resize-none"
                />
              </div>
            </section>
          )}

          {/* Guardar */}
          {seleccionada && tipoRelacion && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/arbol"
                className="sm:flex-1 min-h-13 px-5 py-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-sans font-semibold text-base rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                Cancelar
              </Link>
              <button
                onClick={handleGuardar}
                disabled={saving}
                className="sm:flex-1 min-h-13 px-6 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 disabled:from-gray-300 disabled:to-gray-400 text-white font-sans font-semibold text-base rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Guardar relación
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

interface GrupoProps {
  titulo: string
  opciones: { value: string; label: string; categoria: string }[]
  seleccionada: string
  onSelect: (v: string) => void
}

function GrupoRelaciones({ titulo, opciones, seleccionada, onSelect }: GrupoProps) {
  return (
    <div>
      <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {titulo}
      </p>
      <div className="flex flex-wrap gap-2">
        {opciones.map((opcion) => {
          const activo = seleccionada === opcion.value
          return (
            <button
              key={opcion.value}
              type="button"
              onClick={() => onSelect(opcion.value)}
              className={`px-4 py-2 rounded-xl border-2 font-sans text-base font-semibold transition-all cursor-pointer ${
                activo
                  ? 'border-red-700 bg-red-50 text-red-800'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-amber-50/50'
              }`}
            >
              {opcion.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}