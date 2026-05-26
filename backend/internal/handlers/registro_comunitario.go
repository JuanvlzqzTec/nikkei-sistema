package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/middleware"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RegistroComunitarioHandler struct{}

func NewRegistroComunitarioHandler() *RegistroComunitarioHandler {
	return &RegistroComunitarioHandler{}
}

// Estructura para los datos de una familia nueva (cuando el usuario elige "Mi familia no aparece")
type NuevaFamiliaRequest struct {
	ApellidoJP        string  `json:"apellido_jp" binding:"required,max=100"`
	ApellidoRomanji   *string `json:"apellido_romanji"`
	ApellidoKanji     *string `json:"apellido_kanji"`
	PrefecturaOrigen  *string `json:"prefectura_origen"`
	AnioLlegadaMexico *int    `json:"anio_llegada_mexico"`
	LugarLlegada      *string `json:"lugar_llegada"`
}

type RegistroComunitarioRequest struct {
	// Paso 1
	Nombres         string  `json:"nombres" binding:"required,max=150"`
	ApellidoPaterno string  `json:"apellido_paterno" binding:"required,max=100"`
	ApellidoMaterno *string `json:"apellido_materno"`
	NombreJapones   *string `json:"nombre_japones"`
	NombreKanji     *string `json:"nombre_kanji"`

	// Paso 2
	Generacion   string               `json:"generacion" binding:"required,oneof=issei nisei sansei yonsei gosei roksei"`
	IDFamilia    *uint                `json:"id_familia"`    // null si crea nueva
	NuevaFamilia *NuevaFamiliaRequest `json:"nueva_familia"` // datos si crea nueva

	// Paso 3
	FechaNacimiento *string `json:"fecha_nacimiento" binding:"required"`
	Genero          string  `json:"genero" binding:"required,oneof=masculino femenino otro prefiero_no_decir"`
	LugarNacimiento *string `json:"lugar_nacimiento"`

	// Paso 4
	TelefonoPrincipal string  `json:"telefono_principal" binding:"required,max=20"`
	Ciudad            *string `json:"ciudad"`
	Estado            string  `json:"estado"`

	// Paso 5
	NivelJapones            *string `json:"nivel_japones"`
	AceptaDirectorioPublico bool    `json:"acepta_directorio_publico"`
	AceptaComunicaciones    bool    `json:"acepta_comunicaciones"`
}

func (h *RegistroComunitarioHandler) CrearRegistro(c *gin.Context) {
	userID, _, _, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No autenticado"})
		return
	}

	var req RegistroComunitarioRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	// Validar que envíe o familia existente o datos de nueva familia
	if req.IDFamilia == nil && req.NuevaFamilia == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Debes seleccionar una familia o registrar una nueva"})
		return
	}

	// Verificar que el usuario no haya completado ya su registro
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}
	if user.IDPersona != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Ya completaste tu registro comunitario"})
		return
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		var idFamiliaFinal uint
		if req.NuevaFamilia != nil {
			nuevaFamilia := models.Familia{
				ApellidoJP:          req.NuevaFamilia.ApellidoJP,
				ApellidoRomanji:     req.NuevaFamilia.ApellidoRomanji,
				ApellidoKanji:       req.NuevaFamilia.ApellidoKanji,
				PrefecturaOrigen:    req.NuevaFamilia.PrefecturaOrigen,
				AnioLlegadaMexico:   req.NuevaFamilia.AnioLlegadaMexico,
				LugarLlegada:        req.NuevaFamilia.LugarLlegada,
				PendienteAprobacion: true,
			}
			if err := tx.Create(&nuevaFamilia).Error; err != nil {
				return err
			}
			idFamiliaFinal = nuevaFamilia.IDFamilia
		} else {
			var fam models.Familia
			if err := tx.First(&fam, *req.IDFamilia).Error; err != nil {
				return errors.New("la familia seleccionada no existe")
			}
			if fam.PendienteAprobacion {
				return errors.New("no puedes registrarte en una familia que aún no ha sido aprobada")
			}
			idFamiliaFinal = fam.IDFamilia
		}

		var fechaNac *time.Time
		if req.FechaNacimiento != nil && *req.FechaNacimiento != "" {
			f, err := time.Parse("2006-01-02", *req.FechaNacimiento)
			if err != nil {
				return errors.New("formato de fecha inválido (usa YYYY-MM-DD)")
			}
			fechaNac = &f
		}

		// Estado por defecto si no se envía
		estado := "Sinaloa"
		if req.Estado != "" {
			estado = req.Estado
		}

		persona := models.Persona{
			IDFamilia:               idFamiliaFinal,
			Nombres:                 req.Nombres,
			ApellidoPaterno:         req.ApellidoPaterno,
			ApellidoMaterno:         req.ApellidoMaterno,
			NombreJapones:           req.NombreJapones,
			NombreKanji:             req.NombreKanji,
			Genero:                  &req.Genero,
			FechaNacimiento:         fechaNac,
			LugarNacimiento:         req.LugarNacimiento,
			Generacion:              req.Generacion,
			TelefonoPrincipal:       &req.TelefonoPrincipal,
			Ciudad:                  req.Ciudad,
			Estado:                  estado,
			NivelJapones:            req.NivelJapones,
			AceptaDirectorioPublico: req.AceptaDirectorioPublico,
			AceptaComunicaciones:    req.AceptaComunicaciones,
			EsMiembroActivo:         false, // queda inactivo hasta aprobación
		}
		if err := tx.Create(&persona).Error; err != nil {
			return err
		}

		// Asociar el user con la persona y actualizar estado del registro
		motivoNuevo := "nuevo_registro"
		if err := tx.Model(&user).Updates(map[string]interface{}{
			"id_persona":       persona.IDPersona,
			"registro_estado":  "pendiente_revision",
			"motivo_pendiente": motivoNuevo,
		}).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Registro enviado exitosamente. Un administrador lo revisará pronto.",
	})
}

