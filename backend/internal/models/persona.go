package models

import (
	"time"
)

type Persona struct {
	IDPersona               uint       `gorm:"primaryKey;column:id_persona;autoIncrement" json:"id_persona"`
	IDFamilia               uint       `gorm:"not null" json:"id_familia"`
	Nombres                 string     `gorm:"not null;size:150" json:"nombres"`
	ApellidoPaterno         string     `gorm:"not null;size:100" json:"apellido_paterno"`
	ApellidoMaterno         *string    `gorm:"size:100" json:"apellido_materno"`
	NombreJapones           *string    `gorm:"size:150" json:"nombre_japones"`
	NombreKanji             *string    `gorm:"size:150" json:"nombre_kanji"`
	Genero                  *string    `gorm:"size:50;check:genero IN ('masculino','femenino','otro','prefiero_no_decir')" json:"genero"`
	FechaNacimiento         *time.Time `gorm:"type:date" json:"fecha_nacimiento"`
	LugarNacimiento         *string    `gorm:"size:200" json:"lugar_nacimiento"`
	Generacion              string     `gorm:"not null;size:50;check:generacion IN ('issei','nisei','sansei','yonsei','gosei','roksei')" json:"generacion"`
	EstadoCivil             *string    `gorm:"size:50;check:estado_civil IN ('soltero','casado','divorciado','viudo','union_libre')" json:"estado_civil"`
	TelefonoPrincipal       *string    `gorm:"size:20" json:"telefono_principal"`
	TelefonoAlternativo     *string    `gorm:"size:20" json:"telefono_alternativo"`
	EmailPersonal           *string    `gorm:"size:255" json:"email_personal"`
	DireccionCompleta       *string    `gorm:"type:text" json:"direccion_completa"`
	Ciudad                  *string    `gorm:"size:100" json:"ciudad"`
	Estado                  string     `gorm:"default:Sinaloa;size:100" json:"estado"`
	CodigoPostal            *string    `gorm:"size:10" json:"codigo_postal"`
	FotoPerfil              *string    `gorm:"size:500" json:"foto_perfil"`
	EsMiembroActivo         bool       `gorm:"default:false" json:"es_miembro_activo"`
	FechaIngresoAsociacion  *time.Time `gorm:"type:date" json:"fecha_ingreso_asociacion"`
	NivelJapones            *string    `gorm:"size:50;check:nivel_japones IN ('ninguno','basico','intermedio','avanzado','nativo')" json:"nivel_japones"`
	ParticipaEventos        bool       `gorm:"default:true" json:"participa_eventos"`
	AceptaDirectorioPublico bool       `gorm:"default:false" json:"acepta_directorio_publico"`
	AceptaComunicaciones    bool       `gorm:"default:true" json:"acepta_comunicaciones"`
	NotasAdministrativas    *string    `gorm:"type:text" json:"notas_administrativas"`
	IDEmpresaEmpleadora     *uint      `json:"id_empresa_empleadora"`
	Puesto                  *string    `gorm:"size:150" json:"puesto"`
	CreatedAt               time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt               time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	//Descomentar todas estas lineas cuando se quieran cargar las relaciones

	//Familia           Familia            `gorm:"foreignKey:IDFamilia;constraint:OnDelete:RESTRICT" json:"familia,omitempty"`
	//EmpresaEmpleadora *EmpresaEmpleadora `gorm:"foreignKey:IDEmpresaEmpleadora;constraint:OnDelete:SET NULL" json:"empresa_empleadora,omitempty"`

	//User              *User              `gorm:"foreignKey:IDPersona" json:"user,omitempty"`
	//EmpresaPropia     *Empresa           `gorm:"foreignKey:IDPropietario" json:"empresa_propia,omitempty"`

	//Eventos []Evento `gorm:"many2many:participacion_eventos;foreignKey:IDPersona;joinForeignKey:id_persona;References:IDEvento;joinReferences:id_evento" json:"eventos,omitempty"`

	//Parientes  []Persona `gorm:"many2many:genealogia;foreignKey:IDPersona;joinForeignKey:id_persona;References:IDPersona;joinReferences:id_pariente" json:"parientes,omitempty"`
	//Familiares []Persona `gorm:"many2many:genealogia;foreignKey:IDPersona;joinForeignKey:id_pariente;References:IDPersona;joinReferences:id_persona" json:"familiares,omitempty"`
}

func (Persona) TableName() string {
	return "personas"
}

func (p *Persona) GetNombreCompleto() string {
	nombreCompleto := p.Nombres + " " + p.ApellidoPaterno
	if p.ApellidoMaterno != nil && *p.ApellidoMaterno != "" {
		nombreCompleto += " " + *p.ApellidoMaterno
	}
	return nombreCompleto
}

func (p *Persona) EsIssei() bool {
	return p.Generacion == "issei"
}

func (p *Persona) EsAdultoMayor() bool {
	if p.FechaNacimiento == nil {
		return false
	}
	edad := time.Since(*p.FechaNacimiento).Hours() / 24 / 365
	return edad >= 65
}
