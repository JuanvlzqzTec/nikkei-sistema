package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/services"
)

// Crea el middleware de autenticación JWT
func AuthMiddleware() gin.HandlerFunc {
	authService := services.NewAuthService()

	return func(c *gin.Context) {
		// Obtener token del header Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Token de autorización requerido",
				"message": "Incluye el header Authorization con formato: Bearer <token>",
			})
			c.Abort()
			return
		}

		// Verificar formato Bearer
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Formato de autorización inválido",
				"message": "El header debe tener formato: Bearer <token>",
			})
			c.Abort()
			return
		}

		// Extraer token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Token vacío",
				"message": "El token JWT no puede estar vacío",
			})
			c.Abort()
			return
		}

		// Validar token
		claims, err := authService.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Token inválido",
				"message": err.Error(),
			})
			c.Abort()
			return
		}

		// Agregar información del usuario al contexto
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)
		c.Set("jwt_claims", claims)

		// Continuar con la siguiente función
		c.Next()
	}
}

// RequireRole middleware que requiere un rol específico
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Obtener rol del contexto
		userRole, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Error interno",
				"message": "No se pudo obtener información del usuario",
			})
			c.Abort()
			return
		}

		// Verificar si el rol está permitido
		role := userRole.(string)
		allowed := false
		for _, allowedRole := range allowedRoles {
			if role == allowedRole {
				allowed = true
				break
			}
		}

		if !allowed {
			c.JSON(http.StatusForbidden, gin.H{
				"error":          "Acceso denegado",
				"message":        "No tienes permisos suficientes para realizar esta acción",
				"required_roles": allowedRoles,
				"your_role":      role,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireAdmin middleware que requiere rol de administrador
func RequireAdmin() gin.HandlerFunc {
	return RequireRole("admin")
}

// RequireMember middleware que requiere rol de miembro o superior
func RequireMember() gin.HandlerFunc {
	return RequireRole("admin", "miembro")
}

// OptionalAuth middleware que permite acceso con o sin autenticación
// Si hay token válido, agrega la info al contexto
// Si no hay token o es inválido, continúa sin agregar info
func OptionalAuth() gin.HandlerFunc {
	authService := services.NewAuthService()

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		// Si no hay header de autorización, continuar sin autenticación
		if authHeader == "" {
			c.Next()
			return
		}

		// Si hay header, intentar validar
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenString := strings.TrimPrefix(authHeader, "Bearer ")

			if claims, err := authService.ValidateToken(tokenString); err == nil {
				// Token válido, agregar al contexto
				c.Set("user_id", claims.UserID)
				c.Set("user_email", claims.Email)
				c.Set("user_role", claims.Role)
				c.Set("jwt_claims", claims)
				c.Set("is_authenticated", true)
			} else {
				// Token inválido, marcar como no autenticado
				c.Set("is_authenticated", false)
			}
		}

		c.Next()
	}
}

// Obtener el usuario actual desde el contexto
func GetCurrentUser(c *gin.Context) (userID uint, email string, role string, exists bool) {
	userIDInterface, userIDExists := c.Get("user_id")
	emailInterface, emailExists := c.Get("user_email")
	roleInterface, roleExists := c.Get("user_role")

	if !userIDExists || !emailExists || !roleExists {
		return 0, "", "", false
	}

	return userIDInterface.(uint), emailInterface.(string), roleInterface.(string), true
}

// Verifica si el usuario está autenticado
func IsAuthenticated(c *gin.Context) bool {
	_, _, _, exists := GetCurrentUser(c)
	return exists
}

// Verifica si el usuario tiene un rol específico
func HasRole(c *gin.Context, role string) bool {
	_, _, userRole, exists := GetCurrentUser(c)
	return exists && userRole == role
}

// Verifica si el usuario es administrador
func IsAdmin(c *gin.Context) bool {
	return HasRole(c, "admin")
}

// Verifica si el usuario es miembro o superior
func IsMember(c *gin.Context) bool {
	return HasRole(c, "admin") || HasRole(c, "miembro")
}
