package models

import (
	"time"
)

type Empresa struct {
	IDEmpresa                 uint       `gorm:"primaryKey;column:id_empresa;autoIncrement" json:"id_empresa"`
	IDPropietario             uint       `gorm:"uniqueIndex;not null" json:"id_propietario"`
	NombreEmpresa             string     `gorm:"not null;size:200" json:"nombre_empresa"`
	RazonSocial               *string    `gorm:"size:250" json:"razon_social"`
	RFC                       *string    `gorm:"size:13" json:"rfc"`
	GiroComercial             *string    `gorm:"size:150" json:"giro_comercial"`
	Sector                    *string    `gorm:"size:100" json:"sector"`
	Descripcion               *string    `gorm:"type:text" json:"descripcion"`
	Telefono                  *string    `gorm:"size:20" json:"telefono"`
	Email                     *string    `gorm:"size:255" json:"email"`
	SitioWeb                  *string    `gorm:"size:300" json:"sitio_web"`
	Direccion                 *string    `gorm:"type:text" json:"direccion"`
	Ciudad                    *string    `gorm:"size:100" json:"ciudad"`
	Estado                    string     `gorm:"default:Sinaloa;size:100" json:"estado"`
	CodigoPostal              *string    `gorm:"size:10" json:"codigo_postal"`
	FechaFundacion            *time.Time `gorm:"type:date" json:"fecha_fundacion"`
	NumeroEmpleados           *int       `json:"numero_empleados"`
	AceptaPromocionDirectorio bool       `gorm:"default:true" json:"acepta_promocion_directorio"`
	LogoEmpresa               *string    `gorm:"size:500" json:"logo_empresa"`
	FotosEmpresa              *string    `gorm:"type:jsonb" json:"fotos_empresa"`
	RedesSociales             *string    `gorm:"type:jsonb" json:"redes_sociales"`
	HorariosAtencion          *string    `gorm:"type:jsonb" json:"horarios_atencion"`
	ServiciosProductos        *string    `gorm:"type:text" json:"servicios_productos"`
	CreatedAt                 time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt                 time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	//Descomentar cuando se quiera cargar la relacion
	//Propietario Persona `gorm:"foreignKey:IDPropietario;constraint:OnDelete:RESTRICT" json:"propietario,omitempty"`
}

func (Empresa) TableName() string {
	return "empresas"
}

func (e *Empresa) EsRestaurante() bool {
	return e.Sector != nil && *e.Sector == "Restaurantes"
}

func (e *Empresa) TieneSitioWeb() bool {
	return e.SitioWeb != nil && *e.SitioWeb != ""
}
