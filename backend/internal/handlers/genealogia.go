package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/middleware"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type GenealogiaHandler struct{}

func NewGenealogiaHandler() *GenealogiaHandler {
	return &GenealogiaHandler{}
}

type PersonaResumen struct {
	IDPersona       uint    `json:"id_persona"`
	Nombres         string  `json:"nombres"`
	ApellidoPaterno string  `json:"apellido_paterno"`
	ApellidoMaterno *string `json:"apellido_materno"`
	NombreCompleto  string  `json:"nombre_completo"`
	Generacion      string  `json:"generacion"`
	FotoPerfil      *string `json:"foto_perfil"`
	IDFamilia       uint    `json:"id_familia"`
	ApellidoFamilia string  `json:"apellido_familia"`
	EsMiembroActivo bool    `json:"es_miembro_activo"`
}

type RelacionResumen struct {
	IDGenealogia          uint           `json:"id_genealogia"`
	TipoRelacion          string         `json:"tipo_relacion"`
	ConfirmadoAmbasPartes bool           `json:"confirmado_ambas_partes"`
	Notas                 *string        `json:"notas"`
	CreatedAt             time.Time      `json:"created_at"`
	Pariente              PersonaResumen `json:"pariente"`
	YoSoyQuien            string         `json:"yo_soy_quien"`
}

func buildPersonaResumen(p *models.Persona, familia *models.Familia) PersonaResumen {
	res := PersonaResumen{
		IDPersona:       p.IDPersona,
		Nombres:         p.Nombres,
		ApellidoPaterno: p.ApellidoPaterno,
		ApellidoMaterno: p.ApellidoMaterno,
		NombreCompleto:  p.GetNombreCompleto(),
		Generacion:      p.Generacion,
		FotoPerfil:      p.FotoPerfil,
		IDFamilia:       p.IDFamilia,
		EsMiembroActivo: p.EsMiembroActivo,
	}
	if familia != nil {
		res.ApellidoFamilia = familia.ApellidoJP
	}
	return res
}

func (h *GenealogiaHandler) obtenerMiPersona(c *gin.Context) (*models.Persona, error) {
	userID, _, _, exists := middleware.GetCurrentUser(c)
	if !exists {
		return nil, errors.New("no autenticado")
	}
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return nil, errors.New("usuario no encontrado")
	}
	if user.IDPersona == nil {
		return nil, errors.New("registro_no_completado")
	}
	var persona models.Persona
	if err := database.DB.First(&persona, *user.IDPersona).Error; err != nil {
		return nil, errors.New("persona no encontrada")
	}
	return &persona, nil
}

func (h *GenealogiaHandler) GetMiArbol(c *gin.Context) {
	persona, err := h.obtenerMiPersona(c)
	if err != nil {
		if err.Error() == "registro_no_completado" {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "Registro no completado",
				"message": "Debes completar tu registro comunitario primero",
			})
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var familia models.Familia
	database.DB.First(&familia, persona.IDFamilia)

	yo := buildPersonaResumen(persona, &familia)

	relaciones, err := h.obtenerRelacionesDePersona(persona.IDPersona)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener relaciones"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Árbol obtenido",
		"yo":         yo,
		"relaciones": relaciones,
		"count":      len(relaciones),
	})
}

func (h *GenealogiaHandler) obtenerRelacionesDePersona(idPersona uint) ([]RelacionResumen, error) {
	var genealogias []models.Genealogia
	if err := database.DB.
		Where("id_persona = ? OR id_pariente = ?", idPersona, idPersona).
		Order("created_at ASC").
		Find(&genealogias).Error; err != nil {
		return nil, err
	}

	resultado := make([]RelacionResumen, 0, len(genealogias))
	for _, g := range genealogias {
		var idOtro uint
		var tipoMostrar string
		var yoSoyQuien string

		if g.IDPersona == idPersona {
			idOtro = g.IDPariente
			yoSoyQuien = "persona"
		} else {
			idOtro = g.IDPersona
			yoSoyQuien = "pariente"
		}

		var otraPersona models.Persona
		if err := database.DB.First(&otraPersona, idOtro).Error; err != nil {
			continue
		}

		if g.IDPersona == idPersona {
			tipoMostrar = g.TipoRelacion
		} else {
			generoOtro := ""
			if otraPersona.Genero != nil {
				generoOtro = *otraPersona.Genero
			}
			tipoMostrar = (&models.Genealogia{TipoRelacion: g.TipoRelacion}).GetRelacionInversaConGenero(generoOtro)
		}

		var familiaOtra models.Familia
		database.DB.First(&familiaOtra, otraPersona.IDFamilia)
		resultado = append(resultado, RelacionResumen{
			IDGenealogia:          g.IDGenealogia,
			TipoRelacion:          tipoMostrar,
			ConfirmadoAmbasPartes: g.ConfirmadoAmbasPartes,
			Notas:                 g.Notas,
			CreatedAt:             g.CreatedAt,
			Pariente:              buildPersonaResumen(&otraPersona, &familiaOtra),
			YoSoyQuien:            yoSoyQuien,
		})
	}

	return resultado, nil
}

