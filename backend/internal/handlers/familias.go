package handlers

import (
	"net/http"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type FamiliasHandler struct{}

func NewFamiliasHandler() *FamiliasHandler {
	return &FamiliasHandler{}
}

func (h *FamiliasHandler) GetPublicas(c *gin.Context) {
	type FamiliaPublica struct {
		IDFamilia         uint    `json:"id_familia"`
		ApellidoJP        string  `json:"apellido_jp"`
		ApellidoRomanji   *string `json:"apellido_romanji"`
		ApellidoKanji     *string `json:"apellido_kanji"`
		PrefecturaOrigen  *string `json:"prefectura_origen"`
		AnioLlegadaMexico *int    `json:"anio_llegada_mexico"`
		LugarLlegada      *string `json:"lugar_llegada"`
		TotalMiembros     int64   `json:"total_miembros"`
		MiembrosPublicos  int64   `json:"miembros_publicos"`
	}

	var familias []models.Familia
	if err := database.DB.
		Where("pendiente_aprobacion = false").
		Order("apellido_jp ASC").
		Find(&familias).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener familias"})
		return
	}

	resultado := make([]FamiliaPublica, 0, len(familias))
	for _, f := range familias {
		var total, publicos int64
		database.DB.Model(&models.Persona{}).
			Where("id_familia = ?", f.IDFamilia).
			Count(&total)
		database.DB.Model(&models.Persona{}).
			Where("id_familia = ? AND acepta_directorio_publico = true AND es_miembro_activo = true", f.IDFamilia).
			Count(&publicos)

		resultado = append(resultado, FamiliaPublica{
			IDFamilia:         f.IDFamilia,
			ApellidoJP:        f.ApellidoJP,
			ApellidoRomanji:   f.ApellidoRomanji,
			ApellidoKanji:     f.ApellidoKanji,
			PrefecturaOrigen:  f.PrefecturaOrigen,
			AnioLlegadaMexico: f.AnioLlegadaMexico,
			LugarLlegada:      f.LugarLlegada,
			TotalMiembros:     total,
			MiembrosPublicos:  publicos,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Familias obtenidas exitosamente",
		"data":    resultado,
		"count":   len(resultado),
	})
}

func (h *FamiliasHandler) GetMiembrosPublicos(c *gin.Context) {
	id := c.Param("id")

	type MiembroPublico struct {
		IDPersona       uint    `json:"id_persona"`
		Nombres         string  `json:"nombres"`
		ApellidoPaterno string  `json:"apellido_paterno"`
		ApellidoMaterno *string `json:"apellido_materno"`
		Generacion      string  `json:"generacion"`
	}

	var familia models.Familia
	if err := database.DB.First(&familia, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Familia no encontrada"})
		return
	}

	var miembros []MiembroPublico
	if err := database.DB.Model(&models.Persona{}).
		Where("id_familia = ? AND acepta_directorio_publico = true AND es_miembro_activo = true", id).
		Order("generacion ASC, nombres ASC").
		Find(&miembros).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener miembros"})
		return
	}

	var total int64
	database.DB.Model(&models.Persona{}).Where("id_familia = ?", id).Count(&total)

	c.JSON(http.StatusOK, gin.H{
		"message":           "Miembros obtenidos",
		"familia":           familia,
		"miembros_publicos": miembros,
		"total_miembros":    total,
		"miembros_visibles": len(miembros),
	})
}
