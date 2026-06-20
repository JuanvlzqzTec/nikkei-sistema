package handlers

import (
	"net/http"
	"strconv"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/middleware"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type EmpresasHandler struct{}

func NewEmpresasHandler() *EmpresasHandler {
	return &EmpresasHandler{}
}

func (h *EmpresasHandler) GetHomepage(c *gin.Context) {
	var empresas []models.Empresa

	if err := database.DB.
		Where("acepta_promocion_directorio = true AND en_homepage = true").
		Order("orden_homepage ASC").
		Limit(5).
		Find(&empresas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener empresas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Empresas del homepage obtenidas",
		"data":    empresas,
		"count":   len(empresas),
	})
}

func (h *EmpresasHandler) GetAll(c *gin.Context) {
	var empresas []models.Empresa

	query := database.DB.Model(&models.Empresa{})

	if status := c.Query("status"); status != "" {
		query = query.Where("status_aprobacion = ?", status)
	}

	if homepage := c.Query("homepage"); homepage == "true" {
		query = query.Where("en_homepage = true")
	}

	query = query.Order("created_at DESC")

	if err := query.Find(&empresas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener empresas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Empresas obtenidas exitosamente",
		"data":    empresas,
		"count":   len(empresas),
	})
}

func (h *EmpresasHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	var empresa models.Empresa

	if err := database.DB.First(&empresa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Empresa no encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Empresa obtenida exitosamente",
		"data":    empresa,
	})
}

func (h *EmpresasHandler) Create(c *gin.Context) {
	var req struct {
		NombreEmpresa   string  `json:"nombre_empresa" binding:"required,max=200"`
		RazonSocial     *string `json:"razon_social"`
		RFC             *string `json:"rfc"`
		GiroComercial   *string `json:"giro_comercial"`
		Sector          *string `json:"sector"`
		Descripcion     *string `json:"descripcion"`
		Telefono        *string `json:"telefono"`
		Email           *string `json:"email"`
		SitioWeb        *string `json:"sitio_web"`
		RedesSociales   *string `json:"redes_sociales"`
		Direccion       *string `json:"direccion"`
		Ciudad          *string `json:"ciudad"`
		Estado          string  `json:"estado"`
		CodigoPostal    *string `json:"codigo_postal"`
		NumeroEmpleados *int    `json:"numero_empleados"`
		LogoEmpresa     *string `json:"logo_empresa"`
		IDPropietario   *uint   `json:"id_propietario"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	estado := "Sinaloa"
	if req.Estado != "" {
		estado = req.Estado
	}

	aprobada := "aprobada"
	empresa := models.Empresa{
		IDPropietario:             req.IDPropietario,
		NombreEmpresa:             req.NombreEmpresa,
		RazonSocial:               req.RazonSocial,
		RFC:                       req.RFC,
		GiroComercial:             req.GiroComercial,
		Sector:                    req.Sector,
		Descripcion:               req.Descripcion,
		Telefono:                  req.Telefono,
		Email:                     req.Email,
		SitioWeb:                  req.SitioWeb,
		RedesSociales:             req.RedesSociales,
		Direccion:                 req.Direccion,
		Ciudad:                    req.Ciudad,
		Estado:                    estado,
		CodigoPostal:              req.CodigoPostal,
		NumeroEmpleados:           req.NumeroEmpleados,
		LogoEmpresa:               req.LogoEmpresa,
		AceptaPromocionDirectorio: true,
		StatusAprobacion:          &aprobada,
	}

	if err := database.DB.Create(&empresa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear empresa"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Empresa creada exitosamente",
		"data":    empresa,
	})
}

func (h *EmpresasHandler) SolicitarRegistro(c *gin.Context) {
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
			"message": "Debes completar tu registro comunitario antes de registrar una empresa",
		})
		return
	}

	var existente models.Empresa
	if err := database.DB.Where("id_propietario = ?", *user.IDPersona).First(&existente).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error":   "Ya tienes una empresa registrada",
			"message": "Para editarla, usa el endpoint PUT /mi-empresa",
		})
		return
	}

	var req struct {
		NombreEmpresa             string  `json:"nombre_empresa" binding:"required,max=200"`
		GiroComercial             *string `json:"giro_comercial"`
		Sector                    *string `json:"sector"`
		Descripcion               *string `json:"descripcion"`
		Telefono                  *string `json:"telefono"`
		Email                     *string `json:"email"`
		SitioWeb                  *string `json:"sitio_web"`
		RedesSociales             *string `json:"redes_sociales"`
		Direccion                 *string `json:"direccion"`
		Ciudad                    *string `json:"ciudad"`
		Estado                    string  `json:"estado"`
		LogoEmpresa               *string `json:"logo_empresa"`
		AceptaPromocionDirectorio *bool   `json:"acepta_promocion_directorio"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	estado := "Sinaloa"
	if req.Estado != "" {
		estado = req.Estado
	}

	aceptaPromocion := true
	if req.AceptaPromocionDirectorio != nil {
		aceptaPromocion = *req.AceptaPromocionDirectorio
	}

	pendiente := "pendiente"
	empresa := models.Empresa{
		IDPropietario:             user.IDPersona,
		NombreEmpresa:             req.NombreEmpresa,
		GiroComercial:             req.GiroComercial,
		Sector:                    req.Sector,
		Descripcion:               req.Descripcion,
		Telefono:                  req.Telefono,
		Email:                     req.Email,
		SitioWeb:                  req.SitioWeb,
		RedesSociales:             req.RedesSociales,
		Direccion:                 req.Direccion,
		Ciudad:                    req.Ciudad,
		Estado:                    estado,
		LogoEmpresa:               req.LogoEmpresa,
		AceptaPromocionDirectorio: aceptaPromocion,
		StatusAprobacion:          &pendiente,
	}

	if err := database.DB.Create(&empresa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al solicitar registro"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Solicitud de registro enviada. El administrador revisará tu empresa.",
		"data":    empresa,
	})
}