func (h *GenealogiaHandler) BuscarPersonas(c *gin.Context) {
	persona, err := h.obtenerMiPersona(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	q := strings.TrimSpace(c.Query("q"))
	idFamiliaStr := c.Query("id_familia")

	var relacionesExistentes []models.Genealogia
	database.DB.
		Where("id_persona = ? OR id_pariente = ?", persona.IDPersona, persona.IDPersona).
		Find(&relacionesExistentes)

	idsExcluir := make([]uint, 0, len(relacionesExistentes))
	for _, r := range relacionesExistentes {
		if r.IDPersona == persona.IDPersona {
			idsExcluir = append(idsExcluir, r.IDPariente)
		} else {
			idsExcluir = append(idsExcluir, r.IDPersona)
		}
	}

	query := database.DB.Model(&models.Persona{}).
		Where("id_persona != ?", persona.IDPersona)

	if len(idsExcluir) > 0 {
		query = query.Where("id_persona NOT IN ?", idsExcluir)
	}

	if idFamiliaStr != "" {
		if idFamilia, err := strconv.Atoi(idFamiliaStr); err == nil {
			query = query.Where("id_familia = ?", idFamilia)
		}
	} else if q == "" {
		query = query.Where("id_familia = ?", persona.IDFamilia)
	}

	if q != "" {
		like := "%" + q + "%"
		query = query.Where(
			"nombres ILIKE ? OR apellido_paterno ILIKE ? OR apellido_materno ILIKE ? OR nombre_japones ILIKE ?",
			like, like, like, like,
		)
	}

	var personas []models.Persona
	if err := query.Order("apellido_paterno ASC, nombres ASC").Limit(30).Find(&personas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al buscar personas"})
		return
	}

	resultado := make([]PersonaResumen, 0, len(personas))
	for _, p := range personas {
		var familia models.Familia
		database.DB.First(&familia, p.IDFamilia)
		resultado = append(resultado, buildPersonaResumen(&p, &familia))
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Personas obtenidas",
		"data":    resultado,
		"count":   len(resultado),
	})
}

type CrearPersonaHistoricaRequest struct {
	IDFamilia          uint    `json:"id_familia" binding:"required"`
	Nombres            string  `json:"nombres" binding:"required,max=150"`
	ApellidoPaterno    string  `json:"apellido_paterno" binding:"required,max=100"`
	ApellidoMaterno    *string `json:"apellido_materno"`
	NombreJapones      *string `json:"nombre_japones"`
	NombreKanji        *string `json:"nombre_kanji"`
	Generacion         string  `json:"generacion" binding:"required,oneof=issei nisei sansei yonsei gosei roksei"`
	Genero             *string `json:"genero"`
	FechaNacimiento    *string `json:"fecha_nacimiento"`
	FechaFallecimiento *string `json:"fecha_fallecimiento"`
	Notas              *string `json:"notas"`
}

func (h *GenealogiaHandler) CrearPersonaHistorica(c *gin.Context) {
	_, err := h.obtenerMiPersona(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req CrearPersonaHistoricaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	var familia models.Familia
	if err := database.DB.First(&familia, req.IDFamilia).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "La familia indicada no existe"})
		return
	}

	var fechaNac *time.Time
	if req.FechaNacimiento != nil && *req.FechaNacimiento != "" {
		f, err := time.Parse("2006-01-02", *req.FechaNacimiento)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Fecha inválida (usa YYYY-MM-DD)"})
			return
		}
		fechaNac = &f
	}

	var fechaFall *time.Time
	if req.FechaFallecimiento != nil && *req.FechaFallecimiento != "" {
		f, err := time.Parse("2006-01-02", *req.FechaFallecimiento)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Fecha de fallecimiento inválida (usa YYYY-MM-DD)"})
			return
		}
		fechaFall = &f
	}

	nueva := models.Persona{
		IDFamilia:            req.IDFamilia,
		Nombres:              strings.TrimSpace(req.Nombres),
		ApellidoPaterno:      strings.TrimSpace(req.ApellidoPaterno),
		ApellidoMaterno:      req.ApellidoMaterno,
		NombreJapones:        req.NombreJapones,
		NombreKanji:          req.NombreKanji,
		Generacion:           req.Generacion,
		Genero:               req.Genero,
		FechaNacimiento:      fechaNac,
		FechaFallecimiento:   fechaFall,
		EsMiembroActivo:      false,
		NotasAdministrativas: req.Notas,
	}

	if err := database.DB.Create(&nueva).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear persona"})
		return
	}

	resumen := buildPersonaResumen(&nueva, &familia)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Persona registrada",
		"data":    resumen,
	})
}

