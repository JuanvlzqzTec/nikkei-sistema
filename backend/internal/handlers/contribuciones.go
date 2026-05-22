package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/middleware"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type ContribucionesHandler struct{}

func NewContribucionesHandler() *ContribucionesHandler {
	return &ContribucionesHandler{}
}

func (h *ContribucionesHandler) Crear(c *gin.Context) {
	userID, _, _, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No autenticado"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}
	if user.IDPersona == nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error":   "Registro no completado",
			"message": "Debes completar tu registro comunitario antes de hacer una contribución",
		})
		return
	}

	var req struct {
		Mensaje          string  `json:"mensaje" binding:"required"`
		TelefonoContacto *string `json:"telefono_contacto"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	mensajeLimpio := strings.TrimSpace(req.Mensaje)
	if len(mensajeLimpio) < 20 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Por favor cuéntanos un poco más (mínimo 20 caracteres)",
		})
		return
	}
	if len(mensajeLimpio) > 2000 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "El mensaje es demasiado largo (máximo 2000 caracteres)",
		})
		return
	}

	contribucion := models.Contribucion{
		IDUser:           userID,
		Mensaje:          mensajeLimpio,
		TelefonoContacto: req.TelefonoContacto,
		Estado:           "pendiente",
	}

	if err := database.DB.Create(&contribucion).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar tu contribución"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "¡Gracias por compartir! Un administrador te contactará pronto.",
		"data":    contribucion,
	})
}

func (h *ContribucionesHandler) GetPendientes(c *gin.Context) {
	type PersonaInfo struct {
		Nombres           string  `json:"nombres"`
		ApellidoPaterno   string  `json:"apellido_paterno"`
		ApellidoMaterno   *string `json:"apellido_materno"`
		TelefonoPrincipal *string `json:"telefono_principal"`
	}

	type ContribucionAdmin struct {
		models.Contribucion
		Email   string       `json:"email"`
		Persona *PersonaInfo `json:"persona"`
	}

	var contribuciones []models.Contribucion

	query := database.DB.Model(&models.Contribucion{}).Order("created_at DESC")
	if estado := c.Query("estado"); estado != "" {
		query = query.Where("estado = ?", estado)
	} else {
		query = query.Where("estado = ?", "pendiente")
	}

	if err := query.Find(&contribuciones).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener contribuciones"})
		return
	}

	resultado := make([]ContribucionAdmin, 0, len(contribuciones))
	for _, ct := range contribuciones {
		item := ContribucionAdmin{Contribucion: ct}

		var user models.User
		if err := database.DB.First(&user, ct.IDUser).Error; err != nil {
			continue
		}
		item.Email = user.Email

		if user.IDPersona != nil {
			var persona models.Persona
			if err := database.DB.First(&persona, *user.IDPersona).Error; err == nil {
				item.Persona = &PersonaInfo{
					Nombres:           persona.Nombres,
					ApellidoPaterno:   persona.ApellidoPaterno,
					ApellidoMaterno:   persona.ApellidoMaterno,
					TelefonoPrincipal: persona.TelefonoPrincipal,
				}
			}
		}

		resultado = append(resultado, item)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Contribuciones obtenidas",
		"data":    resultado,
		"count":   len(resultado),
	})
}

func (h *ContribucionesHandler) MarcarEstado(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Estado    string  `json:"estado" binding:"required"`
		NotaAdmin *string `json:"nota_admin"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.Estado != "atendida" && req.Estado != "descartada" && req.Estado != "pendiente" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Estado inválido. Usa: pendiente, atendida o descartada"})
		return
	}

	updates := map[string]interface{}{
		"estado": req.Estado,
	}
	if req.NotaAdmin != nil {
		updates["nota_admin"] = req.NotaAdmin
	}

	result := database.DB.Model(&models.Contribucion{}).
		Where("id_contribucion = ?", id).
		Updates(updates)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contribución no encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Contribución actualizada"})
}
