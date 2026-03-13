package handlers

import (
	"net/http"
	"strconv"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type SliderHandler struct{}

func NewSliderHandler() *SliderHandler {
	return &SliderHandler{}
}

func (h *SliderHandler) GetAll(c *gin.Context) {
	var items []models.SliderItem

	if err := database.DB.
		Where("es_activo = true").
		Order("orden ASC, created_at ASC").
		Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener slider"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Slider obtenido exitosamente",
		"data":    items,
		"count":   len(items),
	})
}

func (h *SliderHandler) GetAllAdmin(c *gin.Context) {
	var items []models.SliderItem

	if err := database.DB.
		Order("orden ASC, created_at ASC").
		Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener slider"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Slider obtenido exitosamente",
		"data":    items,
		"count":   len(items),
	})
}

func (h *SliderHandler) Create(c *gin.Context) {
	var req struct {
		URLImagen   string  `json:"url_imagen" binding:"required,max=500"`
		Titulo      *string `json:"titulo"`
		Descripcion *string `json:"descripcion"`
		Orden       int     `json:"orden"`
		EsActivo    *bool   `json:"es_activo"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	item := models.SliderItem{
		URLImagen:   req.URLImagen,
		Titulo:      req.Titulo,
		Descripcion: req.Descripcion,
		Orden:       req.Orden,
		EsActivo:    true,
	}
	if req.EsActivo != nil {
		item.EsActivo = *req.EsActivo
	}

	if err := database.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear item de slider"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Item de slider creado exitosamente",
		"data":    item,
	})
}

func (h *SliderHandler) Update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var item models.SliderItem
	if err := database.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item no encontrado"})
		return
	}

	var req struct {
		URLImagen   string  `json:"url_imagen"`
		Titulo      *string `json:"titulo"`
		Descripcion *string `json:"descripcion"`
		Orden       *int    `json:"orden"`
		EsActivo    *bool   `json:"es_activo"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	if req.URLImagen != "" {
		item.URLImagen = req.URLImagen
	}
	if req.Titulo != nil {
		item.Titulo = req.Titulo
	}
	if req.Descripcion != nil {
		item.Descripcion = req.Descripcion
	}
	if req.Orden != nil {
		item.Orden = *req.Orden
	}
	if req.EsActivo != nil {
		item.EsActivo = *req.EsActivo
	}

	if err := database.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Item actualizado exitosamente",
		"data":    item,
	})
}

func (h *SliderHandler) Delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var item models.SliderItem
	if err := database.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item no encontrado"})
		return
	}

	if err := database.DB.Delete(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al eliminar item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item eliminado exitosamente"})
}

func (h *SliderHandler) Reorder(c *gin.Context) {
	var req []struct {
		ID    uint `json:"id" binding:"required"`
		Orden int  `json:"orden"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	for _, item := range req {
		database.DB.Model(&models.SliderItem{}).
			Where("id_slider = ?", item.ID).
			Update("orden", item.Orden)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Orden actualizado exitosamente"})
}