type CrearRelacionRequest struct {
	IDPariente   uint    `json:"id_pariente" binding:"required"`
	TipoRelacion string  `json:"tipo_relacion" binding:"required"`
	Notas        *string `json:"notas"`
}

var tiposRelacionValidos = map[string]bool{
	"padre": true, "madre": true, "hijo": true, "hija": true,
	"esposo": true, "esposa": true,
	"hermano": true, "hermana": true,
	"abuelo": true, "abuela": true, "nieto": true, "nieta": true,
	"tio": true, "tia": true, "primo": true, "prima": true,
	"cuniado": true, "cuniada": true,
	"yerno": true, "nuera": true, "suegro": true, "suegra": true,
}

func (h *GenealogiaHandler) CrearRelacion(c *gin.Context) {
	persona, err := h.obtenerMiPersona(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var req CrearRelacionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	if !tiposRelacionValidos[req.TipoRelacion] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tipo de relación inválido"})
		return
	}
	if req.IDPariente == persona.IDPersona {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No puedes ser pariente de ti mismo"})
		return
	}

	// Verificar que el pariente existe
	var pariente models.Persona
	if err := database.DB.First(&pariente, req.IDPariente).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "La persona indicada no existe"})
		return
	}

	// Verificar que no exista YA ninguna relación entre estas dos personas (en cualquier dirección)
	var existente models.Genealogia
	dup := database.DB.
		Where("(id_persona = ? AND id_pariente = ?) OR (id_persona = ? AND id_pariente = ?)",
			persona.IDPersona, req.IDPariente,
			req.IDPariente, persona.IDPersona).
		First(&existente)
	if dup.Error == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Ya existe una relación registrada con esta persona. Elimínala primero si quieres cambiar el tipo.",
		})
		return
	}

	// Validación de ciclos en relaciones padre/hijo y abuelo/nieto
	if err := h.validarCiclos(persona.IDPersona, req.IDPariente, req.TipoRelacion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Si el pariente es histórico (no tiene user vinculado), la confirmamos automáticamente
	var userPariente models.User
	tieneUserVinculado := database.DB.Where("id_persona = ?", req.IDPariente).First(&userPariente).Error == nil

	confirmada := !tieneUserVinculado
	var fechaConf *time.Time
	if confirmada {
		now := time.Now()
		fechaConf = &now
	}

	nueva := models.Genealogia{
		IDPersona:             persona.IDPersona,
		IDPariente:            req.IDPariente,
		TipoRelacion:          req.TipoRelacion,
		ConfirmadoAmbasPartes: confirmada,
		FechaConfirmacion:     fechaConf,
		Notas:                 req.Notas,
	}

	if err := database.DB.Create(&nueva).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear relación: " + err.Error()})
		return
	}

	msg := "Relación creada"
	if !confirmada {
		msg = "Relación creada. Esperando confirmación del otro miembro."
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":               msg,
		"data":                  nueva,
		"requiere_confirmacion": !confirmada,
	})
}

