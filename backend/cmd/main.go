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

	api := r.Group("/api/v1")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":   "ok",
				"message":  "Sistema Nikkei API funcionando",
				"version":  "1.0.0",
				"database": "PostgreSQL conectado",
				"tables":   "8 tablas creadas",
			})
		})

		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message": "pong",
			})
		})

		api.GET("/database/info", func(c *gin.Context) {
			var tables []string
			database.DB.Raw("SELECT tablename FROM pg_tables WHERE schemaname = 'public'").Scan(&tables)

			c.JSON(200, gin.H{
				"database": "nikkei_dev",
				"tables":   tables,
				"models": []string{
					"users", "familias", "personas", "empresas",
					"empresas_empleadoras", "eventos",
					"participacion_eventos", "genealogia",
				},
			})
		})

		api.GET("/stats", func(c *gin.Context) {
			stats := make(map[string]int64)

			// Variables temporales para contar registros
			var usersCount, familiasCount, personasCount, empresasCount int64
			var empresasEmpleadorasCount, eventosCount, participacionCount, genealogiaCount int64

			database.DB.Table("users").Count(&usersCount)
			database.DB.Table("familias").Count(&familiasCount)
			database.DB.Table("personas").Count(&personasCount)
			database.DB.Table("empresas").Count(&empresasCount)
			database.DB.Table("empresas_empleadoras").Count(&empresasEmpleadorasCount)
			database.DB.Table("eventos").Count(&eventosCount)
			database.DB.Table("participacion_eventos").Count(&participacionCount)
			database.DB.Table("genealogia").Count(&genealogiaCount)

			// Asignar a map
			stats["users"] = usersCount
			stats["familias"] = familiasCount
			stats["personas"] = personasCount
			stats["empresas"] = empresasCount
			stats["empresas_empleadoras"] = empresasEmpleadorasCount
			stats["eventos"] = eventosCount
			stats["participacion_eventos"] = participacionCount
			stats["genealogia"] = genealogiaCount

			c.JSON(200, gin.H{
				"message": "Estadísticas de la base de datos",
				"counts":  stats,
			})
		})
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Servidor iniciando en puerto %s", port)
	log.Printf("API disponible en: http://localhost:%s/api/v1", port)
	log.Printf("Health check: http://localhost:%s/api/v1/health", port)
	log.Printf("Database info: http://localhost:%s/api/v1/database/info", port)
	log.Printf("Statistics: http://localhost:%s/api/v1/stats", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatal("Error al iniciar servidor:", err)
	}
}
