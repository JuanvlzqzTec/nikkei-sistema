'use client'

import { Check, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import type { WizardData, FamiliaPublica } from '../_types'
import {
  GENERACIONES,
  GENEROS,
  NIVELES_JAPONES,
  ESTADO_OTRO_EXTRANJERO,
} from '../_constants'

interface Props {
  data: WizardData
  familiaSeleccionada?: FamiliaPublica | null
  familiaSecundariaSeleccionada?: FamiliaPublica | null
  onEditStep: (step: number) => void
  isSubmitting: boolean
  errorEnvio: string | null
  onRetry: () => void
}

export default function PasoConfirmacion({
  data,
  familiaSeleccionada,
  familiaSecundariaSeleccionada,
  onEditStep,
  isSubmitting,
  errorEnvio,
  onRetry,
}: Props) {
  const labelGeneracion =
    GENERACIONES.find((g) => g.value === data.generacion)?.label ?? '—'

  const labelGenero =
    GENEROS.find((g) => g.value === data.genero)?.label ?? '—'

  const labelNivelJapones =
    NIVELES_JAPONES.find((n) => n.value === data.nivel_japones)?.label ?? '—'

  const nombreCompleto = [
    data.nombres,
    data.apellido_paterno,
    data.apellido_materno,
  ]
    .filter(Boolean)
    .join(' ')

  const ubicacion =
    data.estado === ESTADO_OTRO_EXTRANJERO
      ? `${data.ciudad ? data.ciudad + ', ' : ''}${data.pais}`
      : [data.ciudad, data.estado].filter(Boolean).join(', ')

  const fechaNacimientoLegible = data.fecha_nacimiento
    ? new Date(data.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—'

  return (
    <div className="space-y-2">
      <div className="mb-8">
        <h2 className="font-serif text-2xl sm:text-3xl text-red-800 leading-tight mb-2">
          Revisa tu información
        </h2>
        <p className="font-sans text-base text-gray-600 leading-relaxed">
          Tómate un momento para confirmar que todo esté correcto. Puedes editar
          cualquier sección si lo necesitas.
        </p>
      </div>

      {/* Estado de envío */}
      {isSubmitting && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 flex items-center gap-3 mb-6">
          <Loader2 size={22} className="animate-spin text-amber-700 shrink-0" />
          <p className="font-sans text-base text-amber-900">
            Estamos enviando tu registro, por favor espera un momento...
          </p>
        </div>
      )}

      {errorEnvio && !isSubmitting && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle size={22} className="text-red-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-sans text-base font-semibold text-red-800 mb-1">
                No pudimos enviar tu registro
              </p>
              <p className="font-sans text-base text-red-700 leading-relaxed">
                {errorEnvio}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-sans font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw size={16} />
            Reintentar envío
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Bloque 1: Nombre */}
        <BloqueResumen
          titulo="Tu nombre"
          onEditar={() => onEditStep(1)}
          isSubmitting={isSubmitting}
        >
          <Campo label="Nombre completo" valor={nombreCompleto || '—'} />
          {data.nombre_japones && (
            <Campo label="Nombre en japonés" valor={data.nombre_japones} />
          )}
          {data.nombre_kanji && (
            <Campo label="Nombre en kanji" valor={data.nombre_kanji} />
          )}
        </BloqueResumen>

        {/* Bloque 2: Origen Nikkei */}
        <BloqueResumen
          titulo="Tu origen Nikkei"
          onEditar={() => onEditStep(2)}
          isSubmitting={isSubmitting}
        >
          <Campo label="Generación" valor={labelGeneracion} />
          {data.nueva_familia ? (
            <>
              <Campo label="Familia principal" valor={`${data.nueva_familia.apellido_jp} (nueva — pendiente de aprobación)`} />
            </>
          ) : familiaSeleccionada ? (
            <Campo label="Familia principal" valor={`Familia ${familiaSeleccionada.apellido_jp}`} />
          ) : (
            <Campo label="Familia principal" valor="—" />
          )}

          {data.nueva_familia_secundaria ? (
            <Campo label="Familia secundaria" valor={`${data.nueva_familia_secundaria.apellido_jp} (nueva — pendiente de aprobación)`} />
          ) : familiaSecundariaSeleccionada ? (
            <Campo label="Familia secundaria" valor={`Familia ${familiaSecundariaSeleccionada.apellido_jp}`} />
          ) : null}
        </BloqueResumen>

        {/* Bloque 3: Datos personales */}
        <BloqueResumen
          titulo="Datos personales"
          onEditar={() => onEditStep(3)}
          isSubmitting={isSubmitting}
        >
          <Campo label="Fecha de nacimiento" valor={fechaNacimientoLegible} />
          <Campo label="Género" valor={labelGenero} />
          {data.lugar_nacimiento && (
            <Campo label="Lugar de nacimiento" valor={data.lugar_nacimiento} />
          )}
        </BloqueResumen>

        {/* Bloque 4: Contacto */}
        <BloqueResumen
          titulo="Cómo contactarte"
          onEditar={() => onEditStep(4)}
          isSubmitting={isSubmitting}
        >
          <Campo label="Teléfono" valor={data.telefono_principal || '—'} />
          <Campo label="Ubicación" valor={ubicacion || '—'} />
        </BloqueResumen>

        {/* Bloque 5: Preferencias */}
        <BloqueResumen
          titulo="Tus preferencias"
          onEditar={() => onEditStep(5)}
          isSubmitting={isSubmitting}
        >
          <Campo label="Nivel de japonés" valor={labelNivelJapones} />
          <Campo
            label="Aparecer en directorio"
            valor={data.acepta_directorio_publico ? 'Sí' : 'No'}
          />
          <Campo
            label="Recibir noticias"
            valor={data.acepta_comunicaciones ? 'Sí' : 'No'}
          />
        </BloqueResumen>
      </div>

      {/* Nota final */}
      <div className="mt-8 p-5 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start gap-3">
        <Check size={20} className="text-amber-700 shrink-0 mt-0.5" />
        <p className="font-sans text-base text-amber-900 leading-relaxed">
          Al enviar tu registro, un administrador lo revisará y lo aprobará en
          los próximos días. Te avisaremos cuando esté listo.
        </p>
      </div>
    </div>
  )
}

function BloqueResumen({
  titulo,
  onEditar,
  isSubmitting,
  children,
}: {
  titulo: string
  onEditar: () => void
  isSubmitting: boolean
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-serif text-lg text-red-800">{titulo}</h3>
        <button
          type="button"
          onClick={onEditar}
          disabled={isSubmitting}
          className="font-sans text-base font-semibold text-red-700 hover:text-red-900 underline underline-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
        >
          Editar
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
      <span className="font-sans text-sm text-gray-500 sm:w-44 shrink-0">
        {label}
      </span>
      <span className="font-sans text-base text-gray-800 font-medium">
        {valor}
      </span>
    </div>
  )
}