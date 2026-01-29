package models

import (
	"time"
)

type User struct {
	IDUser        uint       `gorm:"primaryKey;column:id_user;autoIncrement" json:"id_user"`
	Email         string     `gorm:"uniqueIndex;not null;size:255" json:"email"`
	PasswordHash  string     `gorm:"not null;size:255" json:"-"`
	Role          string     `gorm:"default:pendiente;size:50;check:role IN ('admin','miembro','pendiente')" json:"role"`
	IsActive      bool       `gorm:"default:true" json:"is_active"`
	EmailVerified bool       `gorm:"default:false" json:"email_verified"`
	LastLogin     *time.Time `gorm:"null" json:"last_login"`
	IDPersona     *uint      `gorm:"uniqueIndex;null" json:"id_persona"`
	CreatedAt     time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	Persona *Persona `gorm:"foreignKey:IDPersona;constraint:OnDelete:SET NULL" json:"persona,omitempty"`
}

func (User) TableName() string {
	return "users"
}
