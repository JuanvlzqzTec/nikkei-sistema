'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { registroApi } from '@/lib/registroApi'

import type {
  WizardData,
  FamiliaPublica,
  RegistroComunitarioPayload,
  Generacion,
  Genero,
  NivelJapones,
} from './_types'
import { WIZARD_INITIAL_DATA, TOTAL_PASOS } from './_types'
import { ESTADO_OTRO_EXTRANJERO } from './_constants'
import { getSchemaForStep, wizardCompleteSchema } from './_schema'
import { useWizardStorage } from './_useWizardStorage'

import WizardLayout from './_components/WizardLayout'
import Paso1Nombre from './_pasos/Paso1Nombre'
import Paso2Origen from './_pasos/Paso2Origen'
import Paso3DatosPersonales from './_pasos/Paso3DatosPersonales'
import Paso4Contacto from './_pasos/Paso4Contacto'
import Paso5Preferencias from './_pasos/Paso5Preferencias'
import PasoConfirmacion from './_pasos/PasoConfirmacion'

const STEP_CONFIRMACION = TOTAL_PASOS + 1

export default function RegistroComunitarioPage() {
  const router = useRouter()
  const { isAuthenticated, user, checkAuth } = useAuthStore()
  const { saveDraft, loadDraft, clearDraft } = useWizardStorage()

  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<WizardData>(WIZARD_INITIAL_DATA)
  const [errors, setErrors] = useState<Partial<Record<keyof WizardData, string>>>({})
  const [hydrated, setHydrated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)

  const [familias, setFamilias] = useState<FamiliaPublica[]>([])

  const firstErrorInputRef = useRef<HTMLInputElement | null>(null)
  const firstErrorBlockRef = useRef<HTMLDivElement | null>(null)
  const scrollTopRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const init = async () => {
      await checkAuth()
      setAuthChecked(true)
    }
    init()
  }, [checkAuth])

  useEffect(() => {
    if (!authChecked) return
    if (!isAuthenticated) {
      router.push('/login?redirect=/registro-comunitario')
      return
    }
    if (user) {
      if (user.registro_estado === 'completado') {
        router.push('/dashboard')
        return
      }
      if (user.registro_estado === 'pendiente_revision') {
        router.push('/dashboard')
        return
      }
    }
  }, [authChecked, isAuthenticated, user, router])

  useEffect(() => {
    if (!authChecked || !isAuthenticated) return
    const draft = loadDraft()
    if (draft) {
      setData(draft.data)
      const stepToRestore = Math.min(draft.currentStep, TOTAL_PASOS)
      setCurrentStep(stepToRestore)
    }
    setHydrated(true)
  }, [authChecked, isAuthenticated, loadDraft])

  const updateField = useCallback(
    <K extends keyof WizardData>(key: K, value: WizardData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }))
      setErrors((prev) => {
        if (!(key in prev)) return prev
        const next = { ...prev }
        delete next[key]
        return next
      })
    },
    []
  )

  const handleFamiliasLoaded = useCallback((lista: FamiliaPublica[]) => {
    setFamilias(lista)
  }, [])

  const validateStep = (step: number): boolean => {
    const schema = getSchemaForStep(step)

    let payload: Record<string, unknown> = {}

    switch (step) {
      case 1:
        payload = {
          nombres: data.nombres,
          apellido_paterno: data.apellido_paterno,
          apellido_materno: data.apellido_materno,
          nombre_japones: data.nombre_japones,
          nombre_kanji: data.nombre_kanji,
        }
        break
      case 2:
        payload = {
          generacion: data.generacion,
          id_familia: data.id_familia,
          nueva_familia: data.nueva_familia,
        }
        break
      case 3:
        payload = {
          fecha_nacimiento: data.fecha_nacimiento,
          genero: data.genero,
          lugar_nacimiento: data.lugar_nacimiento,
        }
        break
      case 4:
        payload = {
          telefono_principal: data.telefono_principal,
          ciudad: data.ciudad,
          estado: data.estado,
          pais: data.pais,
        }
        break
      case 5:
        payload = {
          nivel_japones: data.nivel_japones,
          acepta_directorio_publico: data.acepta_directorio_publico,
          acepta_comunicaciones: data.acepta_comunicaciones,
        }
        break
    }

    const result = schema.safeParse(payload)
    if (result.success) {
      setErrors({})
      return true
    }

    const newErrors: Partial<Record<keyof WizardData, string>> = {}
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof WizardData
      if (!newErrors[key]) {
        newErrors[key] = issue.message
      }
    }
    setErrors(newErrors)

    setTimeout(() => {
      const target = firstErrorInputRef.current ?? firstErrorBlockRef.current
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        if (target instanceof HTMLInputElement) {
          target.focus()
        }
      }
    }, 50)

    return false
  }

  const handleNext = () => {
    if (currentStep <= TOTAL_PASOS) {
      if (!validateStep(currentStep)) return

      if (currentStep === TOTAL_PASOS) {
        setCurrentStep(STEP_CONFIRMACION)
        scrollTop()
        return
      }

      setCurrentStep(currentStep + 1)
      setErrors({})
      scrollTop()
    }
  }

  const handlePrev = () => {
    if (currentStep === STEP_CONFIRMACION) {
      setCurrentStep(TOTAL_PASOS)
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
    setErrors({})
    scrollTop()
  }

  const handleEditFromConfirmation = (step: number) => {
    setCurrentStep(step)
    setErrors({})
    scrollTop()
  }

  const scrollTop = () => {
    setTimeout(() => {
      scrollTopRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 50)
  }

  const handleSaveAndExit = async () => {
    setIsSaving(true)
    saveDraft(data, currentStep)
    await new Promise((resolve) => setTimeout(resolve, 400))
    setIsSaving(false)
    router.push('/dashboard')
  }

  const construirPayload = (): RegistroComunitarioPayload => {
    const esExtranjero = data.estado === ESTADO_OTRO_EXTRANJERO
    const ciudadFinal = esExtranjero
      ? [data.ciudad, data.pais].filter(Boolean).join(', ').trim() || undefined
      : data.ciudad?.trim() || undefined

    const payload: RegistroComunitarioPayload = {
      nombres: data.nombres.trim(),
      apellido_paterno: data.apellido_paterno.trim(),
      apellido_materno: data.apellido_materno?.trim() || undefined,
      nombre_japones: data.nombre_japones?.trim() || undefined,
      nombre_kanji: data.nombre_kanji?.trim() || undefined,

      generacion: data.generacion as Generacion,

      fecha_nacimiento: data.fecha_nacimiento,
      genero: data.genero as Genero,
      lugar_nacimiento: data.lugar_nacimiento?.trim() || undefined,

      telefono_principal: data.telefono_principal.trim(),
      ciudad: ciudadFinal,
      estado: data.estado,

      nivel_japones: (data.nivel_japones as NivelJapones) || undefined,
      acepta_directorio_publico: data.acepta_directorio_publico,
      acepta_comunicaciones: data.acepta_comunicaciones,
    }

    if (data.id_familia !== null) {
      payload.id_familia = data.id_familia
    } else if (data.nueva_familia) {
      payload.nueva_familia = {
        apellido_jp: data.nueva_familia.apellido_jp.trim(),
        apellido_kanji: data.nueva_familia.apellido_kanji?.trim() || undefined,
        prefectura_origen:
          data.nueva_familia.prefectura_origen?.trim() || undefined,
        anio_llegada_mexico: data.nueva_familia.anio_llegada_mexico
          ? parseInt(data.nueva_familia.anio_llegada_mexico, 10)
          : undefined,
      }
    }

    return payload
  }

  const handleSubmit = async () => {
    const fullPayload = {
      ...data,
    }
    const fullResult = wizardCompleteSchema.safeParse(fullPayload)
    if (!fullResult.success) {
      const firstIssue = fullResult.error.issues[0]
      const key = firstIssue.path[0] as keyof WizardData
      const stepOfKey = getStepOfField(key)
      setErrors({ [key]: firstIssue.message })
      setCurrentStep(stepOfKey)
      setErrorEnvio(
        'Hay datos incompletos. Te llevamos al paso que necesita atención.'
      )
      return
    }

    setIsSubmitting(true)
    setErrorEnvio(null)

    try {
      const payload = construirPayload()
      await registroApi.crearRegistro(payload)

      clearDraft()
      setEnviado(true)

      try {
        await checkAuth()
      } catch {
      }
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : 'No pudimos enviar tu registro. Por favor revisa tu conexión.'
      setErrorEnvio(mensaje)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepOfField = (field: keyof WizardData): number => {
    if (
      ['nombres', 'apellido_paterno', 'apellido_materno', 'nombre_japones', 'nombre_kanji'].includes(
        field
      )
    )
      return 1
    if (['generacion', 'id_familia', 'nueva_familia'].includes(field)) return 2
    if (['fecha_nacimiento', 'genero', 'lugar_nacimiento'].includes(field))
      return 3
    if (['telefono_principal', 'ciudad', 'estado', 'pais'].includes(field))
      return 4
    return 5
  }

  if (!authChecked || !hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-red-700" />
          <p className="font-sans text-base text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  // Pantalla de éxito tras enviar
  if (enviado) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background:
            'linear-gradient(135deg, #FEF7F0 0%, #FDE8D8 40%, #FCEEE8 100%)',
        }}
      >
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-amber-100 p-8 sm:p-10 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-5">
            <Check size={40} className="text-green-700" />
          </div>
          <h1 className="font-serif text-3xl text-red-800 leading-tight mb-3">
            ¡Tu registro fue enviado!
          </h1>
          <p className="font-sans text-base text-gray-600 leading-relaxed mb-6">
            Un administrador revisará tu solicitud en los próximos días. Te
            avisaremos cuando esté aprobada y puedas participar plenamente en la
            comunidad Nikkei de Sinaloa.
          </p>
          <p className="font-serif text-3xl text-red-900/15 select-none mb-1">
            ありがとう
          </p>
          <p className="font-sans text-xs text-gray-400 uppercase tracking-wider mb-8">
            Gracias por unirte a nuestra comunidad
          </p>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full min-h-14 px-6 py-3 bg-linear-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-sans font-semibold text-lg rounded-xl shadow-md transition-all duration-200 cursor-pointer"
          >
            Ir a mi dashboard
          </button>
        </div>
      </div>
    )
  }

  // Familia seleccionada (para pasar al paso de confirmación)
  const familiaSeleccionada =
    data.id_familia !== null
      ? familias.find((f) => f.id_familia === data.id_familia) ?? null
      : null

  const isConfirmacion = currentStep === STEP_CONFIRMACION

  return (
    <>
      <div ref={scrollTopRef} className="scroll-mt-4" />

      <WizardLayout
        currentStep={isConfirmacion ? TOTAL_PASOS : currentStep}
        onNext={isConfirmacion ? handleSubmit : handleNext}
        onPrev={currentStep > 1 ? handlePrev : undefined}
        nextLabel={isConfirmacion ? 'Enviar mi registro' : undefined}
        isLastStep={isConfirmacion}
        onSaveAndExit={isConfirmacion ? undefined : handleSaveAndExit}
        isSaving={isSaving}
        isSubmitting={isSubmitting}
      >
        {currentStep === 1 && (
          <Paso1Nombre
            data={data}
            errors={errors}
            onChange={updateField}
            firstErrorRef={firstErrorInputRef}
          />
        )}

        {currentStep === 2 && (
          <Paso2Origen
            data={data}
            errors={errors}
            onChange={updateField}
            onFamiliasLoaded={handleFamiliasLoaded}
            firstErrorRef={firstErrorBlockRef}
          />
        )}

        {currentStep === 3 && (
          <Paso3DatosPersonales
            data={data}
            errors={errors}
            onChange={updateField}
            firstErrorRef={firstErrorInputRef}
          />
        )}

        {currentStep === 4 && (
          <Paso4Contacto
            data={data}
            errors={errors}
            onChange={updateField}
            firstErrorRef={firstErrorInputRef}
          />
        )}

        {currentStep === 5 && (
          <Paso5Preferencias
            data={data}
            errors={errors}
            onChange={updateField}
            firstErrorRef={firstErrorBlockRef}
          />
        )}

        {isConfirmacion && (
          <PasoConfirmacion
            data={data}
            familiaSeleccionada={familiaSeleccionada}
            onEditStep={handleEditFromConfirmation}
            isSubmitting={isSubmitting}
            errorEnvio={errorEnvio}
            onRetry={handleSubmit}
          />
        )}
      </WizardLayout>
    </>
  )
}