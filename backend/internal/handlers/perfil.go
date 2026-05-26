package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/database"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/middleware"
	"github.com/JuanvlzqzTec/nikkei-sistema/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PerfilHandler struct{}

func NewPerfilHandler() *PerfilHandler {
	return &PerfilHandler{}
}

type FamiliaResumen struct {
	IDFamilia     uint    `json:"id_familia"`
	ApellidoJP    string  `json:"apellido_jp"`
	ApellidoKanji *string `json:"apellido_kanji"`
}

type EmpleoResumen struct {
	IDEmpresaEmpleadora uint    `json:"id_empresa_empleadora"`
	NombreEmpresa       string  `json:"nombre_empresa"`
	Ciudad              *string `json:"ciudad"`
	Estado              *string `json:"estado"`
}

type MiPerfilResponse struct {
	Email           string         `json:"email"`
	RegistroEstado  string         `json:"registro_estado"`
	MotivoPendiente *string        `json:"motivo_pendiente"`
	Persona         models.Persona `json:"persona"`
	Familia         FamiliaResumen `json:"familia"`
	Empleo          *EmpleoResumen `json:"empleo"`
}

func (h *PerfilHandler) GetMiPerfil(c *gin.Context) {
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
	if user.IDPersona == nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error":   "Registro no completado",
			"message": "Debes completar tu registro comunitario primero",
		})
		return
	}

	var persona models.Persona
	if err := database.DB.First(&persona, *user.IDPersona).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Datos de persona no encontrados"})
		return
	}

	var familia models.Familia
	if err := database.DB.First(&familia, persona.IDFamilia).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener familia"})
		return
	}

	resp := MiPerfilResponse{
		Email:           user.Email,
		RegistroEstado:  user.RegistroEstado,
		MotivoPendiente: user.MotivoPendiente,
		Persona:         persona,
		Familia: FamiliaResumen{
			IDFamilia:     familia.IDFamilia,
			ApellidoJP:    familia.ApellidoJP,
			ApellidoKanji: familia.ApellidoKanji,
		},
	}

	// Empleo (opcional)
	if persona.IDEmpresaEmpleadora != nil {
		var empleadora models.EmpresaEmpleadora
		if err := database.DB.First(&empleadora, *persona.IDEmpresaEmpleadora).Error; err == nil {
			resp.Empleo = &EmpleoResumen{
				IDEmpresaEmpleadora: empleadora.IDEmpresaEmpleadora,
				NombreEmpresa:       empleadora.NombreEmpresa,
				Ciudad:              empleadora.Ciudad,
				Estado:              empleadora.Estado,
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Perfil obtenido exitosamente",
		"data":    resp,
	})
}

// Datos libres

type UpdateDatosLibresRequest struct {
	TelefonoPrincipal       *string `json:"telefono_principal"`
	TelefonoAlternativo     *string `json:"telefono_alternativo"`
	EmailPersonal           *string `json:"email_personal"`
	DireccionCompleta       *string `json:"direccion_completa"`
	Ciudad                  *string `json:"ciudad"`
	Estado                  *string `json:"estado"`
	CodigoPostal            *string `json:"codigo_postal"`
	EstadoCivil             *string `json:"estado_civil"`
	NivelJapones            *string `json:"nivel_japones"`
	AceptaDirectorioPublico *bool   `json:"acepta_directorio_publico"`
	AceptaComunicaciones    *bool   `json:"acepta_comunicaciones"`
	ParticipaEventos        *bool   `json:"participa_eventos"`
}

