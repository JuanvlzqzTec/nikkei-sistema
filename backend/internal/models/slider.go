package models

import "time"

type SliderItem struct {
	IDSlider  uint      `gorm:"primaryKey;column:id_slider;autoIncrement" json:"id_slider"`
	URLImagen string    `gorm:"not null;size:500" json:"url_imagen"`
	Titulo    *string   `gorm:"size:200" json:"titulo"`
	Orden     int       `gorm:"default:0;not null" json:"orden"`
	EsActivo  bool      `gorm:"default:true" json:"es_activo"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (SliderItem) TableName() string {
	return "slider_items"
}
