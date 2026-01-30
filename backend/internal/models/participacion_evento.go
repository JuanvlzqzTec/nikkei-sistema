package models

import (
	"time"
)

type ParticipacionEvento struct {
	IDParticipacion       uint       `gorm:"primaryKey;column:id_participacion;autoIncrement" json:"id_participacion"`
	IDPersona             uint       `gorm:"not null" json:"id_persona"`
	IDEvento              uint       `gorm:"not null" json:"id_evento"`
	FechaRegistro         time.Time  `gorm:"autoCreateTime" json:"fecha_registro"`
	StatusParticipacion   string     `gorm:"default:registrado;size:50;check:status_participacion IN ('registrado','confirmado','asistio','no_asistio','cancelado')" json:"status_participacion"`
	FechaConfirmacion     *time.Time `json:"fecha_confirmacion"`
	NotasParticipante     *string    `gorm:"type:text" json:"notas_participante"`
	CalificacionEvento    *int       `gorm:"check:calificacion_evento >= 1 AND calificacion_evento <= 5" json:"calificacion_evento"`
	ComentarioEvento      *string    `gorm:"type:text" json:"comentario_evento"`
	Acompaniantes         int        `gorm:"default:0" json:"acompaniantes"`
	NecesidadesEspeciales *string    `gorm:"type:text" json:"necesidades_especiales"`
	CreatedAt             time.Time  `gorm:"autoCreateTime" json:"created_at"`

	//Descomentar cuando se quieran cargar las relaciones
	//Persona Persona `gorm:"foreignKey:IDPersona;constraint:OnDelete:CASCADE" json:"persona,omitempty"`
	//Evento  Evento  `gorm:"foreignKey:IDEvento;constraint:OnDelete:CASCADE" json:"evento,omitempty"`
}

func (ParticipacionEvento) TableName() string {
	return "participacion_eventos"
}

func (pe *ParticipacionEvento) EstaConfirmado() bool {
	return pe.StatusParticipacion == "confirmado"
}

func (pe *ParticipacionEvento) Asistio() bool {
	return pe.StatusParticipacion == "asistio"
}

func (pe *ParticipacionEvento) EstaCancelado() bool {
	return pe.StatusParticipacion == "cancelado"
}

func (pe *ParticipacionEvento) TieneAcompaniantes() bool {
	return pe.Acompaniantes > 0
}

func (pe *ParticipacionEvento) TieneNecesidadesEspeciales() bool {
	return pe.NecesidadesEspeciales != nil && *pe.NecesidadesEspeciales != ""
}

func (pe *ParticipacionEvento) CalificoEvento() bool {
	return pe.CalificacionEvento != nil
}

func (pe *ParticipacionEvento) GetTotalPersonas() int {
	return 1 + pe.Acompaniantes
}

func (pe *ParticipacionEvento) Confirmar() {
	pe.StatusParticipacion = "confirmado"
	now := time.Now()
	pe.FechaConfirmacion = &now
}

func (pe *ParticipacionEvento) MarcarAsistencia() {
	pe.StatusParticipacion = "asistio"
}

func (pe *ParticipacionEvento) MarcarNoAsistencia() {
	pe.StatusParticipacion = "no_asistio"
}

func (pe *ParticipacionEvento) Cancelar() {
	pe.StatusParticipacion = "cancelado"
}
