package services

import (
	"crypto/rand"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/models"
)

// Define los claims del token JWT
type JWTClaims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// Maneja la autenticación
type AuthService struct {
	db        *gorm.DB
	jwtSecret []byte
}

// Crea una nueva instancia del servicio de autenticación
func NewAuthService() *AuthService {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "nikkei-default-secret-change-in-production"
	}

	return &AuthService{
		db:        database.DB,
		jwtSecret: []byte(secret),
	}
}

// Crea un hash de la contraseña
func (s *AuthService) HashPassword(password string) (string, error) {
	cost := 10 // Costo del hash bcrypt
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), cost)
	if err != nil {
		return "", fmt.Errorf("error al generar hash: %w", err)
	}
	return string(hashedBytes), nil
}

// Verifica si la contraseña coincide con el hash
func (s *AuthService) CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// Genera un token JWT para el usuario
func (s *AuthService) GenerateToken(user *models.User) (string, error) {
	// Configurar expiración
	expirationTime := time.Now().Add(24 * time.Hour) // 24 horas

	// Crear claims
	claims := JWTClaims{
		UserID: user.IDUser,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   fmt.Sprintf("%d", user.IDUser),
			Issuer:    "nikkei-sistema",
		},
	}

	// Crear token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Firmar token
	tokenString, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return "", fmt.Errorf("error al firmar token: %w", err)
	}

	return tokenString, nil
}

// Valida un token JWT y retorna los claims
func (s *AuthService) ValidateToken(tokenString string) (*JWTClaims, error) {
	// Parsear token
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Verificar método de firma
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado: %v", token.Header["alg"])
		}
		return s.jwtSecret, nil
	})

	if err != nil {
		return nil, fmt.Errorf("error al parsear token: %w", err)
	}

	// Verificar claims
	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("token inválido")
}

// Registra un nuevo usuario
func (s *AuthService) Register(email, password, role string) (*models.User, error) {
	// Verificar que el email no exista
	var existingUser models.User
	result := s.db.Where("email = ?", email).First(&existingUser)
	if result.Error == nil {
		return nil, errors.New("el email ya está registrado")
	}
	if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("error al verificar email: %w", result.Error)
	}

	// Validar role
	validRoles := []string{"admin", "miembro", "pendiente"}
	roleValid := false
	for _, validRole := range validRoles {
		if role == validRole {
			roleValid = true
			break
		}
	}
	if !roleValid {
		role = "pendiente" // Role por defecto
	}

	// Hash de la contraseña
	hashedPassword, err := s.HashPassword(password)
	if err != nil {
		return nil, err
	}

	// Crear usuario
	user := models.User{
		Email:         email,
		PasswordHash:  hashedPassword,
		Role:          role,
		IsActive:      true,
		EmailVerified: false,
	}

	// Guardar en base de datos
	if err := s.db.Create(&user).Error; err != nil {
		return nil, fmt.Errorf("error al crear usuario: %w", err)
	}

	return &user, nil
}

// Autentica un usuario
func (s *AuthService) Login(email, password string) (*models.User, string, error) {
	// Buscar usuario por email
	var user models.User
	result := s.db.Where("email = ? AND is_active = ?", email, true).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, "", errors.New("credenciales inválidas")
		}
		return nil, "", fmt.Errorf("error al buscar usuario: %w", result.Error)
	}

	// Verificar contraseña
	if !s.CheckPassword(password, user.PasswordHash) {
		return nil, "", errors.New("credenciales inválidas")
	}

	// Actualizar último login
	now := time.Now()
	user.LastLogin = &now
	s.db.Save(&user)

	// Generar token
	token, err := s.GenerateToken(&user)
	if err != nil {
		return nil, "", err
	}

	return &user, token, nil
}

// Obtiene un usuario por su ID
func (s *AuthService) GetUserByID(userID uint) (*models.User, error) {
	var user models.User
	result := s.db.Where("id_user = ? AND is_active = ?", userID, true).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("usuario no encontrado")
		}
		return nil, fmt.Errorf("error al buscar usuario: %w", result.Error)
	}
	return &user, nil
}

// Cambia la contraseña de un usuario
func (s *AuthService) ChangePassword(userID uint, oldPassword, newPassword string) error {
	// Obtener usuario
	user, err := s.GetUserByID(userID)
	if err != nil {
		return err
	}

	// Verificar contraseña actual
	if !s.CheckPassword(oldPassword, user.PasswordHash) {
		return errors.New("contraseña actual incorrecta")
	}

	// Hash de nueva contraseña
	newHash, err := s.HashPassword(newPassword)
	if err != nil {
		return err
	}

	// Actualizar en base de datos
	result := s.db.Model(user).Update("password_hash", newHash)
	if result.Error != nil {
		return fmt.Errorf("error al actualizar contraseña: %w", result.Error)
	}

	return nil
}

