package models

import (
	"time"
)

type Galeria struct {
	IDGaleria   uint       `gorm:"primaryKey;column:id_galeria;autoIncrement" json:"id_galeria"`
	Titulo      string     `gorm:"not null;size:200" json:"titulo"`
	Descripcion *string    `gorm:"type:text" json:"descripcion"`
	URLImagen   string     `gorm:"not null;size:500" json:"url_imagen"`
	FechaHito   *time.Time `gorm:"type:date" json:"fecha_hito"`
	Categoria   string     `gorm:"not null;size:100;check:categoria IN ('inmigracion','fundacion','evento_historico','cultura','personaje_clave')" json:"categoria"`
	EsDestacado bool       `gorm:"default:false" json:"es_destacado"`
	Orden       int        `gorm:"default:0" json:"orden"`
	CreatedAt   time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Galeria) TableName() string {
	return "galeria_historica"
}
func (g *Galeria) EsHitoReciente() bool {
	if g.FechaHito == nil {
		return false
	}
	hace50Anios := time.Now().AddDate(-50, 0, 0)
	return g.FechaHito.After(hace50Anios)
}
func (g *Galeria) GetAnio() int {
	if g.FechaHito == nil {
		return 0
	}
	return g.FechaHito.Year()
}
