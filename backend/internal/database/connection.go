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

	models := []interface{}{
		&models.Familia{},
		&models.EmpresaEmpleadora{},
		&models.Persona{},
		&models.User{},
		&models.Empresa{},
		&models.Evento{},
		&models.ParticipacionEvento{},
		&models.Genealogia{},
		&models.Galeria{},
	}

	err := DB.AutoMigrate(models...)
	if err != nil {
		log.Fatal("Error en las migraciones:", err)
	}

	createForeignKeys()

	createAdditionalConstraints()

	log.Println("¡Migraciones completadas exitosamente!")
	log.Println("Base de datos lista para usar")
}

func createForeignKeys() {
	log.Println("Creando foreign keys...")

	DB.Exec(`
		ALTER TABLE personas 
		ADD CONSTRAINT IF NOT EXISTS fk_personas_familia 
		FOREIGN KEY (id_familia) REFERENCES familias(id_familia) 
		ON DELETE RESTRICT;
	`)

	DB.Exec(`
		ALTER TABLE personas 
		ADD CONSTRAINT IF NOT EXISTS fk_personas_empresa_empleadora 
		FOREIGN KEY (id_empresa_empleadora) REFERENCES empresas_empleadoras(id_empresa_empleadora) 
		ON DELETE SET NULL;
	`)

	DB.Exec(`
		ALTER TABLE users 
		ADD CONSTRAINT IF NOT EXISTS fk_users_persona 
		FOREIGN KEY (id_persona) REFERENCES personas(id_persona) 
		ON DELETE SET NULL;
	`)

	DB.Exec(`
		ALTER TABLE empresas 
		ADD CONSTRAINT IF NOT EXISTS fk_empresas_propietario 
		FOREIGN KEY (id_propietario) REFERENCES personas(id_persona) 
		ON DELETE RESTRICT;
	`)

	DB.Exec(`
		ALTER TABLE eventos 
		ADD CONSTRAINT IF NOT EXISTS fk_eventos_organizador 
		FOREIGN KEY (id_organizador) REFERENCES users(id_user) 
		ON DELETE RESTRICT;
	`)

	DB.Exec(`
		ALTER TABLE participacion_eventos 
		ADD CONSTRAINT IF NOT EXISTS fk_participacion_persona 
		FOREIGN KEY (id_persona) REFERENCES personas(id_persona) 
		ON DELETE CASCADE;
	`)

	DB.Exec(`
		ALTER TABLE participacion_eventos 
		ADD CONSTRAINT IF NOT EXISTS fk_participacion_evento 
		FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) 
		ON DELETE CASCADE;
	`)

	DB.Exec(`
		ALTER TABLE genealogia 
		ADD CONSTRAINT IF NOT EXISTS fk_genealogia_persona 
		FOREIGN KEY (id_persona) REFERENCES personas(id_persona) 
		ON DELETE CASCADE;
	`)

	DB.Exec(`
		ALTER TABLE genealogia 
		ADD CONSTRAINT IF NOT EXISTS fk_genealogia_pariente 
		FOREIGN KEY (id_pariente) REFERENCES personas(id_persona) 
		ON DELETE CASCADE;
	`)

	log.Println("Foreign keys creadas")
}

func createAdditionalConstraints() {
	log.Println("Creando restricciones adicionales...")

	DB.Exec(`
		ALTER TABLE participacion_eventos 
		ADD CONSTRAINT IF NOT EXISTS unique_persona_evento 
		UNIQUE (id_persona, id_evento);
	`)

	DB.Exec(`
		ALTER TABLE genealogia 
		ADD CONSTRAINT IF NOT EXISTS unique_relacion_genealogia 
		UNIQUE (id_persona, id_pariente, tipo_relacion);
	`)

	DB.Exec(`
		ALTER TABLE genealogia 
		ADD CONSTRAINT IF NOT EXISTS check_no_self_reference 
		CHECK (id_persona != id_pariente);
	`)

	DB.Exec(`
		ALTER TABLE empresas_empleadoras 
		ADD CONSTRAINT IF NOT EXISTS unique_empresa_ubicacion 
		UNIQUE (nombre_empresa, ciudad, estado);
	`)

	log.Println("Restricciones adicionales creadas")
}

