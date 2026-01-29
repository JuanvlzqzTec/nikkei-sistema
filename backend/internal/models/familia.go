package models

import (
	"time"
)

type Familia struct {
	IDFamilia            uint      `gorm:"primaryKey;column:id_familia;autoIncrement" json:"id_familia"`
	ApellidoJP           string    `gorm:"not null;size:100" json:"apellido_jp"`
	ApellidoRomanji      *string   `gorm:"size:100" json:"apellido_romanji"`
	ApellidoKanji        *string   `gorm:"size:100" json:"apellido_kanji"`
	ApellidoSignificado  *string   `gorm:"type:text" json:"apellido_significado"`
	PrefecturaOrigen     *string   `gorm:"size:100" json:"prefectura_origen"`
	CiudadOrigen         *string   `gorm:"size:100" json:"ciudad_origen"`
	AnioLlegadaMexico    *int      `json:"anio_llegada_mexico"`
	LugarLlegada         *string   `gorm:"size:100" json:"lugar_llegada"`
	HistoriaFamiliar     *string   `gorm:"type:text" json:"historia_familiar"`
	FotoFamiliar         *string   `gorm:"size:500" json:"foto_familiar"`
	DocumentosHistoricos *string   `gorm:"type:jsonb" json:"documentos_historicos"`
	CreatedAt            time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt            time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	Personas []Persona `gorm:"foreignKey:IDFamilia" json:"personas,omitempty"`
}

func (Familia) TableName() string {
	return "familias"
}
