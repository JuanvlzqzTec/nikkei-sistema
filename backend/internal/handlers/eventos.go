package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/middleware"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/models"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type EventosHandler struct{}

func NewEventosHandler() *EventosHandler {
	return &EventosHandler{}
}

func (h *EventosHandler) GetProximos(c *gin.Context) {
	var eventos []models.Evento

	limite := 2
	if l := c.Query("limite"); l != "" {
		if n, err := strconv.Atoi(l); err == nil {
			limite = n
		}
	}

	if err := database.DB.
		Where("status = ? AND fecha_inicio > ?", "publicado", time.Now()).
		Order("fecha_inicio ASC").
		Limit(limite).
		Find(&eventos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener eventos"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Eventos próximos obtenidos",
		"data":    eventos,
		"count":   len(eventos),
	})
}

func (h *EventosHandler) GetAll(c *gin.Context) {
	var eventos []models.Evento

	query := database.DB.Model(&models.Evento{})

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if tipo := c.Query("tipo"); tipo != "" {
		query = query.Where("tipo_evento = ?", tipo)
	}

	query = query.Order("fecha_inicio DESC")

	if err := query.Find(&eventos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener eventos"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Eventos obtenidos exitosamente",
		"data":    eventos,
		"count":   len(eventos),
	})
}

func (h *EventosHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	var evento models.Evento

	if err := database.DB.First(&evento, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Evento obtenido exitosamente",
		"data":    evento,
	})
}