func CreateInitialData() {
	log.Println("Creando datos iniciales...")

	var userCount int64
	DB.Model(&models.User{}).Count(&userCount)
	if userCount > 0 {
		log.Println("Datos iniciales ya existen, saltando...")
		return
	}

	familias := []models.Familia{
		{
			ApellidoJP:        "Tanaka",
			ApellidoRomanji:   stringPtr("Tanaka"),
			ApellidoKanji:     stringPtr("田中"),
			PrefecturaOrigen:  stringPtr("Fukuoka"),
			AnioLlegadaMexico: intPtr(1954),
			LugarLlegada:      stringPtr("Mazatlán"),
		},
		{
			ApellidoJP:        "Sato",
			ApellidoRomanji:   stringPtr("Satō"),
			ApellidoKanji:     stringPtr("佐藤"),
			PrefecturaOrigen:  stringPtr("Hiroshima"),
			AnioLlegadaMexico: intPtr(1958),
			LugarLlegada:      stringPtr("Manzanillo"),
		},
		{
			ApellidoJP:        "Yamamoto",
			ApellidoRomanji:   stringPtr("Yamamoto"),
			ApellidoKanji:     stringPtr("山本"),
			PrefecturaOrigen:  stringPtr("Kumamoto"),
			AnioLlegadaMexico: intPtr(1962),
			LugarLlegada:      stringPtr("Mazatlán"),
		},
	}

	result := DB.Create(&familias)
	if result.Error != nil {
		log.Printf("Error creando familias: %v", result.Error)
	} else {
		log.Printf("Creadas %d familias de ejemplo", len(familias))
	}

	empresasEmpleadoras := []models.EmpresaEmpleadora{
		{
			NombreEmpresa: "Google México",
			Descripcion:   stringPtr("Tecnología y servicios de internet"),
			Ciudad:        stringPtr("Ciudad de México"),
			Estado:        stringPtr("Ciudad de México"),
		},
		{
			NombreEmpresa: "PEMEX",
			Descripcion:   stringPtr("Petróleos Mexicanos"),
			Ciudad:        stringPtr("Ciudad de México"),
			Estado:        stringPtr("Ciudad de México"),
		},
		{
			NombreEmpresa: "Mazda México",
			Descripcion:   stringPtr("Automotriz japonesa"),
			Ciudad:        stringPtr("Salamanca"),
			Estado:        stringPtr("Guanajuato"),
		},
	}

	result = DB.Create(&empresasEmpleadoras)
	if result.Error != nil {
		log.Printf("Error creando empresas empleadoras: %v", result.Error)
	} else {
		log.Printf("Creadas %d empresas empleadoras de ejemplo", len(empresasEmpleadoras))
	}

	personas := []models.Persona{
		{
			IDFamilia:       1,
			Nombres:         "Hiroshi",
			ApellidoPaterno: "Tanaka",
			Generacion:      "issei",
			EsMiembroActivo: true,
		},
		{
			IDFamilia:       1,
			Nombres:         "María Elena",
			ApellidoPaterno: "Tanaka",
			Generacion:      "nisei",
			EsMiembroActivo: true,
		},
		{
			IDFamilia:       2,
			Nombres:         "Carlos Kenji",
			ApellidoPaterno: "Sato",
			Generacion:      "sansei",
			EsMiembroActivo: true,
		},
		{
			IDFamilia:       3,
			Nombres:         "Ana Yuki",
			ApellidoPaterno: "Yamamoto",
			Generacion:      "yonsei",
			EsMiembroActivo: false,
		},
	}

	result = DB.Create(&personas)
	if result.Error != nil {
		log.Printf("Error creando personas: %v", result.Error)
	} else {
		log.Printf("Creadas %d personas de ejemplo", len(personas))
	}

	hitos := []models.Galeria{
		{
			Titulo:      "Primeros Inmigrantes a Mazatlán",
			Descripcion: stringPtr("Fotografía de las primeras familias Nikkei que se establecieron en el puerto."),
			URLImagen:   "/assets/slider/slide-1.jpg",
			Categoria:   "inmigracion",
			EsDestacado: true,
			Orden:       1,
		},
		{
			Titulo:      "Fundación de la Asociación",
			Descripcion: stringPtr("Reunión histórica donde se formalizaron los estatutos de la asociación."),
			URLImagen:   "/assets/slider/slide-2.jpg",
			Categoria:   "fundacion",
			EsDestacado: true,
			Orden:       2,
		},
		{
			Titulo:      "Primer Festival Matsuri",
			Descripcion: stringPtr("Celebración del primer festival cultural de la comunidad."),
			URLImagen:   "/assets/slider/slide-3.jpg",
			Categoria:   "cultura",
			EsDestacado: true,
			Orden:       3,
		},
	}

	result = DB.Create(&hitos)
	if result.Error != nil {
		log.Printf("Error creando hitos: %v", result.Error)
	} else {
		log.Printf("Creados %d hitos", len(hitos))
	}

	adminUser := models.User{
		Email:         "admin@nikkei-sinaloa.org",
		PasswordHash:  "$2a$10$ejemplo_hash_cambiar_en_produccion",
		Role:          "admin",
		IsActive:      true,
		EmailVerified: true,
	}

	result = DB.Create(&adminUser)
	if result.Error != nil {
		log.Printf("Error creando usuario admin: %v", result.Error)
	} else {
		log.Println("Usuario administrador creado")
	}

	log.Println("¡Datos iniciales creados exitosamente!")
}

func stringPtr(s string) *string {
	return &s
}

func intPtr(i int) *int {
	return &i
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func CloseDatabase() {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err == nil {
			sqlDB.Close()
			log.Println("🔌 Conexión a la base de datos cerrada")
		}
	}
}