func (h *RegistroComunitarioHandler) MiEstado(c *gin.Context) {
	userID, _, _, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No autenticado"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"registro_estado": user.RegistroEstado,
		"tiene_persona":   user.IDPersona != nil,
		"role":            user.Role,
	})
}

func (h *RegistroComunitarioHandler) GetPendientes(c *gin.Context) {
	type PendienteResponse struct {
		IDUser          uint           `json:"id_user"`
		Email           string         `json:"email"`
		CreatedAt       time.Time      `json:"created_at"`
		MotivoPendiente *string        `json:"motivo_pendiente"`
		Persona         models.Persona `json:"persona"`
		Familia         models.Familia `json:"familia"`
		FamiliaEsNueva  bool           `json:"familia_es_nueva"`
	}

	var users []models.User
	if err := database.DB.
		Where("registro_estado = ? AND id_persona IS NOT NULL", "pendiente_revision").
		Order("updated_at DESC").
		Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener pendientes"})
		return
	}

	resultado := make([]PendienteResponse, 0, len(users))
	for _, u := range users {
		var persona models.Persona
		if err := database.DB.First(&persona, *u.IDPersona).Error; err != nil {
			continue
		}
		var familia models.Familia
		if err := database.DB.First(&familia, persona.IDFamilia).Error; err != nil {
			continue
		}

		resultado = append(resultado, PendienteResponse{
			IDUser:          u.IDUser,
			Email:           u.Email,
			CreatedAt:       u.UpdatedAt,
			MotivoPendiente: u.MotivoPendiente,
			Persona:         persona,
			Familia:         familia,
			FamiliaEsNueva:  familia.PendienteAprobacion,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Pendientes obtenidos",
		"data":    resultado,
		"count":   len(resultado),
	})
}

func (h *RegistroComunitarioHandler) Aprobar(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	err = database.DB.Transaction(func(tx *gorm.DB) error {
		var user models.User
		if err := tx.First(&user, userID).Error; err != nil {
			return errors.New("usuario no encontrado")
		}
		if user.IDPersona == nil {
			return errors.New("este usuario no tiene un registro comunitario")
		}

		// Activar persona y registrar fecha de ingreso
		now := time.Now()
		if err := tx.Model(&models.Persona{}).
			Where("id_persona = ?", *user.IDPersona).
			Updates(map[string]interface{}{
				"es_miembro_activo":        true,
				"fecha_ingreso_asociacion": now,
			}).Error; err != nil {
			return err
		}

		// Aprobar la familia si estaba pendiente
		var persona models.Persona
		if err := tx.First(&persona, *user.IDPersona).Error; err != nil {
			return err
		}
		if err := tx.Model(&models.Familia{}).
			Where("id_familia = ? AND pendiente_aprobacion = true", persona.IDFamilia).
			Update("pendiente_aprobacion", false).Error; err != nil {
			return err
		}

		// Actualizar user: rol miembro + estado completado + limpiar motivo
		if err := tx.Model(&user).Updates(map[string]interface{}{
			"role":             "miembro",
			"registro_estado":  "completado",
			"motivo_pendiente": nil,
		}).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registro aprobado exitosamente"})
}

// Rechazar (admin) — rechaza un registro pendiente
func (h *RegistroComunitarioHandler) Rechazar(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Motivo *string `json:"motivo"`
	}
	_ = c.ShouldBindJSON(&req)

	result := database.DB.Model(&models.User{}).
		Where("id_user = ?", userID).
		Updates(map[string]interface{}{
			"registro_estado": "rechazado",
		})

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al rechazar"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registro rechazado"})
}