func (h *GenealogiaHandler) ConfirmarRelacion(c *gin.Context) {
	persona, err := h.obtenerMiPersona(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var rel models.Genealogia
	if err := database.DB.First(&rel, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Relación no encontrada"})
		return
	}

	// Solo el "otro lado" puede confirmar (el que NO la creó)
	if rel.IDPersona == persona.IDPersona {
		c.JSON(http.StatusForbidden, gin.H{"error": "No puedes confirmar una relación que tú mismo creaste"})
		return
	}
	if rel.IDPariente != persona.IDPersona {
		c.JSON(http.StatusForbidden, gin.H{"error": "Esta relación no te involucra"})
		return
	}

	if rel.ConfirmadoAmbasPartes {
		c.JSON(http.StatusOK, gin.H{"message": "La relación ya estaba confirmada"})
		return
	}

	now := time.Now()
	if err := database.DB.Model(&rel).Updates(map[string]interface{}{
		"confirmado_ambas_partes": true,
		"fecha_confirmacion":      now,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al confirmar"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Relación confirmada"})
}

func (h *GenealogiaHandler) EliminarRelacion(c *gin.Context) {
	persona, err := h.obtenerMiPersona(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var rel models.Genealogia
	if err := database.DB.First(&rel, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Relación no encontrada"})
		return
	}

	// Cualquiera de las dos partes puede eliminar
	if rel.IDPersona != persona.IDPersona && rel.IDPariente != persona.IDPersona {
		c.JSON(http.StatusForbidden, gin.H{"error": "Esta relación no te involucra"})
		return
	}

	if err := database.DB.Delete(&rel).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al eliminar"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Relación eliminada"})
}