func (h *EventosHandler) Create(c *gin.Context) {
	userID, _, _, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No autenticado"})
		return
	}

	var req struct {
		Titulo              string  `json:"titulo" binding:"required,max=200"`
		Descripcion         *string `json:"descripcion"`
		TipoEvento          string  `json:"tipo_evento" binding:"required"`
		FechaInicio         string  `json:"fecha_inicio" binding:"required"`
		FechaFin            *string `json:"fecha_fin"`
		Ubicacion           *string `json:"ubicacion"`
		Direccion           *string `json:"direccion"`
		Ciudad              *string `json:"ciudad"`
		CapacidadMaxima     *int    `json:"capacidad_maxima"`
		RequiereRegistro    *bool   `json:"requiere_registro"`
		ImagenEvento        *string `json:"imagen_evento"`
		LinkTransmision     *string `json:"link_transmision"`
		Requisitos          *string `json:"requisitos"`
		ContactoOrganizador *string `json:"contacto_organizador"`
		Status              string  `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	fechaInicio, err := time.Parse("2006-01-02T15:04:05-07:00", req.FechaInicio)
	if err != nil {
		fechaInicio, err = time.Parse("2006-01-02T15:04", req.FechaInicio)
		if err != nil {
			fechaInicio, err = time.Parse("2006-01-02", req.FechaInicio)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de fecha inválido. Usa YYYY-MM-DD o YYYY-MM-DDTHH:MM"})
				return
			}
		}
	}

	evento := models.Evento{
		IDOrganizador:       userID,
		Titulo:              req.Titulo,
		Descripcion:         req.Descripcion,
		TipoEvento:          req.TipoEvento,
		FechaInicio:         fechaInicio,
		Ubicacion:           req.Ubicacion,
		Direccion:           req.Direccion,
		Ciudad:              req.Ciudad,
		CapacidadMaxima:     req.CapacidadMaxima,
		ImagenEvento:        req.ImagenEvento,
		LinkTransmision:     req.LinkTransmision,
		Requisitos:          req.Requisitos,
		ContactoOrganizador: req.ContactoOrganizador,
		Status:              "borrador",
		RequiereRegistro:    true,
	}

	if req.RequiereRegistro != nil {
		evento.RequiereRegistro = *req.RequiereRegistro
	}
	if req.Status != "" {
		evento.Status = req.Status
	}

	// Fecha fin opcional
	if req.FechaFin != nil {
		if ff, err := time.Parse("2006-01-02T15:04:05-07:00", *req.FechaFin); err == nil {
			evento.FechaFin = &ff
		} else if ff, err := time.Parse("2006-01-02T15:04", *req.FechaFin); err == nil {
			evento.FechaFin = &ff
		} else if ff, err := time.Parse("2006-01-02", *req.FechaFin); err == nil {
			evento.FechaFin = &ff
		}
	}

	if err := database.DB.Create(&evento).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear evento"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Evento creado exitosamente",
		"data":    evento,
	})
}

func (h *EventosHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var evento models.Evento

	if err := database.DB.First(&evento, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento no encontrado"})
		return
	}

	var req struct {
		Titulo              string  `json:"titulo"`
		Descripcion         *string `json:"descripcion"`
		TipoEvento          string  `json:"tipo_evento"`
		FechaInicio         string  `json:"fecha_inicio"`
		FechaFin            *string `json:"fecha_fin"`
		Ubicacion           *string `json:"ubicacion"`
		Direccion           *string `json:"direccion"`
		Ciudad              *string `json:"ciudad"`
		CapacidadMaxima     *int    `json:"capacidad_maxima"`
		RequiereRegistro    *bool   `json:"requiere_registro"`
		ImagenEvento        *string `json:"imagen_evento"`
		LinkTransmision     *string `json:"link_transmision"`
		Requisitos          *string `json:"requisitos"`
		ContactoOrganizador *string `json:"contacto_organizador"`
		Status              string  `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	if req.Titulo != "" {
		evento.Titulo = req.Titulo
	}
	if req.Descripcion != nil {
		evento.Descripcion = req.Descripcion
	}
	if req.TipoEvento != "" {
		evento.TipoEvento = req.TipoEvento
	}
	if req.FechaInicio != "" {
		if fi, err := time.Parse("2006-01-02T15:04:05-07:00", req.FechaInicio); err == nil {
			evento.FechaInicio = fi
		} else if fi, err := time.Parse("2006-01-02T15:04", req.FechaInicio); err == nil {
			evento.FechaInicio = fi
		} else if fi, err := time.Parse("2006-01-02", req.FechaInicio); err == nil {
			evento.FechaInicio = fi
		}
	}
	if req.FechaFin != nil {
		if ff, err := time.Parse("2006-01-02T15:04:05-07:00", *req.FechaFin); err == nil {
			evento.FechaFin = &ff
		} else if ff, err := time.Parse("2006-01-02T15:04", *req.FechaFin); err == nil {
			evento.FechaFin = &ff
		} else if ff, err := time.Parse("2006-01-02", *req.FechaFin); err == nil {
			evento.FechaFin = &ff
		}
	}
	if req.Ubicacion != nil {
		evento.Ubicacion = req.Ubicacion
	}
	if req.Direccion != nil {
		evento.Direccion = req.Direccion
	}
	if req.Ciudad != nil {
		evento.Ciudad = req.Ciudad
	}
	if req.CapacidadMaxima != nil {
		evento.CapacidadMaxima = req.CapacidadMaxima
	}
	if req.RequiereRegistro != nil {
		evento.RequiereRegistro = *req.RequiereRegistro
	}
	if req.ImagenEvento != nil {
		evento.ImagenEvento = req.ImagenEvento
	}
	if req.LinkTransmision != nil {
		evento.LinkTransmision = req.LinkTransmision
	}
	if req.Requisitos != nil {
		evento.Requisitos = req.Requisitos
	}
	if req.ContactoOrganizador != nil {
		evento.ContactoOrganizador = req.ContactoOrganizador
	}
	if req.Status != "" {
		evento.Status = req.Status
	}

	if err := database.DB.Save(&evento).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar evento"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Evento actualizado exitosamente",
		"data":    evento,
	})
}

func (h *EventosHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	var evento models.Evento

	if err := database.DB.First(&evento, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento no encontrado"})
		return
	}

	if err := database.DB.Delete(&evento).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al eliminar evento"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Evento eliminado exitosamente"})
}

