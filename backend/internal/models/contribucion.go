package models

import (
	"time"
)

type Contribucion struct {
	IDContribucion   uint      `gorm:"primaryKey;column:id_contribucion;autoIncrement" json:"id_contribucion"`
	IDUser           uint      `gorm:"not null" json:"id_user"`
	Mensaje          string    `gorm:"type:text;not null" json:"mensaje"`
	TelefonoContacto *string   `gorm:"size:20" json:"telefono_contacto"`
	Estado           string    `gorm:"default:pendiente;size:50;check:estado IN ('pendiente','atendida','descartada')" json:"estado"`
	NotaAdmin        *string   `gorm:"type:text" json:"nota_admin"`
	CreatedAt        time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Contribucion) TableName() string {
	return "contribuciones"
}

func (c *Contribucion) EsPendiente() bool {
	return c.Estado == "pendiente"
}
