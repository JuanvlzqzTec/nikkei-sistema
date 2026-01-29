package models

import (
	"time"
)

type Genealogia struct {
	IDGenealogia          uint       `gorm:"primaryKey;column:id_genealogia;autoIncrement" json:"id_genealogia"`
	IDPersona             uint       `gorm:"not null" json:"id_persona"`
	IDPariente            uint       `gorm:"not null" json:"id_pariente"`
	TipoRelacion          string     `gorm:"not null;size:50;check:tipo_relacion IN ('padre','madre','hijo','hija','esposo','esposa','hermano','hermana','abuelo','abuela','nieto','nieta','tio','tia','primo','prima','cuniado','cuniada','yerno','nuera','suegro','suegra')" json:"tipo_relacion"`
	ConfirmadoAmbasPartes bool       `gorm:"default:false" json:"confirmado_ambas_partes"`
	FechaConfirmacion     *time.Time `json:"fecha_confirmacion"`
	Notas                 *string    `gorm:"type:text" json:"notas"`
	CreatedAt             time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt             time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	Persona  Persona `gorm:"foreignKey:IDPersona;constraint:OnDelete:CASCADE" json:"persona,omitempty"`
	Pariente Persona `gorm:"foreignKey:IDPariente;constraint:OnDelete:CASCADE" json:"pariente,omitempty"`
}

func (Genealogia) TableName() string {
	return "genealogia"
}

func (g *Genealogia) EstaConfirmado() bool {
	return g.ConfirmadoAmbasPartes
}

func (g *Genealogia) EsRelacionPadreHijo() bool {
	return g.TipoRelacion == "padre" || g.TipoRelacion == "madre" ||
		g.TipoRelacion == "hijo" || g.TipoRelacion == "hija"
}

func (g *Genealogia) EsRelacionMatrimonial() bool {
	return g.TipoRelacion == "esposo" || g.TipoRelacion == "esposa"
}

func (g *Genealogia) EsRelacionHermanos() bool {
	return g.TipoRelacion == "hermano" || g.TipoRelacion == "hermana"
}

func (g *Genealogia) EsRelacionAbueloNieto() bool {
	return g.TipoRelacion == "abuelo" || g.TipoRelacion == "abuela" ||
		g.TipoRelacion == "nieto" || g.TipoRelacion == "nieta"
}

func (g *Genealogia) EsRelacionTioSobrino() bool {
	return g.TipoRelacion == "tio" || g.TipoRelacion == "tia"
}

func (g *Genealogia) EsRelacionPrimos() bool {
	return g.TipoRelacion == "primo" || g.TipoRelacion == "prima"
}

func (g *Genealogia) EsRelacionPolitica() bool {
	return g.TipoRelacion == "cuniado" || g.TipoRelacion == "cuniada" ||
		g.TipoRelacion == "yerno" || g.TipoRelacion == "nuera" ||
		g.TipoRelacion == "suegro" || g.TipoRelacion == "suegra"
}

func (g *Genealogia) GetRelacionInversa() string {
	relacionesInversas := map[string]string{
		"padre":   "hijo",
		"madre":   "hijo",
		"hijo":    "padre",
		"hija":    "padre",
		"esposo":  "esposa",
		"esposa":  "esposo",
		"hermano": "hermano",
		"hermana": "hermano",
		"abuelo":  "nieto",
		"abuela":  "nieto",
		"nieto":   "abuelo",
		"nieta":   "abuelo",
		"tio":     "primo",
		"tia":     "primo",
		"primo":   "primo",
		"prima":   "primo",
		"cuniado": "cuniado",
		"cuniada": "cuniado",
		"yerno":   "suegro",
		"nuera":   "suegro",
		"suegro":  "yerno",
		"suegra":  "yerno",
	}

	if inversa, exists := relacionesInversas[g.TipoRelacion]; exists {
		return inversa
	}
	return g.TipoRelacion
}

func (g *Genealogia) Confirmar() {
	g.ConfirmadoAmbasPartes = true
	now := time.Now()
	g.FechaConfirmacion = &now
}

func (g *Genealogia) GetNivelGeneracional() int {
	switch g.TipoRelacion {
	case "abuelo", "abuela":
		return -2
	case "padre", "madre":
		return -1
	case "esposo", "esposa", "hermano", "hermana", "primo", "prima", "cuniado", "cuniada":
		return 0
	case "hijo", "hija":
		return 1
	case "nieto", "nieta":
		return 2
	case "tio", "tia", "suegro", "suegra":
		return -1
	case "yerno", "nuera":
		return 1
	default:
		return 0
	}
}