func (h *EventosHandler) UpdateStatus(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status requerido"})
		return
	}

	validStatus := map[string]bool{
		"borrador": true, "publicado": true,
		"en_curso": true, "finalizado": true, "cancelado": true,
	}
	if !validStatus[req.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status inválido"})
		return
	}

	result := database.DB.Model(&models.Evento{}).
		Where("id_evento = ?", id).
		Update("status", req.Status)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar status"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status actualizado exitosamente"})
}

func (h *EventosHandler) Registrarse(c *gin.Context) {
	idEvento, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var evento models.Evento
	if err := database.DB.First(&evento, idEvento).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento no encontrado"})
		return
	}
	if evento.Status != "publicado" && evento.Status != "en_curso" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El evento no está disponible para registro"})
		return
	}

	var req struct {
		NombreVisitante *string `json:"nombre_visitante"`
		EdadVisitante   *int    `json:"edad_visitante"`
		Acompaniantes   int     `json:"acompaniantes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	participacion := models.ParticipacionEvento{
		IDEvento:        uint(idEvento),
		Acompaniantes:   req.Acompaniantes,
		NombreVisitante: req.NombreVisitante,
		EdadVisitante:   req.EdadVisitante,
	}

	// Si hay usuario autenticado, vincular su persona
	tokenHeader := c.GetHeader("Authorization")
	if tokenHeader != "" {
		authService := services.NewAuthService()
		token := strings.TrimPrefix(tokenHeader, "Bearer ")
		if claims, err := authService.ValidateToken(token); err == nil {
			var user models.User
			if err := database.DB.First(&user, claims.UserID).Error; err == nil && user.IDPersona != nil {
				// Verificar si ya está registrado
				var existente models.ParticipacionEvento
				if err := database.DB.Where("id_persona = ? AND id_evento = ?", *user.IDPersona, idEvento).First(&existente).Error; err == nil {
					c.JSON(http.StatusConflict, gin.H{
						"error":         "ya_registrado",
						"message":       "Ya estás registrado en este evento",
						"acompaniantes": existente.Acompaniantes,
					})
					return
				}
				participacion.IDPersona = *user.IDPersona
			}
		}
	}

	if err := database.DB.Create(&participacion).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al registrar participación"})
		return
	}

	// Contar total de registrados para devolver al frontend
	var total int64
	database.DB.Model(&models.ParticipacionEvento{}).Where("id_evento = ?", idEvento).Count(&total)

	c.JSON(http.StatusCreated, gin.H{
		"message": "¡Registro exitoso!",
		"total":   total,
	})
}

func (h *EventosHandler) GetParticipantes(c *gin.Context) {
	idEvento, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	type ParticipanteResumen struct {
		IDParticipacion uint   `json:"id_participacion"`
		IDPersona       uint   `json:"id_persona"`
		NombreCompleto  string `json:"nombre_completo"`
		Acompaniantes   int    `json:"acompaniantes"`
		FechaRegistro   string `json:"fecha_registro"`
	}

	var participaciones []models.ParticipacionEvento
	if err := database.DB.Where("id_evento = ?", idEvento).Order("created_at ASC").Find(&participaciones).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener participantes"})
		return
	}

	resultado := make([]ParticipanteResumen, 0, len(participaciones))
	totalAsistentes := 0

	for _, p := range participaciones {
		nombre := "Visitante"
		if p.NombreVisitante != nil {
			nombre = *p.NombreVisitante
		} else if p.IDPersona != 0 {
			var persona models.Persona
			if err := database.DB.First(&persona, p.IDPersona).Error; err == nil {
				nombre = persona.GetNombreCompleto()
			}
		}
		totalAsistentes += 1 + p.Acompaniantes
		resultado = append(resultado, ParticipanteResumen{
			IDParticipacion: p.IDParticipacion,
			IDPersona:       p.IDPersona,
			NombreCompleto:  nombre,
			Acompaniantes:   p.Acompaniantes,
			FechaRegistro:   p.CreatedAt.Format("2006-01-02 15:04"),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"data":             resultado,
		"count":            len(resultado),
		"total_asistentes": totalAsistentes,
	})
}
