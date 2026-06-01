package handlers

import (
	"net/http"
	"time"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/gin-gonic/gin"
)

type AdminEstadisticasHandler struct{}

func NewAdminEstadisticasHandler() *AdminEstadisticasHandler {
	return &AdminEstadisticasHandler{}
}

type conteo struct {
	Clave string `gorm:"column:clave" json:"clave"`
	Total int64  `gorm:"column:total" json:"total"`
}

// Handler principal

func (h *AdminEstadisticasHandler) GetEstadisticas(c *gin.Context) {

	// KPIs generales
	var totalPersonas, totalMiembrosActivos, totalFamilias, totalEventos, totalEmpresas int64
	database.DB.Table("personas").Count(&totalPersonas)
	database.DB.Table("personas").Where("es_miembro_activo = true").Count(&totalMiembrosActivos)
	database.DB.Table("familias").Where("pendiente_aprobacion = false").Count(&totalFamilias)
	database.DB.Table("eventos").Count(&totalEventos)
	database.DB.Table("empresas").Where("status_aprobacion = 'aprobada'").Count(&totalEmpresas)

	// Registros pendientes de revisión
	var registrosPendientes int64
	database.DB.Table("users").Where("registro_estado = 'pendiente_revision'").Count(&registrosPendientes)

	// ─Distribucion por generacion
	var porGeneracion []conteo
	database.DB.Table("personas").
		Select("generacion as clave, count(*) as total").
		Group("generacion").
		Order("total DESC").
		Scan(&porGeneracion)

	// Distribucion por genero
	var porGenero []conteo
	database.DB.Table("personas").
		Select("COALESCE(genero, 'no_especificado') as clave, count(*) as total").
		Group("genero").
		Order("total DESC").
		Scan(&porGenero)

	// Distribucion por nivel de Japones
	var porNivelJapones []conteo
	database.DB.Table("personas").
		Select("COALESCE(nivel_japones, 'no_especificado') as clave, count(*) as total").
		Group("nivel_japones").
		Order("total DESC").
		Scan(&porNivelJapones)

	// Rangos de edad
	type rangoEdad struct {
		Rango string `json:"rango"`
		Total int64  `json:"total"`
	}
	var rangosEdad []rangoEdad
	database.DB.Raw(`
		SELECT rango, COUNT(*) as total FROM (
			SELECT
				CASE
					WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_nacimiento)) < 18  THEN '0-17'
					WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_nacimiento)) < 30  THEN '18-29'
					WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_nacimiento)) < 45  THEN '30-44'
					WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_nacimiento)) < 60  THEN '45-59'
					ELSE '60+'
				END as rango
			FROM personas
			WHERE fecha_nacimiento IS NOT NULL
		) sub
		GROUP BY rango
		ORDER BY rango ASC
	`).Scan(&rangosEdad)

	// Incorporaciones por mes
	type mesConteo struct {
		Mes   string `json:"mes" gorm:"column:mes"`
		Total int64  `json:"total" gorm:"column:total"`
	}
	var incorporacionesMensuales []mesConteo
	database.DB.Raw(`
		SELECT TO_CHAR(fecha_ingreso_asociacion, 'YYYY-MM') as mes, COUNT(*) as total
		FROM personas
		WHERE fecha_ingreso_asociacion IS NOT NULL
		  AND fecha_ingreso_asociacion >= NOW() - INTERVAL '12 months'
		GROUP BY mes
		ORDER BY mes ASC
	`).Scan(&incorporacionesMensuales)

	// Ciudad de residencia
	var porCiudad []conteo
	database.DB.Table("personas").
		Select("COALESCE(ciudad, 'No especificada') as clave, count(*) as total").
		Group("ciudad").
		Order("total DESC").
		Limit(8).
		Scan(&porCiudad)

	// Estadisticas de eventos
	var eventosPorTipo []conteo
	database.DB.Table("eventos").
		Select("tipo_evento as clave, count(*) as total").
		Group("tipo_evento").
		Order("total DESC").
		Scan(&eventosPorTipo)

	var eventosPorStatus []conteo
	database.DB.Table("eventos").
		Select("status as clave, count(*) as total").
		Group("status").
		Order("total DESC").
		Scan(&eventosPorStatus)

	// Top 5 eventos por participantes
	type eventoParticipacion struct {
		IDEvento      uint   `json:"id_evento"    gorm:"column:id_evento"`
		Titulo        string `json:"titulo"       gorm:"column:titulo"`
		TipoEvento    string `json:"tipo_evento"  gorm:"column:tipo_evento"`
		FechaInicio   string `json:"fecha_inicio" gorm:"column:fecha_inicio"`
		Registros     int64  `json:"registros"    gorm:"column:registros"`
		TotalPersonas int64  `json:"total_personas" gorm:"column:total_personas"`
	}
	var topEventos []eventoParticipacion
	database.DB.Raw(`
		SELECT e.id_evento, e.titulo, e.tipo_evento,
		       TO_CHAR(e.fecha_inicio, 'YYYY-MM-DD') as fecha_inicio,
		       COUNT(p.id_participacion) as registros,
		       COALESCE(SUM(p.acompaniantes + 1), 0) as total_personas
		FROM eventos e
		LEFT JOIN participacion_eventos p ON p.id_evento = e.id_evento
		GROUP BY e.id_evento, e.titulo, e.tipo_evento, e.fecha_inicio
		ORDER BY total_personas DESC
		LIMIT 5
	`).Scan(&topEventos)

	// Participaciones por mes
	var participacionesMensuales []mesConteo
	database.DB.Raw(`
		SELECT TO_CHAR(created_at, 'YYYY-MM') as mes, COUNT(*) as total
		FROM participacion_eventos
		WHERE created_at >= NOW() - INTERVAL '12 months'
		GROUP BY mes
		ORDER BY mes ASC
	`).Scan(&participacionesMensuales)

	// Tasa de miembros con datos completos
	var conTelefono, conFoto, conFechaNac, aceptanDirectorio int64
	database.DB.Table("personas").Where("telefono_principal IS NOT NULL AND telefono_principal != ''").Count(&conTelefono)
	database.DB.Table("personas").Where("foto_perfil IS NOT NULL").Count(&conFoto)
	database.DB.Table("personas").Where("fecha_nacimiento IS NOT NULL").Count(&conFechaNac)
	database.DB.Table("personas").Where("acepta_directorio_publico = true").Count(&aceptanDirectorio)

	// Crecimiento por usuarioss
	var usuariosMensuales []mesConteo
	database.DB.Raw(`
		SELECT TO_CHAR(created_at, 'YYYY-MM') as mes, COUNT(*) as total
		FROM users
		WHERE created_at >= NOW() - INTERVAL '12 months'
		GROUP BY mes
		ORDER BY mes ASC
	`).Scan(&usuariosMensuales)

	c.JSON(http.StatusOK, gin.H{
		"generado_en": time.Now().Format(time.RFC3339),
		"comunidad": gin.H{
			"total_personas":       totalPersonas,
			"miembros_activos":     totalMiembrosActivos,
			"total_familias":       totalFamilias,
			"registros_pendientes": registrosPendientes,
			"por_generacion":       porGeneracion,
			"por_genero":           porGenero,
			"por_nivel_japones":    porNivelJapones,
			"rangos_edad":          rangosEdad,
			"incorporaciones":      incorporacionesMensuales,
			"por_ciudad":           porCiudad,
			"con_telefono":         conTelefono,
			"con_foto":             conFoto,
			"con_fecha_nacimiento": conFechaNac,
			"aceptan_directorio":   aceptanDirectorio,
		},
		"eventos": gin.H{
			"total":                     totalEventos,
			"total_empresas":            totalEmpresas,
			"por_tipo":                  eventosPorTipo,
			"por_status":                eventosPorStatus,
			"top_eventos":               topEventos,
			"participaciones_mensuales": participacionesMensuales,
		},
		"usuarios": gin.H{
			"mensuales": usuariosMensuales,
		},
	})
}