func (h *GenealogiaHandler) GetPendientesConfirmacion(c *gin.Context) {
	persona, err := h.obtenerMiPersona(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var genealogias []models.Genealogia
	if err := database.DB.
		Where("id_pariente = ? AND confirmado_ambas_partes = false", persona.IDPersona).
		Order("created_at DESC").
		Find(&genealogias).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener pendientes"})
		return
	}

	type PendienteResumen struct {
		IDGenealogia uint           `json:"id_genealogia"`
		TipoRelacion string         `json:"tipo_relacion"`
		TipoInverso  string         `json:"tipo_inverso"`
		Notas        *string        `json:"notas"`
		CreatedAt    time.Time      `json:"created_at"`
		Solicitante  PersonaResumen `json:"solicitante"`
	}

	resultado := make([]PendienteResumen, 0, len(genealogias))
	for _, g := range genealogias {
		var solicitante models.Persona
		if err := database.DB.First(&solicitante, g.IDPersona).Error; err != nil {
			continue
		}
		var familia models.Familia
		database.DB.First(&familia, solicitante.IDFamilia)

		generoSolicitante := ""
		if solicitante.Genero != nil {
			generoSolicitante = *solicitante.Genero
		}
		inverso := (&models.Genealogia{TipoRelacion: g.TipoRelacion}).GetRelacionInversaConGenero(generoSolicitante)

		resultado = append(resultado, PendienteResumen{
			IDGenealogia: g.IDGenealogia,
			TipoRelacion: g.TipoRelacion,
			TipoInverso:  inverso,
			Notas:        g.Notas,
			CreatedAt:    g.CreatedAt,
			Solicitante:  buildPersonaResumen(&solicitante, &familia),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Confirmaciones pendientes obtenidas",
		"data":    resultado,
		"count":   len(resultado),
	})
}

// validarCiclos evita relaciones lógicamente imposibles (padre de tu padre, etc.)
func (h *GenealogiaHandler) validarCiclos(idYo, idPariente uint, tipo string) error {
	// Solo validamos relaciones verticales (padre/madre/hijo/hija/abuelo/abuela/nieto/nieta)
	esAscendente := tipo == "padre" || tipo == "madre" || tipo == "abuelo" || tipo == "abuela"
	esDescendente := tipo == "hijo" || tipo == "hija" || tipo == "nieto" || tipo == "nieta"

	if !esAscendente && !esDescendente {
		return nil
	}

	// Si yo digo que X es mi padre/abuelo, X no puede ser ya mi hijo/nieto
	// Si yo digo que X es mi hijo/nieto, X no puede ser ya mi padre/abuelo
	tiposOpuestos := map[string][]string{
		"padre":  {"hijo", "hija", "nieto", "nieta"},
		"madre":  {"hijo", "hija", "nieto", "nieta"},
		"abuelo": {"hijo", "hija", "nieto", "nieta"},
		"abuela": {"hijo", "hija", "nieto", "nieta"},
		"hijo":   {"padre", "madre", "abuelo", "abuela"},
		"hija":   {"padre", "madre", "abuelo", "abuela"},
		"nieto":  {"padre", "madre", "abuelo", "abuela"},
		"nieta":  {"padre", "madre", "abuelo", "abuela"},
	}

	opuestos, ok := tiposOpuestos[tipo]
	if !ok {
		return nil
	}

	var count int64
	database.DB.Model(&models.Genealogia{}).
		Where("((id_persona = ? AND id_pariente = ?) OR (id_persona = ? AND id_pariente = ?)) AND tipo_relacion IN ?",
			idYo, idPariente, idPariente, idYo, opuestos).
		Count(&count)

	if count > 0 {
		return errors.New("esta relación contradice otra ya registrada (ej: no puede ser tu padre alguien que ya es tu hijo)")
	}

	return nil
}

func (h *GenealogiaHandler) GetArbolDeMiFamilia(c *gin.Context) {
	persona, err := h.obtenerMiPersona(c)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	var familia models.Familia
	if err := database.DB.First(&familia, persona.IDFamilia).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Familia no encontrada"})
		return
	}

	// Personas de la familia
	var personas []models.Persona
	if err := database.DB.Where("id_familia = ?", persona.IDFamilia).
		Order("generacion ASC, apellido_paterno ASC, nombres ASC").
		Find(&personas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener personas"})
		return
	}

	ids := make([]uint, 0, len(personas))
	for _, p := range personas {
		ids = append(ids, p.IDPersona)
	}

	var relaciones []models.Genealogia
	if len(ids) > 0 {
		database.DB.Where("id_persona IN ? OR id_pariente IN ?", ids, ids).Find(&relaciones)
	}

	// Personas externas referenciadas
	personasMap := make(map[uint]*models.Persona)
	for i := range personas {
		personasMap[personas[i].IDPersona] = &personas[i]
	}
	idsExternos := []uint{}
	for _, r := range relaciones {
		if _, ok := personasMap[r.IDPersona]; !ok {
			idsExternos = append(idsExternos, r.IDPersona)
		}
		if _, ok := personasMap[r.IDPariente]; !ok {
			idsExternos = append(idsExternos, r.IDPariente)
		}
	}
	if len(idsExternos) > 0 {
		var externos []models.Persona
		database.DB.Where("id_persona IN ?", idsExternos).Find(&externos)
		for i := range externos {
			personasMap[externos[i].IDPersona] = &externos[i]
		}
	}

	familiasMap := make(map[uint]string)
	familiasMap[familia.IDFamilia] = familia.ApellidoJP
	for _, p := range personasMap {
		if _, ok := familiasMap[p.IDFamilia]; !ok {
			var f models.Familia
			if err := database.DB.Select("id_familia, apellido_jp").First(&f, p.IDFamilia).Error; err == nil {
				familiasMap[f.IDFamilia] = f.ApellidoJP
			}
		}
	}

	type personaResp struct {
		IDPersona       uint    `json:"id_persona"`
		NombreCompleto  string  `json:"nombre_completo"`
		Generacion      string  `json:"generacion"`
		FotoPerfil      *string `json:"foto_perfil"`
		IDFamilia       uint    `json:"id_familia"`
		ApellidoFamilia string  `json:"apellido_familia"`
		EsMiembroActivo bool    `json:"es_miembro_activo"`
		EsYo            bool    `json:"es_yo"`
	}

	type relacionResp struct {
		IDGenealogia          uint   `json:"id_genealogia"`
		IDPersona             uint   `json:"id_persona"`
		IDPariente            uint   `json:"id_pariente"`
		TipoRelacion          string `json:"tipo_relacion"`
		ConfirmadoAmbasPartes bool   `json:"confirmado_ambas_partes"`
	}

	personasResp := make([]personaResp, 0, len(personasMap))
	for _, p := range personasMap {
		personasResp = append(personasResp, personaResp{
			IDPersona:       p.IDPersona,
			NombreCompleto:  p.GetNombreCompleto(),
			Generacion:      p.Generacion,
			FotoPerfil:      p.FotoPerfil,
			IDFamilia:       p.IDFamilia,
			ApellidoFamilia: familiasMap[p.IDFamilia],
			EsMiembroActivo: p.EsMiembroActivo,
			EsYo:            p.IDPersona == persona.IDPersona,
		})
	}

	relacionesResp := make([]relacionResp, 0, len(relaciones))
	for _, r := range relaciones {
		relacionesResp = append(relacionesResp, relacionResp{
			IDGenealogia:          r.IDGenealogia,
			IDPersona:             r.IDPersona,
			IDPariente:            r.IDPariente,
			TipoRelacion:          r.TipoRelacion,
			ConfirmadoAmbasPartes: r.ConfirmadoAmbasPartes,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"familia":    familia,
		"personas":   personasResp,
		"relaciones": relacionesResp,
		"yo_id":      persona.IDPersona,
	})
}

var _ = gorm.ErrRecordNotFound
