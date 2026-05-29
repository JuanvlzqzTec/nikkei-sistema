package handlers

import (
	"net/http"
	"strings"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/services"
	"github.com/gin-gonic/gin"
)

type ContactoHandler struct {
	emailService *services.EmailService
}

func NewContactoHandler() *ContactoHandler {
	return &ContactoHandler{
		emailService: services.NewEmailService(),
	}
}

func (h *ContactoHandler) Enviar(c *gin.Context) {
	var req struct {
		Nombre  string `json:"nombre" binding:"required"`
		Correo  string `json:"correo" binding:"required,email"`
		Mensaje string `json:"mensaje" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	nombre := strings.TrimSpace(req.Nombre)
	correo := strings.TrimSpace(req.Correo)
	mensaje := strings.TrimSpace(req.Mensaje)

	if len(nombre) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Por favor escribe tu nombre"})
		return
	}
	if len(mensaje) < 10 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El mensaje es demasiado corto"})
		return
	}
	if len(mensaje) > 2000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El mensaje es demasiado largo (máximo 2000 caracteres)"})
		return
	}

	if err := h.emailService.EnviarContacto(nombre, correo, mensaje); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "No se pudo enviar el mensaje. Inténtalo de nuevo más tarde.",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Mensaje enviado exitosamente"})
}