func (h *PerfilHandler) UpdateDatosLibres(c *gin.Context) {
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
	if user.IDPersona == nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error":   "Registro no completado",
			"message": "Debes completar tu registro comunitario primero",
		})
		return
	}

	var req UpdateDatosLibresRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	updates := map[string]interface{}{}

	if req.TelefonoPrincipal != nil {
		v := strings.TrimSpace(*req.TelefonoPrincipal)
		if v == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "El teléfono principal no puede quedar vacío"})
			return
		}
		updates["telefono_principal"] = v
	}
	if req.TelefonoAlternativo != nil {
		v := strings.TrimSpace(*req.TelefonoAlternativo)
		if v == "" {
			updates["telefono_alternativo"] = nil
		} else {
			updates["telefono_alternativo"] = v
		}
	}
	if req.EmailPersonal != nil {
		v := strings.TrimSpace(*req.EmailPersonal)
		if v == "" {
			updates["email_personal"] = nil
		} else {
			updates["email_personal"] = v
		}
	}
	if req.DireccionCompleta != nil {
		v := strings.TrimSpace(*req.DireccionCompleta)
		if v == "" {
			updates["direccion_completa"] = nil
		} else {
			updates["direccion_completa"] = v
		}
	}
	if req.Ciudad != nil {
		v := strings.TrimSpace(*req.Ciudad)
		if v == "" {
			updates["ciudad"] = nil
		} else {
			updates["ciudad"] = v
		}
	}
	if req.Estado != nil {
		v := strings.TrimSpace(*req.Estado)
		if v == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "El estado es requerido"})
			return
		}
		updates["estado"] = v
	}
	if req.CodigoPostal != nil {
		v := strings.TrimSpace(*req.CodigoPostal)
		if v == "" {
			updates["codigo_postal"] = nil
		} else {
			updates["codigo_postal"] = v
		}
	}
	if req.EstadoCivil != nil {
		v := strings.TrimSpace(*req.EstadoCivil)
		if v == "" {
			updates["estado_civil"] = nil
		} else {
			// Validar contra los valores permitidos por el check constraint
			validos := map[string]bool{
				"soltero": true, "casado": true, "divorciado": true,
				"viudo": true, "union_libre": true,
			}
			if !validos[v] {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Estado civil inválido"})
				return
			}
			updates["estado_civil"] = v
		}
	}
	if req.NivelJapones != nil {
		v := strings.TrimSpace(*req.NivelJapones)
		if v == "" {
			updates["nivel_japones"] = nil
		} else {
			validos := map[string]bool{
				"ninguno": true, "basico": true, "intermedio": true,
				"avanzado": true, "nativo": true,
			}
			if !validos[v] {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Nivel de japonés inválido"})
				return
			}
			updates["nivel_japones"] = v
		}
	}
	if req.AceptaDirectorioPublico != nil {
		updates["acepta_directorio_publico"] = *req.AceptaDirectorioPublico
	}
	if req.AceptaComunicaciones != nil {
		updates["acepta_comunicaciones"] = *req.AceptaComunicaciones
	}
	if req.ParticipaEventos != nil {
		updates["participa_eventos"] = *req.ParticipaEventos
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No enviaste ningún cambio"})
		return
	}

	if err := database.DB.Model(&models.Persona{}).
		Where("id_persona = ?", *user.IDPersona).
		Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar perfil"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Tu información se actualizó exitosamente",
	})
}

// Solicitar cambio

type SolicitarCambioRequest struct {
	Nombres         *string `json:"nombres"`
	ApellidoPaterno *string `json:"apellido_paterno"`
	ApellidoMaterno *string `json:"apellido_materno"`
	NombreJapones   *string `json:"nombre_japones"`
	NombreKanji     *string `json:"nombre_kanji"`
	FechaNacimiento *string `json:"fecha_nacimiento"`
	LugarNacimiento *string `json:"lugar_nacimiento"`
	Genero          *string `json:"genero"`
	Generacion      *string `json:"generacion"`
	IDFamilia       *uint   `json:"id_familia"`
}

