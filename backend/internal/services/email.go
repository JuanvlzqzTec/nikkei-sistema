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
	fromName string
}

func NewEmailService() *EmailService {
	return &EmailService{
		host:     getEnvEmail("SMTP_HOST", "smtp.gmail.com"),
		port:     getEnvEmail("SMTP_PORT", "587"),
		user:     os.Getenv("SMTP_USER"),
		password: os.Getenv("SMTP_PASSWORD"),
		to:       os.Getenv("SMTP_TO"),
		fromName: "Asociación Nikkei de Culiacán",
	}
}

func (s *EmailService) enviar(para, asunto, cuerpoHTML string) error {
	if s.user == "" || s.password == "" {
		return fmt.Errorf("SMTP no configurado")
	}
	auth := smtp.PlainAuth("", s.user, s.password, s.host)
	msg := []byte(fmt.Sprintf(
		"From: %s <%s>\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s",
		s.fromName, s.user, para, asunto, cuerpoHTML,
	))
	return smtp.SendMail(fmt.Sprintf("%s:%s", s.host, s.port), auth, s.user, []string{para}, msg)
}

func (s *EmailService) EnviarContacto(nombre, correo, mensaje string) error {
	asunto := fmt.Sprintf("Nuevo mensaje de contacto — %s", nombre)
	cuerpo := fmt.Sprintf(
		"<p><strong>Nombre:</strong> %s</p><p><strong>Correo:</strong> %s</p><p><strong>Mensaje:</strong><br>%s</p>",
		nombre, correo, mensaje,
	)
	return s.enviar(s.to, asunto, cuerpo)
}

func (s *EmailService) EnviarVerificacion(para, token string) error {
	appURL := getEnvEmail("APP_URL", "http://localhost:3001")
	link := fmt.Sprintf("%s/verify-email?token=%s", appURL, token)
	asunto := "Verifica tu correo — Asociación Nikkei de Culiacán"
	cuerpo := fmt.Sprintf(`
		<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
			<h2 style="color:#991b1b">Asociación Nikkei de Culiacán</h2>
			<p>Gracias por registrarte. Haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
			<a href="%s" style="display:inline-block;margin:16px 0;padding:12px 28px;background:#991b1b;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
				Verificar mi correo
			</a>
			<p style="color:#6b7280;font-size:13px">Este enlace expira en 24 horas. Si no creaste una cuenta, ignora este mensaje.</p>
		</div>
	`, link)
	return s.enviar(para, asunto, cuerpo)
}

func (s *EmailService) EnviarResetPassword(para, token string) error {
	appURL := getEnvEmail("APP_URL", "http://localhost:3001")
	link := fmt.Sprintf("%s/reset-password?token=%s", appURL, token)
	asunto := "Recupera tu contraseña — Asociación Nikkei de Culiacán"
	cuerpo := fmt.Sprintf(`
		<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
			<h2 style="color:#991b1b">Asociación Nikkei de Culiacán</h2>
			<p>Recibimos una solicitud para restablecer tu contraseña. Haz clic aquí:</p>
			<a href="%s" style="display:inline-block;margin:16px 0;padding:12px 28px;background:#991b1b;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
				Restablecer contraseña
			</a>
			<p style="color:#6b7280;font-size:13px">Este enlace expira en 1 hora. Si no solicitaste esto, ignora este mensaje.</p>
		</div>
	`, link)
	return s.enviar(para, asunto, cuerpo)
}

func getEnvEmail(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}
