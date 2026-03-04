package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type GaleriaHandler struct{}

func NewGaleriaHandler() *GaleriaHandler {
	return &GaleriaHandler{}
}

// GetAll obtiene todas las entradas de la galería
func (h *GaleriaHandler) GetAll(c *gin.Context) {
	var galeria []models.Galeria

	// Parámetros de consulta opcionales
	categoria := c.Query("categoria")
	destacados := c.Query("destacados")
	limite := c.Query("limite")

	query := database.DB.Model(&models.Galeria{})

	// Filtrar por categoría si se especifica
	if categoria != "" {
		query = query.Where("categoria = ?", categoria)
	}

	// Filtrar solo destacados si se especifica
	if destacados == "true" {
		query = query.Where("es_destacado = true")
	}

	// Ordenar por orden y fecha
	query = query.Order("orden ASC, created_at DESC")

	// Limitar resultados si se especifica
	if limite != "" {
		if limit, err := strconv.Atoi(limite); err == nil {
			query = query.Limit(limit)
		}
	}

	if err := query.Find(&galeria).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error al obtener galería histórica",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Galería histórica obtenida exitosamente",
		"data":    galeria,
		"count":   len(galeria),
	})
}

// GetByID obtiene una entrada específica de la galería
func (h *GaleriaHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	var item models.Galeria
	if err := database.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Elemento de galería no encontrado",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Elemento obtenido exitosamente",
		"data":    item,
	})
}

// GetDestacados obtiene solo los elementos destacados (para homepage)
func (h *GaleriaHandler) GetDestacados(c *gin.Context) {
	var destacados []models.Galeria

	if err := database.DB.Where("es_destacado = true").
		Order("orden ASC").
		Limit(6). // Máximo 6 para homepage
		Find(&destacados).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error al obtener elementos destacados",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Elementos destacados obtenidos",
		"data":    destacados,
	})
}

// GetCategorias obtiene todas las categorías disponibles
func (h *GaleriaHandler) GetCategorias(c *gin.Context) {
	var categorias []string

	if err := database.DB.Model(&models.Galeria{}).
		Distinct("categoria").
		Pluck("categoria", &categorias).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error al obtener categorías",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Categorías obtenidas exitosamente",
		"categorias": categorias,
	})
}

// Create crea una nueva entrada en la galería (solo admins)
func (h *GaleriaHandler) Create(c *gin.Context) {
	var req struct {
		Titulo      string `json:"titulo" binding:"required,max=200"`
		Descripcion string `json:"descripcion"`
		URLImagen   string `json:"url_imagen" binding:"required,max=500"`
		FechaHito   string `json:"fecha_hito"` // Format: "2006-01-02"
		Categoria   string `json:"categoria" binding:"required,oneof=inmigracion fundacion evento_historico cultura personaje_clave"`
		EsDestacado bool   `json:"es_destacado"`
		Orden       int    `json:"orden"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Datos inválidos: " + err.Error(),
		})
		return
	}

	// Crear nuevo elemento
	item := models.Galeria{
		Titulo:      req.Titulo,
		URLImagen:   req.URLImagen,
		Categoria:   req.Categoria,
		EsDestacado: req.EsDestacado,
		Orden:       req.Orden,
	}

	// Agregar descripción si se proporciona
	if req.Descripcion != "" {
		item.Descripcion = &req.Descripcion
	}

	// Parsear fecha si se proporciona
	if req.FechaHito != "" {
		if fecha, err := parseDate(req.FechaHito); err == nil {
			item.FechaHito = &fecha
		}
	}

	if err := database.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error al crear elemento de galería",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Elemento de galería creado exitosamente",
		"data":    item,
	})
}

// Update actualiza una entrada de la galería (solo admins)
func (h *GaleriaHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var item models.Galeria
	if err := database.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Elemento de galería no encontrado",
		})
		return
	}

	var req struct {
		Titulo      string `json:"titulo" binding:"max=200"`
		Descripcion string `json:"descripcion"`
		URLImagen   string `json:"url_imagen" binding:"max=500"`
		FechaHito   string `json:"fecha_hito"`
		Categoria   string `json:"categoria" binding:"oneof='' inmigracion fundacion evento_historico cultura personaje_clave"`
		EsDestacado *bool  `json:"es_destacado"`
		Orden       *int   `json:"orden"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Datos inválidos: " + err.Error(),
		})
		return
	}

	// Actualizar campos si se proporcionan
	if req.Titulo != "" {
		item.Titulo = req.Titulo
	}
	if req.Descripcion != "" {
		item.Descripcion = &req.Descripcion
	}
	if req.URLImagen != "" {
		item.URLImagen = req.URLImagen
	}
	if req.Categoria != "" {
		item.Categoria = req.Categoria
	}
	if req.EsDestacado != nil {
		item.EsDestacado = *req.EsDestacado
	}
	if req.Orden != nil {
		item.Orden = *req.Orden
	}

	// Actualizar fecha si se proporciona
	if req.FechaHito != "" {
		if fecha, err := parseDate(req.FechaHito); err == nil {
			item.FechaHito = &fecha
		}
	}

	if err := database.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error al actualizar elemento",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Elemento actualizado exitosamente",
		"data":    item,
	})
}

// Delete elimina una entrada de la galería (solo admins)
func (h *GaleriaHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	var item models.Galeria
	if err := database.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Elemento de galería no encontrado",
		})
		return
	}

	if err := database.DB.Delete(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error al eliminar elemento",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Elemento eliminado exitosamente",
	})
}

// Función auxiliar para parsear fechas
func parseDate(dateStr string) (time.Time, error) {
	return time.Parse("2006-01-02", dateStr)
}
