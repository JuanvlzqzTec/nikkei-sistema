package handlers

import (
	"net/http"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type AdminArbolesHandler struct{}

func NewAdminArbolesHandler() *AdminArbolesHandler {
	return &AdminArbolesHandler{}
}

type FamiliaConConteo struct {
	IDFamilia         uint    `json:"id_familia"`
	ApellidoJP        string  `json:"apellido_jp"`
	ApellidoKanji     *string `json:"apellido_kanji"`
	PrefecturaOrigen  *string `json:"prefectura_origen"`
	AnioLlegadaMexico *int    `json:"anio_llegada_mexico"`
	LugarLlegada      *string `json:"lugar_llegada"`
	TotalMiembros     int64   `json:"total_miembros"`
	TotalRelaciones   int64   `json:"total_relaciones"`
}

func (h *AdminArbolesHandler) GetFamiliasConArboles(c *gin.Context) {
	var familias []models.Familia
	if err := database.DB.
		Where("pendiente_aprobacion = false").
		Order("apellido_jp ASC").
		Find(&familias).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener familias"})
		return
	}

	resultado := make([]FamiliaConConteo, 0, len(familias))
	for _, f := range familias {
		var miembros, relaciones int64
		database.DB.Model(&models.Persona{}).Where("id_familia = ?", f.IDFamilia).Count(&miembros)
		database.DB.Model(&models.Genealogia{}).
			Joins("JOIN personas p1 ON p1.id_persona = genealogia.id_persona").
			Joins("JOIN personas p2 ON p2.id_persona = genealogia.id_pariente").
			Where("p1.id_familia = ? OR p2.id_familia = ?", f.IDFamilia, f.IDFamilia).
			Count(&relaciones)

		resultado = append(resultado, FamiliaConConteo{
			IDFamilia:         f.IDFamilia,
			ApellidoJP:        f.ApellidoJP,
			ApellidoKanji:     f.ApellidoKanji,
			PrefecturaOrigen:  f.PrefecturaOrigen,
			AnioLlegadaMexico: f.AnioLlegadaMexico,
			LugarLlegada:      f.LugarLlegada,
			TotalMiembros:     miembros,
			TotalRelaciones:   relaciones,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": resultado, "count": len(resultado)})
}

type ArbolFamiliaPersona struct {
	IDPersona       uint    `json:"id_persona"`
	NombreCompleto  string  `json:"nombre_completo"`
	Generacion      string  `json:"generacion"`
	FotoPerfil      *string `json:"foto_perfil"`
	IDFamilia       uint    `json:"id_familia"`
	ApellidoFamilia string  `json:"apellido_familia"`
	EsMiembroActivo bool    `json:"es_miembro_activo"`
	EsPublico       bool    `json:"es_publico"`
}

type ArbolFamiliaRelacion struct {
	IDGenealogia          uint   `json:"id_genealogia"`
	IDPersona             uint   `json:"id_persona"`
	IDPariente            uint   `json:"id_pariente"`
	TipoRelacion          string `json:"tipo_relacion"`
	ConfirmadoAmbasPartes bool   `json:"confirmado_ambas_partes"`
}

func (h *AdminArbolesHandler) GetArbolFamilia(c *gin.Context) {
	id := c.Param("id")

	var familia models.Familia
	if err := database.DB.First(&familia, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Familia no encontrada"})
		return
	}

	// Personas de la familia
	var personas []models.Persona
	if err := database.DB.Where("id_familia = ?", id).
		Order("generacion ASC, apellido_paterno ASC, nombres ASC").
		Find(&personas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener personas"})
		return
	}

	// IDs de las personas
	ids := make([]uint, 0, len(personas))
	for _, p := range personas {
		ids = append(ids, p.IDPersona)
	}

	// Todas las relaciones donde participe al menos una persona de la familia
	var relaciones []models.Genealogia
	if len(ids) > 0 {
		database.DB.
			Where("id_persona IN ? OR id_pariente IN ?", ids, ids).
			Find(&relaciones)
	}

	// Personas externas referenciadas por las relaciones
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

	// Cache de apellidos de familias externas
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

	// Build personas response
	personasResp := make([]ArbolFamiliaPersona, 0, len(personasMap))
	for _, p := range personasMap {
		personasResp = append(personasResp, ArbolFamiliaPersona{
			IDPersona:       p.IDPersona,
			NombreCompleto:  p.GetNombreCompleto(),
			Generacion:      p.Generacion,
			FotoPerfil:      p.FotoPerfil,
			IDFamilia:       p.IDFamilia,
			ApellidoFamilia: familiasMap[p.IDFamilia],
			EsMiembroActivo: p.EsMiembroActivo,
			EsPublico:       p.AceptaDirectorioPublico,
		})
	}

	relacionesResp := make([]ArbolFamiliaRelacion, 0, len(relaciones))
	for _, r := range relaciones {
		relacionesResp = append(relacionesResp, ArbolFamiliaRelacion{
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
	})
}
