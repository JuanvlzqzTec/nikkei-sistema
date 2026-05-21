package handlers

import (
	"net/http"
	"strings"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/middleware"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type EmpresasEmpleadorasHandler struct{}

func NewEmpresasEmpleadorasHandler() *EmpresasEmpleadorasHandler {
	return &EmpresasEmpleadorasHandler{}
}

func (h *EmpresasEmpleadorasHandler) GetAll(c *gin.Context) {
	var empresas []models.EmpresaEmpleadora

	query := database.DB.Model(&models.EmpresaEmpleadora{})

	if q := c.Query("q"); q != "" {
		query = query.Where("nombre_empresa ILIKE ?", "%"+q+"%")
	}

	query = query.Order("nombre_empresa ASC").Limit(10)

	if err := query.Find(&empresas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener empresas empleadoras"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Empresas empleadoras obtenidas",
		"data":    empresas,
		"count":   len(empresas),
	})
}

func (h *EmpresasEmpleadorasHandler) Create(c *gin.Context) {
	_, _, _, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No autenticado"})
		return
	}

	var req struct {
		NombreEmpresa string  `json:"nombre_empresa" binding:"required,max=200"`
		Descripcion   *string `json:"descripcion"`
		Ciudad        *string `json:"ciudad"`
		Estado        *string `json:"estado"`
		Pais          string  `json:"pais"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	nombreLimpio := strings.TrimSpace(req.NombreEmpresa)
	if nombreLimpio == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El nombre de la empresa es requerido"})
		return
	}

	pais := "México"
	if req.Pais != "" {
		pais = req.Pais
	}

	var existente models.EmpresaEmpleadora
	q := database.DB.Where("LOWER(TRIM(nombre_empresa)) = LOWER(?)", nombreLimpio)
	if req.Ciudad != nil && *req.Ciudad != "" {
		q = q.Where("LOWER(TRIM(ciudad)) = LOWER(?)", strings.TrimSpace(*req.Ciudad))
	} else {
		q = q.Where("ciudad IS NULL OR ciudad = ''")
	}
	if req.Estado != nil && *req.Estado != "" {
		q = q.Where("LOWER(TRIM(estado)) = LOWER(?)", strings.TrimSpace(*req.Estado))
	} else {
		q = q.Where("estado IS NULL OR estado = ''")
	}

	if err := q.First(&existente).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{
			"message":     "Empresa empleadora ya existía, devolviendo la existente",
			"data":        existente,
			"reutilizada": true,
		})
		return
	}

	empresa := models.EmpresaEmpleadora{
		NombreEmpresa: nombreLimpio,
		Descripcion:   req.Descripcion,
		Ciudad:        req.Ciudad,
		Estado:        req.Estado,
		Pais:          pais,
	}

	if err := database.DB.Create(&empresa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear empresa empleadora"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "Empresa empleadora creada",
		"data":        empresa,
		"reutilizada": false,
	})
}

func (h *EmpresasEmpleadorasHandler) GetMiEmpleo(c *gin.Context) {
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
			"error": "Registro no completado",
		})
		return
	}

	var persona models.Persona
	if err := database.DB.First(&persona, *user.IDPersona).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Persona no encontrada"})
		return
	}

	if persona.IDEmpresaEmpleadora == nil {
		c.JSON(http.StatusOK, gin.H{
			"message":      "Sin empleo registrado",
			"tiene_empleo": false,
			"data":         nil,
			"puesto":       persona.Puesto,
		})
		return
	}

	var empresa models.EmpresaEmpleadora
	if err := database.DB.First(&empresa, *persona.IDEmpresaEmpleadora).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{
			"message":      "Empresa empleadora no encontrada",
			"tiene_empleo": false,
			"data":         nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Empleo obtenido",
		"tiene_empleo": true,
		"data":         empresa,
		"puesto":       persona.Puesto,
	})
}

func (h *EmpresasEmpleadorasHandler) UpdateMiEmpleo(c *gin.Context) {
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
			"error": "Registro no completado",
		})
		return
	}

	var req struct {
		IDEmpresaEmpleadora *uint   `json:"id_empresa_empleadora"`
		Puesto              *string `json:"puesto"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	if req.IDEmpresaEmpleadora != nil {
		var empresa models.EmpresaEmpleadora
		if err := database.DB.First(&empresa, *req.IDEmpresaEmpleadora).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "La empresa empleadora no existe"})
			return
		}
	}

	updates := map[string]interface{}{
		"id_empresa_empleadora": req.IDEmpresaEmpleadora,
		"puesto":                req.Puesto,
	}

	if err := database.DB.Model(&models.Persona{}).
		Where("id_persona = ?", *user.IDPersona).
		Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar empleo"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Empleo actualizado exitosamente",
	})
}