func (h *EmpresasHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var empresa models.Empresa

	if err := database.DB.First(&empresa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Empresa no encontrada"})
		return
	}

	var req struct {
		NombreEmpresa   string  `json:"nombre_empresa"`
		RazonSocial     *string `json:"razon_social"`
		RFC             *string `json:"rfc"`
		GiroComercial   *string `json:"giro_comercial"`
		Sector          *string `json:"sector"`
		Descripcion     *string `json:"descripcion"`
		Telefono        *string `json:"telefono"`
		Email           *string `json:"email"`
		SitioWeb        *string `json:"sitio_web"`
		RedesSociales   *string `json:"redes_sociales"`
		Direccion       *string `json:"direccion"`
		Ciudad          *string `json:"ciudad"`
		Estado          string  `json:"estado"`
		CodigoPostal    *string `json:"codigo_postal"`
		NumeroEmpleados *int    `json:"numero_empleados"`
		LogoEmpresa     *string `json:"logo_empresa"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	if req.NombreEmpresa != "" {
		empresa.NombreEmpresa = req.NombreEmpresa
	}
	if req.RazonSocial != nil {
		empresa.RazonSocial = req.RazonSocial
	}
	if req.RFC != nil {
		empresa.RFC = req.RFC
	}
	if req.GiroComercial != nil {
		empresa.GiroComercial = req.GiroComercial
	}
	if req.Sector != nil {
		empresa.Sector = req.Sector
	}
	if req.Descripcion != nil {
		empresa.Descripcion = req.Descripcion
	}
	if req.Telefono != nil {
		empresa.Telefono = req.Telefono
	}
	if req.Email != nil {
		empresa.Email = req.Email
	}
	if req.SitioWeb != nil {
		empresa.SitioWeb = req.SitioWeb
	}
	if req.RedesSociales != nil {
		empresa.RedesSociales = req.RedesSociales
	}
	if req.Direccion != nil {
		empresa.Direccion = req.Direccion
	}
	if req.Ciudad != nil {
		empresa.Ciudad = req.Ciudad
	}
	if req.Estado != "" {
		empresa.Estado = req.Estado
	}
	if req.CodigoPostal != nil {
		empresa.CodigoPostal = req.CodigoPostal
	}
	if req.NumeroEmpleados != nil {
		empresa.NumeroEmpleados = req.NumeroEmpleados
	}
	if req.LogoEmpresa != nil {
		empresa.LogoEmpresa = req.LogoEmpresa
	}

	if err := database.DB.Save(&empresa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar empresa"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Empresa actualizada exitosamente",
		"data":    empresa,
	})
}

func (h *EmpresasHandler) UpdateAprobacion(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status requerido"})
		return
	}

	validStatus := map[string]bool{
		"pendiente": true, "aprobada": true, "rechazada": true,
	}
	if !validStatus[req.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status inválido. Usa: pendiente, aprobada, rechazada"})
		return
	}

	result := database.DB.Model(&models.Empresa{}).
		Where("id_empresa = ?", id).
		Update("status_aprobacion", req.Status)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar aprobación"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Empresa no encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Aprobación actualizada exitosamente"})
}

func (h *EmpresasHandler) SetHomepage(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		EnHomepage    bool `json:"en_homepage"`
		OrdenHomepage *int `json:"orden_homepage"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if req.EnHomepage {
		var count int64
		database.DB.Model(&models.Empresa{}).
			Where("en_homepage = true AND id_empresa != ?", id).
			Count(&count)

		if count >= 5 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Ya hay 5 empresas en el homepage. Quita una antes de agregar otra.",
			})
			return
		}
	}

	updates := map[string]interface{}{
		"en_homepage": req.EnHomepage,
	}
	if req.OrdenHomepage != nil {
		updates["orden_homepage"] = *req.OrdenHomepage
	}

	result := database.DB.Model(&models.Empresa{}).
		Where("id_empresa = ?", id).
		Updates(updates)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar homepage"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Homepage actualizado exitosamente"})
}

