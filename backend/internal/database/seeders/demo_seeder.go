package seeders

import (
	"log"
	"math/rand"
	"time"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/models"
	"gorm.io/gorm"
)

func sp(s string) *string       { return &s }
func ip(i int) *int             { return &i }
func tp(t time.Time) *time.Time { return &t }

func RunDemoSeeder(db *gorm.DB) {
	log.Println("🌱 Iniciando demo seeder...")

	// ── Limpiar datos existentes (excepto admin) ──────────────────────────────
	db.Exec(`DELETE FROM participacion_eventos`)
	db.Exec(`DELETE FROM genealogia`)
	db.Exec(`DELETE FROM contribuciones`)
	db.Exec(`DELETE FROM empresas`)
	db.Exec(`DELETE FROM eventos WHERE id_organizador IN (SELECT id_user FROM users WHERE role != 'admin')`)
	db.Exec(`DELETE FROM users WHERE role != 'admin'`)
	db.Exec(`DELETE FROM personas`)
	db.Exec(`DELETE FROM familias`)

	// ── Familias ──────────────────────────────────────────────────────────────
	familias := []models.Familia{
		{ApellidoJP: "Tanaka", ApellidoRomanji: sp("Tanaka"), ApellidoKanji: sp("田中"), PrefecturaOrigen: sp("Fukuoka"), AnioLlegadaMexico: ip(1952), LugarLlegada: sp("Mazatlán")},
		{ApellidoJP: "Sato", ApellidoRomanji: sp("Satō"), ApellidoKanji: sp("佐藤"), PrefecturaOrigen: sp("Hiroshima"), AnioLlegadaMexico: ip(1955), LugarLlegada: sp("Manzanillo")},
		{ApellidoJP: "Yamamoto", ApellidoRomanji: sp("Yamamoto"), ApellidoKanji: sp("山本"), PrefecturaOrigen: sp("Kumamoto"), AnioLlegadaMexico: ip(1960), LugarLlegada: sp("Mazatlán")},
		{ApellidoJP: "Nakamura", ApellidoRomanji: sp("Nakamura"), ApellidoKanji: sp("中村"), PrefecturaOrigen: sp("Okinawa"), AnioLlegadaMexico: ip(1948), LugarLlegada: sp("Culiacán")},
		{ApellidoJP: "Watanabe", ApellidoRomanji: sp("Watanabe"), ApellidoKanji: sp("渡辺"), PrefecturaOrigen: sp("Osaka"), AnioLlegadaMexico: ip(1963), LugarLlegada: sp("Culiacán")},
		{ApellidoJP: "Ito", ApellidoRomanji: sp("Itō"), ApellidoKanji: sp("伊藤"), PrefecturaOrigen: sp("Aichi"), AnioLlegadaMexico: ip(1957), LugarLlegada: sp("Mazatlán")},
		{ApellidoJP: "Kobayashi", ApellidoRomanji: sp("Kobayashi"), ApellidoKanji: sp("小林"), PrefecturaOrigen: sp("Niigata"), AnioLlegadaMexico: ip(1970), LugarLlegada: sp("Culiacán")},
		{ApellidoJP: "Kato", ApellidoRomanji: sp("Katō"), ApellidoKanji: sp("加藤"), PrefecturaOrigen: sp("Shizuoka"), AnioLlegadaMexico: ip(1965), LugarLlegada: sp("Los Mochis")},
		{ApellidoJP: "Yoshida", ApellidoRomanji: sp("Yoshida"), ApellidoKanji: sp("吉田"), PrefecturaOrigen: sp("Fukuoka"), AnioLlegadaMexico: ip(1958), LugarLlegada: sp("Guasave")},
		{ApellidoJP: "Yamada", ApellidoRomanji: sp("Yamada"), ApellidoKanji: sp("山田"), PrefecturaOrigen: sp("Okinawa"), AnioLlegadaMexico: ip(1953), LugarLlegada: sp("Culiacán")},
	}
	db.Create(&familias)
	log.Printf("  ✓ %d familias creadas", len(familias))

	// ── Personas ──────────────────────────────────────────────────────────────
	generaciones := []string{"issei", "nisei", "sansei", "yonsei", "gosei"}
	generos := []string{"masculino", "femenino", "masculino", "femenino", "otro"}
	nivelesJP := []string{"ninguno", "basico", "intermedio", "avanzado", "nativo"}
	ciudades := []string{"Culiacán", "Culiacán", "Culiacán", "Los Mochis", "Mazatlán", "Guasave", "Guamúchil"}
	estados := []string{"Sinaloa"}

	type personaDef struct {
		nombres    string
		apellido   string
		familia    uint
		gen        string
		genero     string
		nivel      string
		ciudad     string
		nacimiento time.Time
	}

	defs := []personaDef{
		// Issei (1ª gen) — nacidos ~1925-1940
		{"Kenji", "Tanaka", familias[0].IDFamilia, "issei", "masculino", "nativo", "Culiacán", time.Date(1928, 3, 10, 0, 0, 0, 0, time.Local)},
		{"Fumiko", "Sato", familias[1].IDFamilia, "issei", "femenino", "nativo", "Los Mochis", time.Date(1932, 7, 22, 0, 0, 0, 0, time.Local)},
		{"Hiroshi", "Nakamura", familias[3].IDFamilia, "issei", "masculino", "nativo", "Culiacán", time.Date(1925, 1, 5, 0, 0, 0, 0, time.Local)},

		// Nisei (2ª gen) — nacidos ~1945-1960
		{"Roberto Akira", "Tanaka", familias[0].IDFamilia, "nisei", "masculino", "avanzado", "Culiacán", time.Date(1953, 5, 14, 0, 0, 0, 0, time.Local)},
		{"María Yuki", "Sato", familias[1].IDFamilia, "nisei", "femenino", "intermedio", "Mazatlán", time.Date(1958, 9, 3, 0, 0, 0, 0, time.Local)},
		{"Jorge Taro", "Yamamoto", familias[2].IDFamilia, "nisei", "masculino", "avanzado", "Culiacán", time.Date(1950, 12, 18, 0, 0, 0, 0, time.Local)},
		{"Ana Hanako", "Nakamura", familias[3].IDFamilia, "nisei", "femenino", "intermedio", "Culiacán", time.Date(1955, 4, 7, 0, 0, 0, 0, time.Local)},
		{"Luis Jiro", "Watanabe", familias[4].IDFamilia, "nisei", "masculino", "basico", "Los Mochis", time.Date(1962, 8, 25, 0, 0, 0, 0, time.Local)},

		// Sansei (3ª gen) — nacidos ~1965-1980
		{"Carlos Kenji", "Tanaka", familias[0].IDFamilia, "sansei", "masculino", "basico", "Culiacán", time.Date(1975, 2, 20, 0, 0, 0, 0, time.Local)},
		{"Patricia Midori", "Sato", familias[1].IDFamilia, "sansei", "femenino", "basico", "Culiacán", time.Date(1978, 11, 11, 0, 0, 0, 0, time.Local)},
		{"Ricardo Saburo", "Yamamoto", familias[2].IDFamilia, "sansei", "masculino", "ninguno", "Mazatlán", time.Date(1970, 6, 30, 0, 0, 0, 0, time.Local)},
		{"Laura Sachiko", "Ito", familias[5].IDFamilia, "sansei", "femenino", "intermedio", "Culiacán", time.Date(1973, 3, 15, 0, 0, 0, 0, time.Local)},
		{"Miguel Shiro", "Kobayashi", familias[6].IDFamilia, "sansei", "masculino", "basico", "Guasave", time.Date(1968, 9, 8, 0, 0, 0, 0, time.Local)},
		{"Sandra Kazuko", "Kato", familias[7].IDFamilia, "sansei", "femenino", "ninguno", "Los Mochis", time.Date(1980, 1, 27, 0, 0, 0, 0, time.Local)},
		{"Fernando Hideo", "Yoshida", familias[8].IDFamilia, "sansei", "masculino", "basico", "Culiacán", time.Date(1976, 7, 4, 0, 0, 0, 0, time.Local)},

		// Yonsei (4ª gen) — nacidos ~1985-2000
		{"Sebastián Ryu", "Tanaka", familias[0].IDFamilia, "yonsei", "masculino", "ninguno", "Culiacán", time.Date(1995, 4, 12, 0, 0, 0, 0, time.Local)},
		{"Valentina Ai", "Sato", familias[1].IDFamilia, "yonsei", "femenino", "basico", "Culiacán", time.Date(1998, 8, 3, 0, 0, 0, 0, time.Local)},
		{"Diego Ren", "Nakamura", familias[3].IDFamilia, "yonsei", "masculino", "ninguno", "Culiacán", time.Date(1992, 12, 22, 0, 0, 0, 0, time.Local)},
		{"Camila Yui", "Yamamoto", familias[2].IDFamilia, "yonsei", "femenino", "basico", "Mazatlán", time.Date(1997, 5, 16, 0, 0, 0, 0, time.Local)},
		{"Andrés Kai", "Watanabe", familias[4].IDFamilia, "yonsei", "masculino", "ninguno", "Los Mochis", time.Date(1990, 2, 8, 0, 0, 0, 0, time.Local)},
		{"Sofía Hana", "Ito", familias[5].IDFamilia, "yonsei", "femenino", "basico", "Culiacán", time.Date(2000, 9, 30, 0, 0, 0, 0, time.Local)},
		{"Emilio Sora", "Kobayashi", familias[6].IDFamilia, "yonsei", "masculino", "ninguno", "Guasave", time.Date(1993, 6, 14, 0, 0, 0, 0, time.Local)},
		{"Daniela Mio", "Yamada", familias[9].IDFamilia, "yonsei", "femenino", "basico", "Culiacán", time.Date(1996, 11, 20, 0, 0, 0, 0, time.Local)},

		// Gosei (5ª gen) — nacidos ~2005-2015
		{"Mateo Rin", "Tanaka", familias[0].IDFamilia, "gosei", "masculino", "ninguno", "Culiacán", time.Date(2008, 3, 5, 0, 0, 0, 0, time.Local)},
		{"Isabella Koa", "Sato", familias[1].IDFamilia, "gosei", "femenino", "ninguno", "Culiacán", time.Date(2010, 7, 18, 0, 0, 0, 0, time.Local)},
		{"Tomás Ichi", "Nakamura", familias[3].IDFamilia, "gosei", "masculino", "ninguno", "Culiacán", time.Date(2012, 1, 9, 0, 0, 0, 0, time.Local)},
		{"Valeria Suki", "Watanabe", familias[4].IDFamilia, "gosei", "femenino", "basico", "Los Mochis", time.Date(2007, 10, 24, 0, 0, 0, 0, time.Local)},
		{"Nicolás Hiro", "Yoshida", familias[8].IDFamilia, "gosei", "masculino", "ninguno", "Culiacán", time.Date(2005, 5, 31, 0, 0, 0, 0, time.Local)},
	}

	_ = generaciones
	_ = generos
	_ = nivelesJP
	_ = ciudades
	_ = estados

	now := time.Now()
	personas := make([]models.Persona, 0, len(defs))
	for _, d := range defs {
		p := models.Persona{
			IDFamilia:               d.familia,
			Nombres:                 d.nombres,
			ApellidoPaterno:         d.apellido,
			Generacion:              d.gen,
			Genero:                  sp(d.genero),
			FechaNacimiento:         tp(d.nacimiento),
			Ciudad:                  sp(d.ciudad),
			Estado:                  "Sinaloa",
			NivelJapones:            sp(d.nivel),
			EsMiembroActivo:         true,
			FechaIngresoAsociacion:  tp(now.AddDate(0, -rand.Intn(24), -rand.Intn(28))),
			AceptaDirectorioPublico: rand.Intn(2) == 0,
			AceptaComunicaciones:    true,
			TelefonoPrincipal:       sp("6671000000"),
			ParticipaEventos:        true,
		}
		personas = append(personas, p)
	}
	db.Create(&personas)
	log.Printf("  ✓ %d personas creadas", len(personas))

	// ── Eventos ───────────────────────────────────────────────────────────────
	var adminUser models.User
	db.Where("role = 'admin'").First(&adminUser)

	eventos := []models.Evento{
		{
			IDOrganizador: adminUser.IDUser,
			Titulo:        "Matsuri de Verano 2024", TipoEvento: "matsuri",
			FechaInicio: time.Date(2024, 7, 15, 17, 0, 0, 0, time.Local),
			FechaFin:    tp(time.Date(2024, 7, 15, 22, 0, 0, 0, time.Local)),
			Ubicacion:   sp("Parque Constitución"), Ciudad: sp("Culiacán"),
			CapacidadMaxima: ip(300), RequiereRegistro: true, Status: "finalizado",
			Descripcion: sp("Festival japonés de verano con danzas tradicionales, comida y juegos."),
		},
		{
			IDOrganizador: adminUser.IDUser,
			Titulo:        "Reunión Anual Nikkei 2024", TipoEvento: "reunion",
			FechaInicio: time.Date(2024, 11, 10, 10, 0, 0, 0, time.Local),
			FechaFin:    tp(time.Date(2024, 11, 10, 14, 0, 0, 0, time.Local)),
			Ubicacion:   sp("Salón Nikkei"), Ciudad: sp("Culiacán"),
			CapacidadMaxima: ip(150), RequiereRegistro: true, Status: "finalizado",
			Descripcion: sp("Asamblea anual de la comunidad Nikkei de Sinaloa."),
		},
		{
			IDOrganizador: adminUser.IDUser,
			Titulo:        "Taller de Japonés — Básico", TipoEvento: "educativo",
			FechaInicio: time.Date(2025, 2, 8, 9, 0, 0, 0, time.Local),
			FechaFin:    tp(time.Date(2025, 2, 8, 13, 0, 0, 0, time.Local)),
			Ubicacion:   sp("Centro Cultural Nikkei"), Ciudad: sp("Culiacán"),
			CapacidadMaxima: ip(30), RequiereRegistro: true, Status: "finalizado",
			Descripcion: sp("Introducción al idioma japonés para miembros de la comunidad."),
		},
		{
			IDOrganizador: adminUser.IDUser,
			Titulo:        "Torneo de Kendo Nikkei", TipoEvento: "deportivo",
			FechaInicio: time.Date(2025, 4, 5, 8, 0, 0, 0, time.Local),
			FechaFin:    tp(time.Date(2025, 4, 5, 18, 0, 0, 0, time.Local)),
			Ubicacion:   sp("Polideportivo Sinaloa"), Ciudad: sp("Culiacán"),
			CapacidadMaxima: ip(200), RequiereRegistro: true, Status: "finalizado",
			Descripcion: sp("Torneo de artes marciales con participación de dojos de Sinaloa."),
		},
		{
			IDOrganizador: adminUser.IDUser,
			Titulo:        "Kodomo no Hi 2025", TipoEvento: "cultural",
			FechaInicio: time.Date(2025, 5, 5, 11, 0, 0, 0, time.Local),
			FechaFin:    tp(time.Date(2025, 5, 5, 17, 0, 0, 0, time.Local)),
			Ubicacion:   sp("Jardín Nikkei"), Ciudad: sp("Culiacán"),
			CapacidadMaxima: ip(250), RequiereRegistro: true, Status: "finalizado",
			Descripcion: sp("Día del niño japonés, actividades para toda la familia."),
		},
		{
			IDOrganizador: adminUser.IDUser,
			Titulo:        "Matsuri de Otoño 2025", TipoEvento: "matsuri",
			FechaInicio: time.Date(2025, 10, 18, 16, 0, 0, 0, time.Local),
			FechaFin:    tp(time.Date(2025, 10, 18, 21, 0, 0, 0, time.Local)),
			Ubicacion:   sp("Plaza Mayor"), Ciudad: sp("Culiacán"),
			CapacidadMaxima: ip(400), RequiereRegistro: true, Status: "finalizado",
			Descripcion: sp("Festival de otoño con gastronomía japonesa y espectáculos tradicionales."),
		},
		{
			IDOrganizador: adminUser.IDUser,
			Titulo:        "Foro Empresarial Nikkei 2025", TipoEvento: "empresarial",
			FechaInicio: time.Date(2025, 11, 22, 9, 0, 0, 0, time.Local),
			FechaFin:    tp(time.Date(2025, 11, 22, 14, 0, 0, 0, time.Local)),
			Ubicacion:   sp("Hotel Lucerna"), Ciudad: sp("Culiacán"),
			CapacidadMaxima: ip(100), RequiereRegistro: true, Status: "finalizado",
			Descripcion: sp("Encuentro de empresarios Nikkei de Sinaloa."),
		},
		{
			IDOrganizador: adminUser.IDUser,
			Titulo:        "Ceremonia de Año Nuevo Japonés 2026", TipoEvento: "ceremonia",
			FechaInicio: time.Date(2026, 1, 11, 18, 0, 0, 0, time.Local),
			FechaFin:    tp(time.Date(2026, 1, 11, 21, 0, 0, 0, time.Local)),
			Ubicacion:   sp("Salón Nikkei"), Ciudad: sp("Culiacán"),
			CapacidadMaxima: ip(120), RequiereRegistro: true, Status: "finalizado",
			Descripcion: sp("Celebración del Oshōgatsu con ceremonias tradicionales."),
		},
		{
			IDOrganizador: adminUser.IDUser,
			Titulo:        "Taller de Origami y Caligrafía", TipoEvento: "cultural",
			FechaInicio: time.Date(2026, 3, 14, 10, 0, 0, 0, time.Local),
			FechaFin:    tp(time.Date(2026, 3, 14, 13, 0, 0, 0, time.Local)),
			Ubicacion:   sp("Biblioteca Pública"), Ciudad: sp("Culiacán"),
			CapacidadMaxima: ip(60), RequiereRegistro: true, Status: "finalizado",
			Descripcion: sp("Taller de artes tradicionales japonesas abierto a toda la comunidad."),
		},
		{
			IDOrganizador: adminUser.IDUser,
			Titulo:        "Kodomo no Hi 2026", TipoEvento: "cultural",
			FechaInicio: time.Date(2026, 4, 30, 11, 0, 0, 0, time.Local),
			FechaFin:    tp(time.Date(2026, 4, 30, 17, 0, 0, 0, time.Local)),
			Ubicacion:   sp("Jardín Nikkei"), Ciudad: sp("Culiacán"),
			CapacidadMaxima: ip(300), RequiereRegistro: true, Status: "finalizado",
			Descripcion: sp("Día del niño japonés 2026, edición especial con invitados de Japón."),
		},
		// Próximos
		{
			IDOrganizador: adminUser.IDUser,
			Titulo:        "Obon 2026", TipoEvento: "matsuri",
			FechaInicio: time.Date(2026, 8, 13, 17, 0, 0, 0, time.Local),
			FechaFin:    tp(time.Date(2026, 8, 15, 20, 0, 0, 0, time.Local)),
			Ubicacion:   sp("Panteón Jardines del Humaya"), Ciudad: sp("Culiacán"),
			CapacidadMaxima: ip(500), RequiereRegistro: false, Status: "publicado",
			Descripcion: sp("Festival budista de los ancestros, tres días de ceremonias y danzas Bon Odori."),
		},
		{
			IDOrganizador: adminUser.IDUser,
			Titulo:        "Encuentro Deportivo Nikkei", TipoEvento: "deportivo",
			FechaInicio: time.Date(2026, 9, 20, 8, 0, 0, 0, time.Local),
			FechaFin:    tp(time.Date(2026, 9, 20, 17, 0, 0, 0, time.Local)),
			Ubicacion:   sp("Unidad Deportiva Culiacán"), Ciudad: sp("Culiacán"),
			CapacidadMaxima: ip(180), RequiereRegistro: true, Status: "publicado",
			Descripcion: sp("Competencias de judo, kendo y béisbol entre familias Nikkei de Sinaloa."),
		},
		{
			IDOrganizador: adminUser.IDUser,
			Titulo:        "Matsuri de Invierno 2026", TipoEvento: "matsuri",
			FechaInicio: time.Date(2026, 12, 6, 17, 0, 0, 0, time.Local),
			FechaFin:    tp(time.Date(2026, 12, 6, 22, 0, 0, 0, time.Local)),
			Ubicacion:   sp("Explanada del IMSS"), Ciudad: sp("Culiacán"),
			CapacidadMaxima: ip(600), RequiereRegistro: false, Status: "publicado",
			Descripcion: sp("Gran festival de invierno con gastronomía japonesa, danzas y espectáculos."),
		},
	}
	db.Create(&eventos)
	log.Printf("  ✓ %d eventos creados", len(eventos))

	// ── Participaciones ───────────────────────────────────────────────────────
	// Distribuir personas en eventos pasados con números realistas
	asistenciasEsperadas := []int{85, 60, 18, 95, 140, 180, 55, 70, 35, 160}

	for eIdx, evento := range eventos {
		if evento.Status != "finalizado" {
			continue
		}
		esperados := asistenciasEsperadas[eIdx]
		registrosNikkei := esperados / 5 // ~20% son miembros registrados
		if registrosNikkei > len(personas) {
			registrosNikkei = len(personas)
		}

		// Participaciones de personas registradas
		perm := rand.Perm(len(personas))
		insertados := 0
		for _, idx := range perm {
			if insertados >= registrosNikkei {
				break
			}
			p := personas[idx]
			acomp := rand.Intn(4)
			part := models.ParticipacionEvento{
				IDPersona:     p.IDPersona,
				IDEvento:      evento.IDEvento,
				Acompaniantes: acomp,
			}
			if err := db.Create(&part).Error; err == nil {
				insertados++
			}
		}

		// Participaciones de visitantes anónimos (resto)
		visitantes := esperados - (registrosNikkei * 2)
		nombresVisitantes := []string{
			"Ana García", "Luis Pérez", "María López", "José Martínez",
			"Rosa Hernández", "Pedro Ramírez", "Carmen Flores", "Juan Torres",
			"Elena Morales", "Roberto Díaz", "Patricia Jiménez", "Miguel Ruiz",
			"Lucía Vargas", "Alejandro Castro", "Isabel Ramos", "Daniel Núñez",
		}
		for v := 0; v < visitantes && v < len(nombresVisitantes); v++ {
			nombre := nombresVisitantes[v%len(nombresVisitantes)]
			acomp := rand.Intn(3)
			db.Create(&models.ParticipacionEvento{
				IDEvento:        evento.IDEvento,
				NombreVisitante: sp(nombre),
				Acompaniantes:   acomp,
			})
		}
	}

	// Participaciones en eventos próximos (pre-registros)
	for _, evento := range eventos {
		if evento.Status != "publicado" {
			continue
		}
		registros := rand.Intn(15) + 5
		perm := rand.Perm(len(personas))
		insertados := 0
		for _, idx := range perm {
			if insertados >= registros {
				break
			}
			p := personas[idx]
			acomp := rand.Intn(3)
			part := models.ParticipacionEvento{
				IDPersona:     p.IDPersona,
				IDEvento:      evento.IDEvento,
				Acompaniantes: acomp,
			}
			if err := db.Create(&part).Error; err == nil {
				insertados++
			}
		}
	}
	log.Println("  ✓ Participaciones creadas")

	// ── Fechas de ingreso distribuidas en el tiempo ───────────────────────────
	// Actualizar fechas de ingreso para que el gráfico de incorporaciones
	// muestre datos en distintos meses (no todos en el mismo mes)
	mesesAtras := []int{23, 21, 20, 18, 17, 15, 14, 13, 11, 10, 9, 8, 6, 5, 4, 3, 3, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0}
	for i, p := range personas {
		meses := mesesAtras[i%len(mesesAtras)]
		dias := rand.Intn(25) + 1
		fecha := now.AddDate(0, -meses, -dias)
		db.Model(&models.Persona{}).
			Where("id_persona = ?", p.IDPersona).
			Update("fecha_ingreso_asociacion", fecha)
	}
	log.Println("  ✓ Fechas de incorporación distribuidas")

	// ── Fechas de creación de usuarios distribuidas ───────────────────────────
	// (para el gráfico de crecimiento de usuarios)
	// No podemos actualizar created_at con GORM fácilmente, usamos raw
	for i, p := range personas {
		meses := mesesAtras[i%len(mesesAtras)]
		dias := rand.Intn(25) + 1
		fecha := now.AddDate(0, -meses, -dias)
		db.Exec(`UPDATE users SET created_at = ? WHERE id_persona = ?`, fecha, p.IDPersona)
	}
	log.Println("  ✓ Fechas de usuarios distribuidas")

	// ── Empresas ──────────────────────────────────────────────────────────────
	aprobada := "aprobada"
	empresas := []models.Empresa{
		{
			IDPropietario: &personas[3].IDPersona,
			NombreEmpresa: "Tanaka Distribuciones", GiroComercial: sp("Transporte y Logística"),
			Sector: sp("Comercio"), Ciudad: sp("Culiacán"), Estado: "Sinaloa",
			Descripcion: sp("Empresa familiar fundada en 1978, especializada en distribución de productos de consumo en el norte de Sinaloa."),
			Telefono:    sp("6671234567"), Email: sp("contacto@tanakadist.com"),
			NumeroEmpleados: ip(45), StatusAprobacion: &aprobada,
			AceptaPromocionDirectorio: true, EnHomepage: true, OrdenHomepage: 1,
			FechaFundacion:     tp(time.Date(1978, 3, 15, 0, 0, 0, 0, time.Local)),
			ServiciosProductos: sp("Distribución mayorista, logística de última milla, almacenamiento."),
		},
		{
			IDPropietario: &personas[5].IDPersona,
			NombreEmpresa: "Yamamoto Agro", GiroComercial: sp("Otro"),
			Sector: sp("Agricultura"), Ciudad: sp("Culiacán"), Estado: "Sinaloa",
			Descripcion: sp("Empresa agroindustrial dedicada al cultivo y exportación de hortalizas sinaloenses desde 1982."),
			Telefono:    sp("6679876543"), Email: sp("info@yamamotoagro.mx"),
			SitioWeb:        sp("https://yamamotoagro.mx"),
			NumeroEmpleados: ip(120), StatusAprobacion: &aprobada,
			AceptaPromocionDirectorio: true, EnHomepage: true, OrdenHomepage: 2,
			FechaFundacion:     tp(time.Date(1982, 6, 1, 0, 0, 0, 0, time.Local)),
			ServiciosProductos: sp("Cultivo de tomate, pepino y chile. Exportación a Estados Unidos y Canadá."),
		},
		{
			IDPropietario: &personas[11].IDPersona,
			NombreEmpresa: "Ito Estudio Dental", GiroComercial: sp("Salud y Bienestar"),
			Sector: sp("Servicios de salud"), Ciudad: sp("Culiacán"), Estado: "Sinaloa",
			Descripcion: sp("Clínica dental familiar con más de 20 años de experiencia, especializada en ortodoncia y estética dental."),
			Telefono:    sp("6674561234"), Email: sp("citas@itoestudio.com"),
			NumeroEmpleados: ip(8), StatusAprobacion: &aprobada,
			AceptaPromocionDirectorio: true, EnHomepage: true, OrdenHomepage: 3,
			FechaFundacion:     tp(time.Date(2001, 9, 10, 0, 0, 0, 0, time.Local)),
			ServiciosProductos: sp("Ortodoncia, implantes dentales, blanqueamiento, odontopediatría."),
		},
		{
			IDPropietario: &personas[8].IDPersona,
			NombreEmpresa: "CKT Tecnología", GiroComercial: sp("Tecnología"),
			Sector: sp("Tecnología"), Ciudad: sp("Culiacán"), Estado: "Sinaloa",
			Descripcion: sp("Empresa de desarrollo de software y consultoría tecnológica enfocada en soluciones para el sector agrícola sinaloense."),
			Telefono:    sp("6672345678"), Email: sp("hola@ckttech.mx"),
			SitioWeb:        sp("https://ckttech.mx"),
			NumeroEmpleados: ip(15), StatusAprobacion: &aprobada,
			AceptaPromocionDirectorio: true, EnHomepage: true, OrdenHomepage: 4,
			FechaFundacion:     tp(time.Date(2015, 1, 20, 0, 0, 0, 0, time.Local)),
			ServiciosProductos: sp("Desarrollo de software a medida, apps móviles, consultoría ERP, soporte técnico."),
		},
		{
			IDPropietario: &personas[12].IDPersona,
			NombreEmpresa: "Kobayashi Construcciones", GiroComercial: sp("Construcción"),
			Sector: sp("Construcción"), Ciudad: sp("Guasave"), Estado: "Sinaloa",
			Descripcion: sp("Constructora familiar con presencia en el norte de Sinaloa, especializada en obra civil y desarrollos habitacionales."),
			Telefono:    sp("6876543210"), Email: sp("obra@kobayashiconstruye.mx"),
			NumeroEmpleados: ip(60), StatusAprobacion: &aprobada,
			AceptaPromocionDirectorio: true, EnHomepage: true, OrdenHomepage: 5,
			FechaFundacion:     tp(time.Date(1995, 4, 5, 0, 0, 0, 0, time.Local)),
			ServiciosProductos: sp("Obra civil, desarrollos habitacionales, remodelaciones, supervisión de proyectos."),
		},
		{
			IDPropietario: &personas[15].IDPersona,
			NombreEmpresa: "Ryu Fitness", GiroComercial: sp("Salud y Bienestar"),
			Sector: sp("Servicios"), Ciudad: sp("Culiacán"), Estado: "Sinaloa",
			Descripcion: sp("Gimnasio y centro de artes marciales japonesas. Clases de kendo, judo y acondicionamiento físico."),
			Telefono:    sp("6671112233"), Email: sp("entrena@ryufitness.mx"),
			NumeroEmpleados: ip(6), StatusAprobacion: &aprobada,
			AceptaPromocionDirectorio: true, EnHomepage: false,
			FechaFundacion:     tp(time.Date(2020, 2, 14, 0, 0, 0, 0, time.Local)),
			ServiciosProductos: sp("Kendo, judo, acondicionamiento físico, clases grupales e individuales."),
		},
		{
			IDPropietario: &personas[4].IDPersona,
			NombreEmpresa: "Sato Importaciones", GiroComercial: sp("Comercio"),
			Sector: sp("Comercio"), Ciudad: sp("Mazatlán"), Estado: "Sinaloa",
			Descripcion: sp("Empresa importadora de productos japoneses: alimentación, artículos del hogar y papelería."),
			Telefono:    sp("6693334455"), Email: sp("ventas@satoimport.mx"),
			NumeroEmpleados: ip(12), StatusAprobacion: &aprobada,
			AceptaPromocionDirectorio: true, EnHomepage: false,
			FechaFundacion:     tp(time.Date(1990, 11, 3, 0, 0, 0, 0, time.Local)),
			ServiciosProductos: sp("Importación de alimentos japoneses, utensilios, papelería y artículos culturales."),
		},
		{
			IDPropietario: &personas[9].IDPersona,
			NombreEmpresa: "Midori Diseño", GiroComercial: sp("Arte y Cultura"),
			Sector: sp("Servicios creativos"), Ciudad: sp("Culiacán"), Estado: "Sinaloa",
			Descripcion: sp("Estudio de diseño gráfico y branding con enfoque en identidades visuales para empresas sinaloenses."),
			Telefono:    sp("6675556677"), Email: sp("hola@midoridiseno.mx"),
			SitioWeb:        sp("https://midoridiseno.mx"),
			NumeroEmpleados: ip(4), StatusAprobacion: &aprobada,
			AceptaPromocionDirectorio: true, EnHomepage: false,
			FechaFundacion:     tp(time.Date(2018, 8, 22, 0, 0, 0, 0, time.Local)),
			ServiciosProductos: sp("Branding, diseño de logotipos, material publicitario, diseño web, fotografía de producto."),
		},
	}
	db.Create(&empresas)
	log.Printf("  ✓ %d empresas creadas", len(empresas))

	log.Println("✅ Demo seeder completado exitosamente")
}
