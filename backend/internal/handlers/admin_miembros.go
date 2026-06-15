package handlers

import (
	"net/http"
	"strings"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type AdminMiembrosHandler struct{}

func NewAdminMiembrosHandler() *AdminMiembrosHandler {
	return &AdminMiembrosHandler{}
}

type MiembroListItem struct {
	IDPersona       uint    `json:"id_persona"`
	IDUser          *uint   `json:"id_user"`
	Email           *string `json:"email"`
	Nombres         string  `json:"nombres"`
	ApellidoPaterno string  `json:"apellido_paterno"`
	ApellidoMaterno *string `json:"apellido_materno"`
	Generacion      string  `json:"generacion"`
	Ciudad          *string `json:"ciudad"`
	FotoPerfil      *string `json:"foto_perfil"`
	EsMiembroActivo bool    `json:"es_miembro_activo"`
	FamiliaApellido string  `json:"familia_apellido"`
}

type MiembroDetalle struct {
	IDPersona               uint            `json:"id_persona"`
	IDUser                  *uint           `json:"id_user"`
	Email                   *string         `json:"email"`
	RegistroEstado          *string         `json:"registro_estado"`
	Nombres                 string          `json:"nombres"`
	ApellidoPaterno         string          `json:"apellido_paterno"`
	ApellidoMaterno         *string         `json:"apellido_materno"`
	NombreJapones           *string         `json:"nombre_japones"`
	NombreKanji             *string         `json:"nombre_kanji"`
	Genero                  *string         `json:"genero"`
	FechaNacimiento         *string         `json:"fecha_nacimiento"`
	LugarNacimiento         *string         `json:"lugar_nacimiento"`
	Generacion              string          `json:"generacion"`
	EstadoCivil             *string         `json:"estado_civil"`
	TelefonoPrincipal       *string         `json:"telefono_principal"`
	TelefonoAlternativo     *string         `json:"telefono_alternativo"`
	EmailPersonal           *string         `json:"email_personal"`
	DireccionCompleta       *string         `json:"direccion_completa"`
	Ciudad                  *string         `json:"ciudad"`
	Estado                  string          `json:"estado"`
	CodigoPostal            *string         `json:"codigo_postal"`
	FotoPerfil              *string         `json:"foto_perfil"`
	EsMiembroActivo         bool            `json:"es_miembro_activo"`
	NivelJapones            *string         `json:"nivel_japones"`
	ParticipaEventos        bool            `json:"participa_eventos"`
	AceptaDirectorioPublico bool            `json:"acepta_directorio_publico"`
	AceptaComunicaciones    bool            `json:"acepta_comunicaciones"`
	FechaIngresoAsociacion  *string         `json:"fecha_ingreso_asociacion"`
	Puesto                  *string         `json:"puesto"`
	Familia                 FamiliaResumen  `json:"familia"`
	Empleo                  *EmpleoResumen  `json:"empleo"`
	EmpresaPropia           *EmpresaResumen `json:"empresa_propia"`
}

type EmpresaResumen struct {
	IDEmpresa        uint    `json:"id_empresa"`
	NombreEmpresa    string  `json:"nombre_empresa"`
	GiroComercial    *string `json:"giro_comercial"`
	StatusAprobacion *string `json:"status_aprobacion"`
}

func (h *AdminMiembrosHandler) GetMiembros(c *gin.Context) {
	// Parámetros de filtro — todos validados antes de usarse en query
	busqueda := strings.TrimSpace(c.Query("q"))
	generacion := strings.TrimSpace(c.Query("generacion"))
	soloActivos := c.Query("activos")

	// Validar generacion contra valores permitidos
	generacionesValidas := map[string]bool{
		"": true, "issei": true, "nisei": true, "sansei": true,
		"yonsei": true, "gosei": true, "roksei": true,
	}
	if !generacionesValidas[generacion] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Generación inválida"})
		return
	}

	query := database.DB.Table("personas p").
		Select(`
			p.id_persona, p.nombres, p.apellido_paterno, p.apellido_materno,
			p.generacion, p.ciudad, p.foto_perfil, p.es_miembro_activo,
			f.apellido_jp as familia_apellido,
			u.id_user, u.email
		`).
		Joins("LEFT JOIN familias f ON f.id_familia = p.id_familia").
		Joins("LEFT JOIN users u ON u.id_persona = p.id_persona").
		Order("p.apellido_paterno ASC, p.nombres ASC")

	// Búsqueda — usando parámetros posicionales para evitar inyección SQL
	if busqueda != "" {
		like := "%" + busqueda + "%"
		query = query.Where(
			"(p.nombres ILIKE ? OR p.apellido_paterno ILIKE ? OR p.apellido_materno ILIKE ? OR u.email ILIKE ? OR f.apellido_jp ILIKE ?)",
			like, like, like, like, like,
		)
	}

	if generacion != "" {
		query = query.Where("p.generacion = ?", generacion)
	}

	if soloActivos == "true" {
		query = query.Where("p.es_miembro_activo = true")
	} else if soloActivos == "false" {
		query = query.Where("p.es_miembro_activo = false")
	}

	type resultado struct {
		IDPersona       uint    `gorm:"column:id_persona"`
		Nombres         string  `gorm:"column:nombres"`
		ApellidoPaterno string  `gorm:"column:apellido_paterno"`
		ApellidoMaterno *string `gorm:"column:apellido_materno"`
		Generacion      string  `gorm:"column:generacion"`
		Ciudad          *string `gorm:"column:ciudad"`
		FotoPerfil      *string `gorm:"column:foto_perfil"`
		EsMiembroActivo bool    `gorm:"column:es_miembro_activo"`
		FamiliaApellido string  `gorm:"column:familia_apellido"`
		IDUser          *uint   `gorm:"column:id_user"`
		Email           *string `gorm:"column:email"`
	}

	var rows []resultado
	if err := query.Scan(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener miembros"})
		return
	}

	miembros := make([]MiembroListItem, 0, len(rows))
	for _, r := range rows {
		miembros = append(miembros, MiembroListItem{
			IDPersona:       r.IDPersona,
			IDUser:          r.IDUser,
			Email:           r.Email,
			Nombres:         r.Nombres,
			ApellidoPaterno: r.ApellidoPaterno,
			ApellidoMaterno: r.ApellidoMaterno,
			Generacion:      r.Generacion,
			Ciudad:          r.Ciudad,
			FotoPerfil:      r.FotoPerfil,
			EsMiembroActivo: r.EsMiembroActivo,
			FamiliaApellido: r.FamiliaApellido,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  miembros,
		"count": len(miembros),
	})
}

func (h *AdminMiembrosHandler) GetMiembroDetalle(c *gin.Context) {
	idParam := c.Param("id")

	// Validar que sea numérico por seguridad
	idPersona := uint(0)
	for _, ch := range idParam {
		if ch < '0' || ch > '9' {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}
		idPersona = idPersona*10 + uint(ch-'0')
	}
	if idPersona == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var persona models.Persona
	if err := database.DB.First(&persona, idPersona).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Miembro no encontrado"})
		return
	}

	var familia models.Familia
	if err := database.DB.First(&familia, persona.IDFamilia).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener familia"})
		return
	}

	detalle := MiembroDetalle{
		IDPersona:               persona.IDPersona,
		Nombres:                 persona.Nombres,
		ApellidoPaterno:         persona.ApellidoPaterno,
		ApellidoMaterno:         persona.ApellidoMaterno,
		NombreJapones:           persona.NombreJapones,
		NombreKanji:             persona.NombreKanji,
		Genero:                  persona.Genero,
		LugarNacimiento:         persona.LugarNacimiento,
		Generacion:              persona.Generacion,
		EstadoCivil:             persona.EstadoCivil,
		TelefonoPrincipal:       persona.TelefonoPrincipal,
		TelefonoAlternativo:     persona.TelefonoAlternativo,
		EmailPersonal:           persona.EmailPersonal,
		DireccionCompleta:       persona.DireccionCompleta,
		Ciudad:                  persona.Ciudad,
		Estado:                  persona.Estado,
		CodigoPostal:            persona.CodigoPostal,
		FotoPerfil:              persona.FotoPerfil,
		EsMiembroActivo:         persona.EsMiembroActivo,
		NivelJapones:            persona.NivelJapones,
		ParticipaEventos:        persona.ParticipaEventos,
		AceptaDirectorioPublico: persona.AceptaDirectorioPublico,
		AceptaComunicaciones:    persona.AceptaComunicaciones,
		Puesto:                  persona.Puesto,
		Familia: FamiliaResumen{
			IDFamilia:     familia.IDFamilia,
			ApellidoJP:    familia.ApellidoJP,
			ApellidoKanji: familia.ApellidoKanji,
		},
	}

	// Fecha nacimiento formateada
	if persona.FechaNacimiento != nil {
		s := persona.FechaNacimiento.Format("2006-01-02")
		detalle.FechaNacimiento = &s
	}

	// Fecha ingreso formateada
	if persona.FechaIngresoAsociacion != nil {
		s := persona.FechaIngresoAsociacion.Format("2006-01-02")
		detalle.FechaIngresoAsociacion = &s
	}

	// Usuario vinculado
	var user models.User
	if err := database.DB.Where("id_persona = ?", persona.IDPersona).First(&user).Error; err == nil {
		detalle.IDUser = &user.IDUser
		detalle.Email = &user.Email
		detalle.RegistroEstado = &user.RegistroEstado
	}

	// Empleo
	if persona.IDEmpresaEmpleadora != nil {
		var empleadora models.EmpresaEmpleadora
		if err := database.DB.First(&empleadora, *persona.IDEmpresaEmpleadora).Error; err == nil {
			detalle.Empleo = &EmpleoResumen{
				IDEmpresaEmpleadora: empleadora.IDEmpresaEmpleadora,
				NombreEmpresa:       empleadora.NombreEmpresa,
				Ciudad:              empleadora.Ciudad,
				Estado:              empleadora.Estado,
			}
		}
	}

	// Empresa propia
	var empresaPropia models.Empresa
	if err := database.DB.Where("id_propietario = ?", persona.IDPersona).First(&empresaPropia).Error; err == nil {
		detalle.EmpresaPropia = &EmpresaResumen{
			IDEmpresa:        empresaPropia.IDEmpresa,
			NombreEmpresa:    empresaPropia.NombreEmpresa,
			GiroComercial:    empresaPropia.GiroComercial,
			StatusAprobacion: empresaPropia.StatusAprobacion,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data": detalle,
	})
}
