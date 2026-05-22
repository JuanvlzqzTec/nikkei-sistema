package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/models"
)

var DB *gorm.DB

func ConnectDatabase() {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "nikkei_user")
	password := getEnv("DB_PASSWORD", "nikkei_dev_password")
	dbname := getEnv("DB_NAME", "nikkei_dev")
	sslmode := getEnv("DB_SSL_MODE", "disable")
	timezone := getEnv("DB_TIMEZONE", "America/Mazatlan")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s",
		host, user, password, dbname, port, sslmode, timezone)

	var logLevel logger.LogLevel
	if os.Getenv("APP_ENV") == "production" {
		logLevel = logger.Error
	} else {
		logLevel = logger.Info
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
		NowFunc: func() time.Time {
			return time.Now().Local()
		},
	})

	if err != nil {
		log.Fatal("Error al conectar a la base de datos:", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Error al configurar pool de conexiones:", err)
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(time.Hour * 1)

	DB = db
	log.Println("¡Conexión a PostgreSQL establecida exitosamente!")
}

func AutoMigrate() {
	log.Println("Iniciando migraciones automáticas...")

	allModels := []interface{}{
		&models.Familia{},
		&models.EmpresaEmpleadora{},
		&models.Persona{},
		&models.User{},
		&models.Empresa{},
		&models.Evento{},
		&models.ParticipacionEvento{},
		&models.Genealogia{},
		&models.Galeria{},
		&models.SliderItem{},
		&models.Contribucion{},
	}

	err := DB.AutoMigrate(allModels...)
	if err != nil {
		log.Fatal("Error en las migraciones:", err)
	}

	createForeignKeys()
	createAdditionalConstraints()

	log.Println("¡Migraciones completadas exitosamente!")
}

func createForeignKeys() {
	log.Println("Creando foreign keys...")

	DB.Exec(`ALTER TABLE personas ADD CONSTRAINT IF NOT EXISTS fk_personas_familia FOREIGN KEY (id_familia) REFERENCES familias(id_familia) ON DELETE RESTRICT;`)
	DB.Exec(`ALTER TABLE personas ADD CONSTRAINT IF NOT EXISTS fk_personas_empresa_empleadora FOREIGN KEY (id_empresa_empleadora) REFERENCES empresas_empleadoras(id_empresa_empleadora) ON DELETE SET NULL;`)
	DB.Exec(`ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS fk_users_persona FOREIGN KEY (id_persona) REFERENCES personas(id_persona) ON DELETE SET NULL;`)
	DB.Exec(`ALTER TABLE empresas ADD CONSTRAINT IF NOT EXISTS fk_empresas_propietario FOREIGN KEY (id_propietario) REFERENCES personas(id_persona) ON DELETE RESTRICT;`)
	DB.Exec(`ALTER TABLE eventos ADD CONSTRAINT IF NOT EXISTS fk_eventos_organizador FOREIGN KEY (id_organizador) REFERENCES users(id_user) ON DELETE RESTRICT;`)
	DB.Exec(`ALTER TABLE participacion_eventos ADD CONSTRAINT IF NOT EXISTS fk_participacion_persona FOREIGN KEY (id_persona) REFERENCES personas(id_persona) ON DELETE CASCADE;`)
	DB.Exec(`ALTER TABLE participacion_eventos ADD CONSTRAINT IF NOT EXISTS fk_participacion_evento FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE CASCADE;`)
	DB.Exec(`ALTER TABLE genealogia ADD CONSTRAINT IF NOT EXISTS fk_genealogia_persona FOREIGN KEY (id_persona) REFERENCES personas(id_persona) ON DELETE CASCADE;`)
	DB.Exec(`ALTER TABLE genealogia ADD CONSTRAINT IF NOT EXISTS fk_genealogia_pariente FOREIGN KEY (id_pariente) REFERENCES personas(id_persona) ON DELETE CASCADE;`)
	DB.Exec(`ALTER TABLE contribuciones ADD CONSTRAINT IF NOT EXISTS fk_contribuciones_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE;`)

	log.Println("Foreign keys creadas")
}

func createAdditionalConstraints() {
	log.Println("Creando restricciones adicionales...")

	DB.Exec(`ALTER TABLE participacion_eventos ADD CONSTRAINT IF NOT EXISTS unique_persona_evento UNIQUE (id_persona, id_evento);`)
	DB.Exec(`ALTER TABLE genealogia ADD CONSTRAINT IF NOT EXISTS unique_relacion_genealogia UNIQUE (id_persona, id_pariente, tipo_relacion);`)
	DB.Exec(`ALTER TABLE genealogia ADD CONSTRAINT IF NOT EXISTS check_no_self_reference CHECK (id_persona != id_pariente);`)
	DB.Exec(`ALTER TABLE empresas_empleadoras ADD CONSTRAINT IF NOT EXISTS unique_empresa_ubicacion UNIQUE (nombre_empresa, ciudad, estado);`)

	log.Println("Restricciones adicionales creadas")
}

func CreateInitialData() {
	log.Println("Verificando datos iniciales...")

	var userCount int64
	DB.Model(&models.User{}).Count(&userCount)
	if userCount > 0 {
		log.Println("Datos iniciales ya existen, saltando...")
		return
	}

	// Datos estructurales de prueba — sin imágenes
	familias := []models.Familia{
		{ApellidoJP: "Tanaka", ApellidoRomanji: stringPtr("Tanaka"), ApellidoKanji: stringPtr("田中"), PrefecturaOrigen: stringPtr("Fukuoka"), AnioLlegadaMexico: intPtr(1954), LugarLlegada: stringPtr("Mazatlán")},
		{ApellidoJP: "Sato", ApellidoRomanji: stringPtr("Satō"), ApellidoKanji: stringPtr("佐藤"), PrefecturaOrigen: stringPtr("Hiroshima"), AnioLlegadaMexico: intPtr(1958), LugarLlegada: stringPtr("Manzanillo")},
		{ApellidoJP: "Yamamoto", ApellidoRomanji: stringPtr("Yamamoto"), ApellidoKanji: stringPtr("山本"), PrefecturaOrigen: stringPtr("Kumamoto"), AnioLlegadaMexico: intPtr(1962), LugarLlegada: stringPtr("Mazatlán")},
	}
	DB.Create(&familias)

	empresasEmpleadoras := []models.EmpresaEmpleadora{
		{NombreEmpresa: "Google México", Descripcion: stringPtr("Tecnología"), Ciudad: stringPtr("Ciudad de México"), Estado: stringPtr("CDMX")},
		{NombreEmpresa: "PEMEX", Descripcion: stringPtr("Petróleos Mexicanos"), Ciudad: stringPtr("Ciudad de México"), Estado: stringPtr("CDMX")},
	}
	DB.Create(&empresasEmpleadoras)

	personas := []models.Persona{
		{IDFamilia: 1, Nombres: "Hiroshi", ApellidoPaterno: "Tanaka", Generacion: "issei", EsMiembroActivo: true},
		{IDFamilia: 2, Nombres: "Carlos Kenji", ApellidoPaterno: "Sato", Generacion: "sansei", EsMiembroActivo: true},
	}
	DB.Create(&personas)

	// Usuario admin inicial — el slider y la galería los carga el admin desde el panel
	adminUser := models.User{
		Email:         "admin@nikkei-sinaloa.org",
		PasswordHash:  "$2a$10$ejemplo_hash_cambiar_en_produccion",
		Role:          "admin",
		IsActive:      true,
		EmailVerified: true,
	}
	DB.Create(&adminUser)

	log.Println("¡Datos iniciales creados exitosamente!")
}

func stringPtr(s string) *string { return &s }
func intPtr(i int) *int          { return &i }

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func CloseDatabase() {
	if DB != nil {
		if sqlDB, err := DB.DB(); err == nil {
			sqlDB.Close()
			log.Println("Conexión a la base de datos cerrada")
		}
	}
}
