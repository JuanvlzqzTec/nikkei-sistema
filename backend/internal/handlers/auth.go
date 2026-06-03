package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/middleware"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/models"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/services"
)

// Maneja las rutas de autenticación
type AuthHandler struct {
	authService *services.AuthService
}

// Crea una nueva instancia del handler de autenticación
func NewAuthHandler() *AuthHandler {
	return &AuthHandler{
		authService: services.NewAuthService(),
	}
}

// Estructura para la solicitud de registro
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role,omitempty"`
}

// Estructura para la solicitud de login
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Estructura para cambiar contraseña
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}

// Estructura para actualizar rol
type UpdateRoleRequest struct {
	Role string `json:"role" binding:"required"`
}

// Estructura para respuestas de autenticación
type AuthResponse struct {
	User  UserResponse `json:"user"`
	Token string       `json:"token"`
}

// Estructura para información del usuario
type UserResponse struct {
	ID             uint    `json:"id"`
	Email          string  `json:"email"`
	Role           string  `json:"role"`
	RegistroEstado string  `json:"registro_estado"`
	IsActive       bool    `json:"is_active"`
	EmailVerified  bool    `json:"email_verified"`
	IDPersona      *uint   `json:"id_persona"`
	NombreCompleto *string `json:"nombre_completo"`
	FotoPerfil     *string `json:"foto_perfil"`
}

// Maneja el registro de nuevos usuarios
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Datos inválidos",
			"message": err.Error(),
		})
		return
	}

	// Validar fortaleza de contraseña
	if err := h.authService.ValidatePasswordStrength(req.Password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Contraseña inválida",
			"message": err.Error(),
		})
		return
	}

	if err := services.ValidarDominioEmail(req.Email); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Registrar usuario
	user, err := h.authService.Register(req.Email, req.Password, req.Role)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	// Enviar email de verificación (no bloqueante)
	go func() {
		token, err := h.authService.GenerarTokenVerificacion(user.IDUser)
		if err == nil {
			emailSvc := services.NewEmailService()
			_ = emailSvc.EnviarVerificacion(user.Email, token)
		}
	}()

	// Generar token
	token, err := h.authService.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Error al generar token",
			"message": "Usuario registrado pero no se pudo generar token de acceso",
		})
		return
	}

	// Respuesta exitosa
	response := AuthResponse{
		User:  buildUserResponse(user),
		Token: token,
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Usuario registrado exitosamente",
		"data":    response,
	})
}

// Maneja el inicio de sesión
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Datos inválidos",
			"message": err.Error(),
		})
		return
	}

	// Autenticar usuario
	user, token, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Credenciales inválidas",
			"message": "Email o contraseña incorrectos",
		})
		return
	}

	// Respuesta exitosa
	response := AuthResponse{
		User:  buildUserResponse(user),
		Token: token,
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login exitoso",
		"data":    response,
	})
}

// Obtiene el perfil del usuario autenticado
func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, _, _, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "No autenticado",
			"message": "Token de autenticación requerido",
		})
		return
	}

	// Obtener información completa del usuario
	user, err := h.authService.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Usuario no encontrado",
			"message": err.Error(),
		})
		return
	}

	response := buildUserResponse(user)

	c.JSON(http.StatusOK, gin.H{
		"message": "Perfil obtenido exitosamente",
		"data":    response,
	})
}

// ChangePassword permite cambiar la contraseña del usuario autenticado
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, _, _, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "No autenticado",
			"message": "Token de autenticación requerido",
		})
		return
	}

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Datos inválidos",
			"message": err.Error(),
		})
		return
	}

	// Validar nueva contraseña
	if err := h.authService.ValidatePasswordStrength(req.NewPassword); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Nueva contraseña inválida",
			"message": err.Error(),
		})
		return
	}

	// Cambiar contraseña
	if err := h.authService.ChangePassword(userID, req.OldPassword, req.NewPassword); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Error al cambiar contraseña",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Contraseña cambiada exitosamente",
	})
}

