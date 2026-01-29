package models

import (
	"time"
)

type Evento struct {
	IDEvento            uint       `gorm:"primaryKey;column:id_evento;autoIncrement" json:"id_evento"`
	IDOrganizador       uint       `gorm:"not null" json:"id_organizador"`
	Titulo              string     `gorm:"not null;size:200" json:"titulo"`
	Descripcion         *string    `gorm:"type:text" json:"descripcion"`
	TipoEvento          string     `gorm:"not null;size:50;check:tipo_evento IN ('matsuri','reunion','cultural','deportivo','educativo','empresarial','ceremonia')" json:"tipo_evento"`
	FechaInicio         time.Time  `gorm:"not null" json:"fecha_inicio"`
	FechaFin            *time.Time `json:"fecha_fin"`
	Ubicacion           *string    `gorm:"size:300" json:"ubicacion"`
	Direccion           *string    `gorm:"type:text" json:"direccion"`
	Ciudad              *string    `gorm:"size:100" json:"ciudad"`
	CapacidadMaxima     *int       `json:"capacidad_maxima"`
	RequiereRegistro    bool       `gorm:"default:true" json:"requiere_registro"`
	EsPublico           bool       `gorm:"default:true" json:"es_publico"`
	ImagenEvento        *string    `gorm:"size:500" json:"imagen_evento"`
	GaleriaFotos        *string    `gorm:"type:jsonb" json:"galeria_fotos"`
	LinkTransmision     *string    `gorm:"size:300" json:"link_transmision"`
	Requisitos          *string    `gorm:"type:text" json:"requisitos"`
	ProgramaActividades *string    `gorm:"type:jsonb" json:"programa_actividades"`
	ContactoOrganizador *string    `gorm:"size:100" json:"contacto_organizador"`
	Status              string     `gorm:"default:borrador;size:50;check:status IN ('borrador','publicado','en_curso','finalizado','cancelado')" json:"status"`
	CreatedAt           time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt           time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	Organizador   User      `gorm:"foreignKey:IDOrganizador;constraint:OnDelete:RESTRICT" json:"organizador,omitempty"`
	Participantes []Persona `gorm:"many2many:participacion_eventos;foreignKey:IDEvento;joinForeignKey:id_evento;References:IDPersona;joinReferences:id_persona" json:"participantes,omitempty"`
}

func (Evento) TableName() string {
	return "eventos"
}

func (e *Evento) EsFuturo() bool {
	return e.FechaInicio.After(time.Now())
}

func (e *Evento) EsPasado() bool {
	fechaFin := e.FechaFin
	if fechaFin == nil {
		fechaFin = &e.FechaInicio
	}
	return fechaFin.Before(time.Now())
}

func (e *Evento) EsEnCurso() bool {
	now := time.Now()
	if e.FechaFin != nil {
		return e.FechaInicio.Before(now) && e.FechaFin.After(now)
	}
	inicioDelDia := time.Date(e.FechaInicio.Year(), e.FechaInicio.Month(), e.FechaInicio.Day(), 0, 0, 0, 0, e.FechaInicio.Location())
	finDelDia := inicioDelDia.Add(24 * time.Hour)
	return now.After(inicioDelDia) && now.Before(finDelDia)
}

func (e *Evento) EsMatsuri() bool {
	return e.TipoEvento == "matsuri"
}

func (e *Evento) EstaPublicado() bool {
	return e.Status == "publicado"
}

func (e *Evento) TieneCapacidadDisponible(participantesActuales int) bool {
	if e.CapacidadMaxima == nil {
		return true
	}
	return participantesActuales < *e.CapacidadMaxima
}
