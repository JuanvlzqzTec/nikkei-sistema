package models

import "time"

type ParticipacionEvento struct {
	IDParticipacion uint      `gorm:"primaryKey;column:id_participacion;autoIncrement" json:"id_participacion"`
	IDPersona       uint      `gorm:"default:0" json:"id_persona"`
	IDEvento        uint      `gorm:"not null" json:"id_evento"`
	NombreVisitante *string   `gorm:"size:150" json:"nombre_visitante"`
	EdadVisitante   *int      `json:"edad_visitante"`
	Acompaniantes   int       `gorm:"default:0" json:"acompaniantes"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (ParticipacionEvento) TableName() string {
	return "participacion_eventos"
}

func (pe *ParticipacionEvento) GetTotalPersonas() int {
	return 1 + pe.Acompaniantes
}