// Valida la fortaleza de una contraseña
func (s *AuthService) ValidatePasswordStrength(password string) error {
	if len(password) < 8 {
		return errors.New("la contraseña debe tener al menos 8 caracteres")
	}

	return nil
}

// Desactiva un usuario
func (s *AuthService) DeactivateUser(userID uint) error {
	result := s.db.Model(&models.User{}).Where("id_user = ?", userID).Update("is_active", false)
	if result.Error != nil {
		return fmt.Errorf("error al desactivar usuario: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return errors.New("usuario no encontrado")
	}
	return nil
}

// UpdateUserRole actualiza el rol de un usuario
func (s *AuthService) UpdateUserRole(userID uint, newRole string) error {
	// Validar role
	validRoles := []string{"admin", "miembro", "pendiente"}
	roleValid := false
	for _, validRole := range validRoles {
		if newRole == validRole {
			roleValid = true
			break
		}
	}
	if !roleValid {
		return errors.New("rol inválido")
	}

	result := s.db.Model(&models.User{}).Where("id_user = ?", userID).Update("role", newRole)
	if result.Error != nil {
		return fmt.Errorf("error al actualizar rol: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return errors.New("usuario no encontrado")
	}
	return nil
}

// Dominios de email permitidos

var dominiosPermitidos = []string{
	"gmail.com", "outlook.com", "hotmail.com", "hotmail.es",
	"live.com", "live.com.mx", "yahoo.com", "yahoo.com.mx",
	"icloud.com", "me.com", "protonmail.com", "pm.me",
	"msn.com", "googlemail.com",
}

func ValidarDominioEmail(email string) error {
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return errors.New("correo electrónico inválido")
	}
	dominio := strings.ToLower(parts[1])
	for _, d := range dominiosPermitidos {
		if dominio == d {
			return nil
		}
	}
	return fmt.Errorf("el dominio @%s no está permitido. Usa Gmail, Outlook, Hotmail, Yahoo u otros proveedores reconocidos", dominio)
}

// Verificacion de email

func (s *AuthService) GenerarTokenVerificacion(userID uint) (string, error) {
	token := generateSecureToken()
	expiry := time.Now().Add(24 * time.Hour)
	if err := s.db.Model(&models.User{}).Where("id_user = ?", userID).Updates(map[string]interface{}{
		"verification_token":  token,
		"verification_expiry": expiry,
	}).Error; err != nil {
		return "", err
	}
	return token, nil
}

func (s *AuthService) VerificarEmail(token string) error {
	var user models.User
	if err := s.db.Where("verification_token = ?", token).First(&user).Error; err != nil {
		return errors.New("token inválido o expirado")
	}
	if user.VerificationExpiry == nil || time.Now().After(*user.VerificationExpiry) {
		return errors.New("el enlace de verificación ha expirado")
	}
	return s.db.Model(&user).Updates(map[string]interface{}{
		"email_verified":      true,
		"verification_token":  nil,
		"verification_expiry": nil,
	}).Error
}

// Reset de contraseña

func (s *AuthService) SolicitarResetPassword(email string) (*models.User, string, error) {
	var user models.User
	if err := s.db.Where("email = ? AND is_active = true", email).First(&user).Error; err != nil {
		// No revelar si el email existe o no
		return nil, "", nil
	}
	token := generateSecureToken()
	expiry := time.Now().Add(1 * time.Hour)
	if err := s.db.Model(&user).Updates(map[string]interface{}{
		"reset_token":  token,
		"reset_expiry": expiry,
	}).Error; err != nil {
		return nil, "", err
	}
	return &user, token, nil
}

func (s *AuthService) ConfirmarResetPassword(token, nuevaPassword string) error {
	var user models.User
	if err := s.db.Where("reset_token = ?", token).First(&user).Error; err != nil {
		return errors.New("token inválido o expirado")
	}
	if user.ResetExpiry == nil || time.Now().After(*user.ResetExpiry) {
		return errors.New("el enlace ha expirado, solicita uno nuevo")
	}
	if err := s.ValidatePasswordStrength(nuevaPassword); err != nil {
		return err
	}
	hash, err := s.HashPassword(nuevaPassword)
	if err != nil {
		return err
	}
	return s.db.Model(&user).Updates(map[string]interface{}{
		"password_hash": hash,
		"reset_token":   nil,
		"reset_expiry":  nil,
	}).Error
}

func generateSecureToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}
