package services

import (
	"fmt"
	"net/smtp"
	"os"
)

type EmailService struct {
	host     string
	port     string
	user     string
	password string
	to       string
}

func NewEmailService() *EmailService {
	return &EmailService{
		host:     getEnvEmail("SMTP_HOST", "smtp.gmail.com"),
		port:     getEnvEmail("SMTP_PORT", "587"),
		user:     os.Getenv("SMTP_USER"),
		password: os.Getenv("SMTP_PASSWORD"),
		to:       os.Getenv("SMTP_TO"),
	}
}

func (s *EmailService) EnviarContacto(nombre, correo, mensaje string) error {
	if s.user == "" || s.password == "" {
		return fmt.Errorf("SMTP no configurado")
	}

	auth := smtp.PlainAuth("", s.user, s.password, s.host)

	asunto := fmt.Sprintf("Nuevo mensaje de contacto — %s", nombre)
	cuerpo := fmt.Sprintf(
		"Nombre: %s\nCorreo: %s\n\nMensaje:\n%s",
		nombre, correo, mensaje,
	)
	msg := []byte(fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n%s",
		s.user, s.to, asunto, cuerpo,
	))

	addr := fmt.Sprintf("%s:%s", s.host, s.port)
	return smtp.SendMail(addr, auth, s.user, []string{s.to}, msg)
}

func getEnvEmail(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}