func (h *PerfilHandler) SolicitarCambio(c *gin.Context) {
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
	if user.IDPersona == nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error":   "Registro no completado",
			"message": "Debes completar tu registro comunitario primero",
		})
		return
	}

	// Solo miembros con registro completado pueden solicitar cambios.
	if user.RegistroEstado != "completado" {
		c.JSON(http.StatusConflict, gin.H{
			"error":   "Tu registro no está en un estado que permita cambios",
			"message": "Espera a que tu solicitud actual sea revisada por un administrador",
		})
		return
	}

	var req SolicitarCambioRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	updates := map[string]interface{}{}

	if req.Nombres != nil {
		v := strings.TrimSpace(*req.Nombres)
		if v == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Los nombres no pueden quedar vacíos"})
			return
		}
		updates["nombres"] = v
	}
	if req.ApellidoPaterno != nil {
		v := strings.TrimSpace(*req.ApellidoPaterno)
		if v == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "El apellido paterno no puede quedar vacío"})
			return
		}
		updates["apellido_paterno"] = v
	}
	if req.ApellidoMaterno != nil {
		v := strings.TrimSpace(*req.ApellidoMaterno)
		if v == "" {
			updates["apellido_materno"] = nil
		} else {
			updates["apellido_materno"] = v
		}
	}
	if req.NombreJapones != nil {
		v := strings.TrimSpace(*req.NombreJapones)
		if v == "" {
			updates["nombre_japones"] = nil
		} else {
			updates["nombre_japones"] = v
		}
	}
	if req.NombreKanji != nil {
		v := strings.TrimSpace(*req.NombreKanji)
		if v == "" {
			updates["nombre_kanji"] = nil
		} else {
			updates["nombre_kanji"] = v
		}
	}
	if req.FechaNacimiento != nil {
		v := strings.TrimSpace(*req.FechaNacimiento)
		if v == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "La fecha de nacimiento no puede quedar vacía"})
			return
		}
		fecha, err := time.Parse("2006-01-02", v)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de fecha inválido (usa YYYY-MM-DD)"})
			return
		}
		updates["fecha_nacimiento"] = fecha
	}
	if req.LugarNacimiento != nil {
		v := strings.TrimSpace(*req.LugarNacimiento)
		if v == "" {
			updates["lugar_nacimiento"] = nil
		} else {
			updates["lugar_nacimiento"] = v
		}
	}
	if req.Genero != nil {
		v := strings.TrimSpace(*req.Genero)
		validos := map[string]bool{
			"masculino": true, "femenino": true,
			"otro": true, "prefiero_no_decir": true,
		}
		if !validos[v] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Género inválido"})
			return
		}
		updates["genero"] = v
	}
	if req.Generacion != nil {
		v := strings.TrimSpace(*req.Generacion)
		validos := map[string]bool{
			"issei": true, "nisei": true, "sansei": true,
			"yonsei": true, "gosei": true, "roksei": true,
		}
		if !validos[v] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Generación inválida"})
			return
		}
		updates["generacion"] = v
	}
	if req.IDFamilia != nil {
		// Solo familias existentes Y aprobadas
		var familia models.Familia
		if err := database.DB.First(&familia, *req.IDFamilia).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "La familia seleccionada no existe"})
			return
		}
		if familia.PendienteAprobacion {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "No puedes cambiarte a una familia que aún no ha sido aprobada",
			})
			return
		}
		updates["id_familia"] = *req.IDFamilia
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No enviaste ningún cambio"})
		return
	}

	// Transacción: actualiza Persona + cambia estado del User + desactiva al miembro
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Actualizar Persona con los campos sensibles
		if err := tx.Model(&models.Persona{}).
			Where("id_persona = ?", *user.IDPersona).
			Updates(updates).Error; err != nil {
			return err
		}

		// 2. Desactivar al miembro hasta que admin re-apruebe
		if err := tx.Model(&models.Persona{}).
			Where("id_persona = ?", *user.IDPersona).
			Update("es_miembro_activo", false).Error; err != nil {
			return err
		}

		// 3. Cambiar estado del User a pendiente_revision con motivo cambio_solicitado
		motivo := "cambio_solicitado"
		if err := tx.Model(&user).Updates(map[string]interface{}{
			"registro_estado":  "pendiente_revision",
			"motivo_pendiente": motivo,
		}).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Error al solicitar el cambio",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Solicitud de cambio enviada. Un administrador revisará los cambios antes de aplicarlos.",
	})
}

// Actualizar foto

type UpdateFotoRequest struct {
	FotoPerfil *string `json:"foto_perfil"`
}

func (h *PerfilHandler) UpdateFoto(c *gin.Context) {
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
	if user.IDPersona == nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Registro no completado",
		})
		return
	}

	var req UpdateFotoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos: " + err.Error()})
		return
	}

	// Permitimos foto_perfil = "" o null para "quitar la foto"
	var nuevoValor interface{}
	if req.FotoPerfil == nil || strings.TrimSpace(*req.FotoPerfil) == "" {
		nuevoValor = nil
	} else {
		url := strings.TrimSpace(*req.FotoPerfil)
		// Validación mínima: que parezca una URL https (Cloudinary o similar)
		if !strings.HasPrefix(url, "https://") {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "La URL de la foto debe ser https",
			})
			return
		}
		nuevoValor = url
	}

	if err := database.DB.Model(&models.Persona{}).
		Where("id_persona = ?", *user.IDPersona).
		Update("foto_perfil", nuevoValor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar la foto"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Foto de perfil actualizada",
	})
}