func (h *EmpresasHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	var empresa models.Empresa

	if err := database.DB.First(&empresa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Empresa no encontrada"})
		return
	}

	if err := database.DB.Delete(&empresa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al eliminar empresa"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Empresa eliminada exitosamente"})
}

func (h *EmpresasHandler) GetMiEmpresa(c *gin.Context) {
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
			"message": "Debes completar tu registro comunitario primero",
		})
		return
	}

	var empresa models.Empresa
	if err := database.DB.Where("id_propietario = ?", *user.IDPersona).First(&empresa).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":         "Sin empresa registrada",
			"tiene_empresa": false,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Empresa obtenida exitosamente",
		"data":          empresa,
		"tiene_empresa": true,
	})
}

// UpdateMiEmpresa actualiza la empresa propia del miembro autenticado.
// Cualquier edición vuelve la empresa a estado "pendiente" para re-aprobación.
func (h *EmpresasHandler) UpdateMiEmpresa(c *gin.Context) {
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

	var empresa models.Empresa
	if err := database.DB.Where("id_propietario = ?", *user.IDPersona).First(&empresa).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No tienes una empresa registrada"})
		return
	}

	var req struct {
		NombreEmpresa             string  `json:"nombre_empresa"`
		GiroComercial             *string `json:"giro_comercial"`
		Sector                    *string `json:"sector"`
		Descripcion               *string `json:"descripcion"`
		Telefono                  *string `json:"telefono"`
		Email                     *string `json:"email"`
		SitioWeb                  *string `json:"sitio_web"`
		RedesSociales             *string `json:"redes_sociales"`
		Direccion                 *string `json:"direccion"`
		Ciudad                    *string `json:"ciudad"`
		Estado                    string  `json:"estado"`
		LogoEmpresa               *string `json:"logo_empresa"`
		AceptaPromocionDirectorio *bool   `json:"acepta_promocion_directorio"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	if req.NombreEmpresa != "" {
		empresa.NombreEmpresa = req.NombreEmpresa
	}
	if req.GiroComercial != nil {
		empresa.GiroComercial = req.GiroComercial
	}
	if req.Sector != nil {
		empresa.Sector = req.Sector
	}
	if req.Descripcion != nil {
		empresa.Descripcion = req.Descripcion
	}
	if req.Telefono != nil {
		empresa.Telefono = req.Telefono
	}
	if req.Email != nil {
		empresa.Email = req.Email
	}
	if req.SitioWeb != nil {
		empresa.SitioWeb = req.SitioWeb
	}
	if req.RedesSociales != nil {
		empresa.RedesSociales = req.RedesSociales
	}
	if req.Direccion != nil {
		empresa.Direccion = req.Direccion
	}
	if req.Ciudad != nil {
		empresa.Ciudad = req.Ciudad
	}
	if req.Estado != "" {
		empresa.Estado = req.Estado
	}
	if req.LogoEmpresa != nil {
		empresa.LogoEmpresa = req.LogoEmpresa
	}
	if req.AceptaPromocionDirectorio != nil {
		empresa.AceptaPromocionDirectorio = *req.AceptaPromocionDirectorio
	}

	// Toda edición regresa la empresa a pendiente para re-aprobación admin.
	// También se quita del homepage si estaba ahí (el admin decide si vuelve a ponerla).
	pendiente := "pendiente"
	empresa.StatusAprobacion = &pendiente
	empresa.EnHomepage = false

	if err := database.DB.Save(&empresa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar empresa"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Empresa actualizada. Un administrador revisará los cambios antes de que aparezcan en el directorio.",
		"data":    empresa,
	})
}
