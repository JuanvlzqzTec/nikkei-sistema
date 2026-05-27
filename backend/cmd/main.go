package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/handlers"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/middleware"
)

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

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", "http://localhost:3001"}
	config.AllowCredentials = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(config))

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

		api.GET("/database/info", func(c *gin.Context) {
			var tables []string
			database.DB.Raw("SELECT tablename FROM pg_tables WHERE schemaname = 'public'").Scan(&tables)
			c.JSON(200, gin.H{"database": "nikkei_dev", "tables": tables})
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

		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/validate", middleware.OptionalAuth(), authHandler.ValidateToken)
		}

		//Slider (público)
		api.GET("/slider", sliderHandler.GetAll)

		//Galería (público)
		galeria := api.Group("/galeria")
		{
			galeria.GET("/", galeriaHandler.GetAll)
			galeria.GET("/destacados", galeriaHandler.GetDestacados)
			galeria.GET("/categorias", galeriaHandler.GetCategorias)
			galeria.GET("/:id", galeriaHandler.GetByID)
		}

		//Eventos (público)
		eventos := api.Group("/eventos")
		{
			eventos.GET("/proximos", eventosHandler.GetProximos)
			eventos.GET("/", eventosHandler.GetAll)
			eventos.GET("/:id", eventosHandler.GetByID)
		}

		//Empresas (público)
		empresas := api.Group("/empresas")
		{
			empresas.GET("/homepage", empresasHandler.GetHomepage)
			empresas.GET("/", empresasHandler.GetAll)
			empresas.GET("/:id", empresasHandler.GetByID)
		}

		// Familias (público — para el catálogo del wizard)
		familias := api.Group("/familias")
		{
			familias.GET("/publicas", familiasHandler.GetPublicas)
			familias.GET("/:id/miembros-publicos", familiasHandler.GetMiembrosPublicos)
		}

		// Empresas empleadoras (público — para autocomplete)
		api.GET("/empresas-empleadoras", empresasEmpleadorasHandler.GetAll)

		//Rutas usuario autenticado
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("profile", authHandler.GetProfile)
			protected.POST("logout", authHandler.Logout)
			protected.POST("change-password", authHandler.ChangePassword)
			protected.POST("refresh", authHandler.RefreshToken)

			// Usuario registrado puede solicitar registro de empresa
			protected.POST("empresas/solicitar", empresasHandler.SolicitarRegistro)

			// Mi empresa propia (miembro autenticado con registro completado)
			protected.GET("mi-empresa", empresasHandler.GetMiEmpresa)
			protected.PUT("mi-empresa", empresasHandler.UpdateMiEmpresa)

			// Mi empleo (empresa donde trabajo)
			protected.GET("mi-empleo", empresasEmpleadorasHandler.GetMiEmpleo)
			protected.PATCH("mi-empleo", empresasEmpleadorasHandler.UpdateMiEmpleo)
			protected.POST("empresas-empleadoras", empresasEmpleadorasHandler.Create)

			// Registro comunitario (usuario autenticado)
			protected.POST("registro-comunitario", registroHandler.CrearRegistro)
			protected.GET("registro-comunitario/mi-estado", registroHandler.MiEstado)

			// Contribuciones (donaciones, historias) — miembro autenticado
			protected.POST("contribuciones", contribucionesHandler.Crear)

			// Mi perfil (miembro autenticado con registro completado)
			protected.GET("mi-perfil", perfilHandler.GetMiPerfil)
			protected.PATCH("mi-perfil/datos-libres", perfilHandler.UpdateDatosLibres)
			protected.POST("mi-perfil/solicitar-cambio", perfilHandler.SolicitarCambio)
			protected.PATCH("mi-perfil/foto", perfilHandler.UpdateFoto)

			// Genealogía / Árbol familiar
			protected.GET("mi-arbol", genealogiaHandler.GetMiArbol)
			protected.GET("personas/buscar", genealogiaHandler.BuscarPersonas)
			protected.POST("personas/historica", genealogiaHandler.CrearPersonaHistorica)
			protected.POST("relaciones", genealogiaHandler.CrearRelacion)
			protected.PATCH("relaciones/:id/confirmar", genealogiaHandler.ConfirmarRelacion)
			protected.DELETE("relaciones/:id", genealogiaHandler.EliminarRelacion)
			protected.GET("relaciones/pendientes-confirmacion", genealogiaHandler.GetPendientesConfirmacion)

			//Rutas admin
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
			}
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Servidor iniciando en puerto %s", port)
	log.Printf("API: http://localhost:%s/api/v1", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Error al iniciar servidor:", err)
	}
}