// UpdateUserRole actualiza el rol de un usuario (solo admins)
func (h *AuthHandler) UpdateUserRole(c *gin.Context) {
	// Solo admins pueden cambiar roles
	if !middleware.IsAdmin(c) {
		c.JSON(http.StatusForbidden, gin.H{
			"error":   "Acceso denegado",
			"message": "Solo administradores pueden cambiar roles",
		})
		return
	}

	// Obtener ID del usuario a modificar
	userIDParam := c.Param("id")
	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "ID inválido",
			"message": "El ID del usuario debe ser un número válido",
		})
		return
	}

	var req UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Datos inválidos",
			"message": err.Error(),
		})
		return
	}

	// Actualizar rol
	if err := h.authService.UpdateUserRole(uint(userID), req.Role); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Error al actualizar rol",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Rol actualizado exitosamente",
	})
}

// DeactivateUser desactiva un usuario (solo admins)
func (h *AuthHandler) DeactivateUser(c *gin.Context) {
	// Solo admins pueden desactivar usuarios
	if !middleware.IsAdmin(c) {
		c.JSON(http.StatusForbidden, gin.H{
			"error":   "Acceso denegado",
			"message": "Solo administradores pueden desactivar usuarios",
		})
		return
	}

	// Obtener ID del usuario a desactivar
	userIDParam := c.Param("id")
	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "ID inválido",
			"message": "El ID del usuario debe ser un número válido",
		})
		return
	}

	// Desactivar usuario
	if err := h.authService.DeactivateUser(uint(userID)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Error al desactivar usuario",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Usuario desactivado exitosamente",
	})
}

// Logout maneja el cierre de sesión
func (h *AuthHandler) Logout(c *gin.Context) {
	// En un sistema JWT stateless, el logout se maneja en el frontend
	// eliminando el token. Aquí solo confirmamos la acción.
	c.JSON(http.StatusOK, gin.H{
		"message": "Sesión cerrada exitosamente",
		"note":    "Elimina el token JWT del almacenamiento local",
	})
}

// RefreshToken genera un nuevo token para el usuario autenticado
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	userID, _, _, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "No autenticado",
			"message": "Token de autenticación requerido",
		})
		return
	}

	// Obtener usuario actual
	user, err := h.authService.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Usuario no encontrado",
			"message": err.Error(),
		})
		return
	}

	// Generar nuevo token
	token, err := h.authService.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Error al generar token",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Token renovado exitosamente",
		"token":   token,
	})
}

// ValidateToken valida si un token es válido
func (h *AuthHandler) ValidateToken(c *gin.Context) {
	userID, _, _, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"valid": false,
			"error": "Token inválido",
		})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"valid": false,
			"error": "Usuario no encontrado",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"valid": true,
		"user":  buildUserResponse(&user),
	})
}

func buildUserResponse(user *models.User) UserResponse {
	resp := UserResponse{
		ID:             user.IDUser,
		Email:          user.Email,
		Role:           user.Role,
		RegistroEstado: user.RegistroEstado,
		IsActive:       user.IsActive,
		EmailVerified:  user.EmailVerified,
		IDPersona:      user.IDPersona,
	}

	if user.IDPersona != nil {
		var persona models.Persona
		if err := database.DB.
			Select("nombres", "apellido_paterno", "apellido_materno", "foto_perfil").
			First(&persona, *user.IDPersona).Error; err == nil {
			nombre := persona.Nombres + " " + persona.ApellidoPaterno
			if persona.ApellidoMaterno != nil && *persona.ApellidoMaterno != "" {
				nombre += " " + *persona.ApellidoMaterno
			}
			resp.NombreCompleto = &nombre
			resp.FotoPerfil = persona.FotoPerfil
		}
	}

	return resp
}

func (h *AuthHandler) VerificarEmail(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token requerido"})
		return
	}
	if err := h.authService.VerificarEmail(token); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Correo verificado exitosamente"})
}

func (h *AuthHandler) SolicitarResetPassword(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Correo inválido"})
		return
	}
	user, token, err := h.authService.SolicitarResetPassword(req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error interno"})
		return
	}
	// Siempre responder igual para no revelar si el email existe
	if user != nil && token != "" {
		emailSvc := services.NewEmailService()
		_ = emailSvc.EnviarResetPassword(user.Email, token)
	}
	c.JSON(http.StatusOK, gin.H{"message": "Si el correo existe, recibirás un enlace en los próximos minutos"})
}

func (h *AuthHandler) ConfirmarResetPassword(c *gin.Context) {
	var req struct {
		Token    string `json:"token" binding:"required"`
		Password string `json:"password" binding:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}
	if err := h.authService.ConfirmarResetPassword(req.Token, req.Password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Contraseña actualizada exitosamente"})
}
