package main

import (
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/time/rate"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database/seeders"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/handlers"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/middleware"
)

// Rate limiter simple por IP
var limiters = make(map[string]*rate.Limiter)

func getRateLimiter(ip string) *rate.Limiter {
	if l, exists := limiters[ip]; exists {
		return l
	}
	l := rate.NewLimiter(rate.Every(time.Second), 30) // 30 req/seg por IP
	limiters[ip] = l
	return l
}

func rateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !getRateLimiter(ip).Allow() {
			c.JSON(429, gin.H{"error": "Demasiadas solicitudes, intenta más tarde"})
			c.Abort()
			return
		}
		c.Next()
	}
}

func main() {
	if err := godotenv.Load("../.env"); err != nil {
		log.Println("No se encontró archivo .env, usando variables del sistema")
	}

	if os.Getenv("APP_ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	database.ConnectDatabase()
	database.AutoMigrate()
	database.CreateInitialData()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		log.Println("Cerrando aplicación...")
		database.CloseDatabase()
		os.Exit(0)
	}()

	r := gin.Default()

	// CORS
	allowedOrigins := []string{"http://localhost:3000", "http://localhost:3001"}
	if origins := os.Getenv("ALLOWED_ORIGINS"); origins != "" {
		extra := strings.Split(origins, ",")
		for _, o := range extra {
			o = strings.TrimSpace(o)
			if o != "" {
				allowedOrigins = append(allowedOrigins, o)
			}
		}
	}

	corsConfig := cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	r.Use(cors.New(corsConfig))
	r.Use(rateLimitMiddleware())

	// Handlers
	authHandler := handlers.NewAuthHandler()
	galeriaHandler := handlers.NewGaleriaHandler()
	sliderHandler := handlers.NewSliderHandler()
	eventosHandler := handlers.NewEventosHandler()
	empresasHandler := handlers.NewEmpresasHandler()
	empresasEmpleadorasHandler := handlers.NewEmpresasEmpleadorasHandler()
	familiasHandler := handlers.NewFamiliasHandler()
	registroHandler := handlers.NewRegistroComunitarioHandler()
	contribucionesHandler := handlers.NewContribucionesHandler()
	perfilHandler := handlers.NewPerfilHandler()
	genealogiaHandler := handlers.NewGenealogiaHandler()
	adminArbolesHandler := handlers.NewAdminArbolesHandler()
	contactoHandler := handlers.NewContactoHandler()
	adminEstadisticasHandler := handlers.NewAdminEstadisticasHandler()

	api := r.Group("/api/v1")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":  "ok",
				"message": "Sistema Nikkei API funcionando",
				"version": "1.0.0",
			})
		})

		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "pong"})
		})

		api.GET("/stats", func(c *gin.Context) {
			stats := make(map[string]int64)
			var usersCount, familiasCount, personasCount, empresasCount int64
			var eventosCount, galeriaCount, sliderCount int64

			database.DB.Table("users").Count(&usersCount)
			database.DB.Table("familias").Count(&familiasCount)
			database.DB.Table("personas").Count(&personasCount)
			database.DB.Table("empresas").Count(&empresasCount)
			database.DB.Table("eventos").Count(&eventosCount)
			database.DB.Table("galeria_historica").Count(&galeriaCount)
			database.DB.Table("slider_items").Count(&sliderCount)

			stats["users"] = usersCount
			stats["familias"] = familiasCount
			stats["personas"] = personasCount
			stats["empresas"] = empresasCount
			stats["eventos"] = eventosCount
			stats["galeria_historica"] = galeriaCount
			stats["slider_items"] = sliderCount

			c.JSON(200, gin.H{"message": "Estadísticas", "counts": stats})
		})

		api.POST("/contacto", contactoHandler.Enviar)

		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/validate", middleware.OptionalAuth(), authHandler.ValidateToken)
			auth.GET("/verify-email", authHandler.VerificarEmail)
			auth.POST("/forgot-password", authHandler.SolicitarResetPassword)
			auth.POST("/reset-password", authHandler.ConfirmarResetPassword)
		}

		api.GET("/slider", sliderHandler.GetAll)

		galeria := api.Group("/galeria")
		{
			galeria.GET("/", galeriaHandler.GetAll)
			galeria.GET("/destacados", galeriaHandler.GetDestacados)
			galeria.GET("/categorias", galeriaHandler.GetCategorias)
			galeria.GET("/:id", galeriaHandler.GetByID)
		}

		eventos := api.Group("/eventos")
		{
			eventos.GET("/proximos", eventosHandler.GetProximos)
			eventos.GET("/", eventosHandler.GetAll)
			eventos.GET("/:id", eventosHandler.GetByID)
			eventos.POST("/:id/registrarse", eventosHandler.Registrarse)
		}

		empresas := api.Group("/empresas")
		{
			empresas.GET("/homepage", empresasHandler.GetHomepage)
			empresas.GET("/", empresasHandler.GetAll)
			empresas.GET("/:id", empresasHandler.GetByID)
		}

		familias := api.Group("/familias")
		{
			familias.GET("/publicas", familiasHandler.GetPublicas)
			familias.GET("/:id/miembros-publicos", familiasHandler.GetMiembrosPublicos)
		}

		api.GET("/empresas-empleadoras", empresasEmpleadorasHandler.GetAll)

		// Solo disponible fuera de producción
		if os.Getenv("APP_ENV") != "production" {
			api.POST("/dev/seed-demo", func(c *gin.Context) {
				seeders.RunDemoSeeder(database.DB)
				c.JSON(200, gin.H{"message": "Demo seeder ejecutado"})
			})
		}

		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("profile", authHandler.GetProfile)
			protected.POST("logout", authHandler.Logout)
			protected.POST("change-password", authHandler.ChangePassword)
			protected.POST("refresh", authHandler.RefreshToken)

			protected.POST("empresas/solicitar", empresasHandler.SolicitarRegistro)
			protected.GET("mi-empresa", empresasHandler.GetMiEmpresa)
			protected.PUT("mi-empresa", empresasHandler.UpdateMiEmpresa)

			protected.GET("mi-empleo", empresasEmpleadorasHandler.GetMiEmpleo)
			protected.PATCH("mi-empleo", empresasEmpleadorasHandler.UpdateMiEmpleo)
			protected.POST("empresas-empleadoras", empresasEmpleadorasHandler.Create)

			protected.POST("registro-comunitario", registroHandler.CrearRegistro)
			protected.GET("registro-comunitario/mi-estado", registroHandler.MiEstado)

			protected.POST("contribuciones", contribucionesHandler.Crear)

			protected.GET("mi-perfil", perfilHandler.GetMiPerfil)
			protected.PATCH("mi-perfil/datos-libres", perfilHandler.UpdateDatosLibres)
			protected.POST("mi-perfil/solicitar-cambio", perfilHandler.SolicitarCambio)
			protected.PATCH("mi-perfil/foto", perfilHandler.UpdateFoto)

			protected.GET("mi-arbol", genealogiaHandler.GetMiArbol)
			protected.GET("personas/buscar", genealogiaHandler.BuscarPersonas)
			protected.POST("personas/historica", genealogiaHandler.CrearPersonaHistorica)
			protected.POST("relaciones", genealogiaHandler.CrearRelacion)
			protected.PATCH("relaciones/:id/confirmar", genealogiaHandler.ConfirmarRelacion)
			protected.DELETE("relaciones/:id", genealogiaHandler.EliminarRelacion)
			protected.GET("relaciones/pendientes-confirmacion", genealogiaHandler.GetPendientesConfirmacion)
			protected.GET("mi-familia-arbol", genealogiaHandler.GetArbolDeMiFamilia)

			admin := protected.Group("/admin")
			admin.Use(middleware.RequireAdmin())
			{
				admin.PUT("users/:id/role", authHandler.UpdateUserRole)
				admin.DELETE("users/:id", authHandler.DeactivateUser)
				admin.GET("registros-pendientes", registroHandler.GetPendientes)
				admin.PATCH("registros-pendientes/:id/aprobar", registroHandler.Aprobar)
				admin.PATCH("registros-pendientes/:id/rechazar", registroHandler.Rechazar)

				sliderAdmin := admin.Group("/slider")
				{
					sliderAdmin.GET("/", sliderHandler.GetAllAdmin)
					sliderAdmin.POST("/", sliderHandler.Create)
					sliderAdmin.PUT("/:id", sliderHandler.Update)
					sliderAdmin.DELETE("/:id", sliderHandler.Delete)
					sliderAdmin.PUT("/reorder", sliderHandler.Reorder)
				}

				galeriaAdmin := admin.Group("/galeria")
				{
					galeriaAdmin.POST("/", galeriaHandler.Create)
					galeriaAdmin.PUT("/:id", galeriaHandler.Update)
					galeriaAdmin.DELETE("/:id", galeriaHandler.Delete)
				}

				eventosAdmin := admin.Group("/eventos")
				{
					eventosAdmin.GET("/", eventosHandler.GetAll)
					eventosAdmin.POST("/", eventosHandler.Create)
					eventosAdmin.PUT("/:id", eventosHandler.Update)
					eventosAdmin.DELETE("/:id", eventosHandler.Delete)
					eventosAdmin.PATCH("/:id/status", eventosHandler.UpdateStatus)
					eventosAdmin.GET("/:id/participantes", eventosHandler.GetParticipantes)
				}

				empresasAdmin := admin.Group("/empresas")
				{
					empresasAdmin.GET("/", empresasHandler.GetAll)
					empresasAdmin.POST("/", empresasHandler.Create)
					empresasAdmin.PUT("/:id", empresasHandler.Update)
					empresasAdmin.DELETE("/:id", empresasHandler.Delete)
					empresasAdmin.PATCH("/:id/aprobacion", empresasHandler.UpdateAprobacion)
					empresasAdmin.PATCH("/:id/homepage", empresasHandler.SetHomepage)
				}

				admin.GET("contribuciones", contribucionesHandler.GetPendientes)
				admin.PATCH("contribuciones/:id/estado", contribucionesHandler.MarcarEstado)
				admin.GET("arboles/familias", adminArbolesHandler.GetFamiliasConArboles)
				admin.GET("arboles/familias/:id", adminArbolesHandler.GetArbolFamilia)
				admin.GET("estadisticas", adminEstadisticasHandler.GetEstadisticas)
			}
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Servidor iniciando en puerto %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Error al iniciar servidor:", err)
	}
}
