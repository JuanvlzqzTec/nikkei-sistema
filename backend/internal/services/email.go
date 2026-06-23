package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

type EmailService struct {
	apiKey    string
	fromName  string
	fromEmail string
}

func NewEmailService() *EmailService {
	return &EmailService{
		apiKey:    os.Getenv("RESEND_API_KEY"),
		fromName:  "Nikkei Culiacán AC",
		fromEmail: "noreply@nikkeiculiacan.com",
	}
}

type resendPayload struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Html    string   `json:"html"`
}

func (s *EmailService) enviar(para, asunto, cuerpoHTML string) error {
	if s.apiKey == "" {
		log.Println("ERROR EMAIL: RESEND_API_KEY no configurada")
		return fmt.Errorf("RESEND_API_KEY no configurada")
	}

	payload := resendPayload{
		From:    fmt.Sprintf("%s <%s>", s.fromName, s.fromEmail),
		To:      []string{para},
		Subject: asunto,
		Html:    cuerpoHTML,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		log.Printf("ERROR EMAIL Resend status %d: %s", resp.StatusCode, string(bodyBytes))
		return fmt.Errorf("Resend error: status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	log.Printf("EMAIL enviado OK a %s", para)
	return nil
}

func (s *EmailService) EnviarContacto(nombre, correo, mensaje string) error {
	asunto := fmt.Sprintf("Nuevo mensaje de contacto — %s", nombre)
	cuerpo := fmt.Sprintf(`
		<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
			<h2 style="color:#991b1b">Nikkei Culiacán AC</h2>
			<p><strong>Nombre:</strong> %s</p>
			<p><strong>Correo:</strong> %s</p>
			<p><strong>Mensaje:</strong><br>%s</p>
		</div>
	`, nombre, correo, mensaje)
	return s.enviar(os.Getenv("SMTP_TO"), asunto, cuerpo)
}

func (s *EmailService) EnviarVerificacion(para, token string) error {
	appURL := getEnvEmail("APP_URL", "http://localhost:3000")
	link := fmt.Sprintf("%s/verify-email?token=%s", appURL, token)
	asunto := "Verifica tu correo — Nikkei Culiacán AC"
	cuerpo := fmt.Sprintf(`
		<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
			<h2 style="color:#991b1b">Nikkei Culiacán AC</h2>
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
	appURL := getEnvEmail("APP_URL", "http://localhost:3000")
	link := fmt.Sprintf("%s/reset-password?token=%s", appURL, token)
	asunto := "Recupera tu contraseña — Nikkei Culiacán AC"
	cuerpo := fmt.Sprintf(`
		<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px">
			<h2 style="color:#991b1b">Nikkei Culiacán AC</h2>
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
