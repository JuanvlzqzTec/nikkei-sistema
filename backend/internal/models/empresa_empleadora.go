package models

import (
	"time"
)

type EmpresaEmpleadora struct {
	IDEmpresaEmpleadora uint      `gorm:"primaryKey;column:id_empresa_empleadora;autoIncrement" json:"id_empresa_empleadora"`
	NombreEmpresa       string    `gorm:"not null;size:200" json:"nombre_empresa"`
	Descripcion         *string   `gorm:"type:text" json:"descripcion"`
	Ciudad              *string   `gorm:"size:100" json:"ciudad"`
	Estado              *string   `gorm:"size:100" json:"estado"`
	Pais                string    `gorm:"default:México;size:100" json:"pais"`
	CreatedAt           time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt           time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Descomentar cuando se implemente la relación con Persona
	// Empleados []Persona `gorm:"foreignKey:IDEmpresaEmpleadora" json:"empleados,omitempty"`
}

func (EmpresaEmpleadora) TableName() string {
	return "empresas_empleadoras"
}
