# Sistema Nikkei Sinaloa

Sistema integral de registro y gestión comunitaria para la Asociación Nikkei de Sinaloa. Una plataforma moderna que preserva la historia, conecta generaciones y fortalece los lazos de la comunidad japonesa en México.

## Descripción del Proyecto

El Sistema Nikkei es una plataforma web completa diseñada para:

- **Registro Comunitario**: Sistema de registro genealógico multi-generacional
- **Árboles Genealógicos**: Visualización interactiva de conexiones familiares  
- **Dashboard Administrativo**: Reportes y estadísticas detalladas
- **Gestión de Eventos**: Organización y seguimiento de actividades culturales
- **Archivo Histórico**: Preservación digital de fotografías y documentos
- **Mapas Genealógicos**: Visualización geográfica de distribución familiar

## Stack Tecnológico

### Frontend
- **Next.js 15** con App Router
- **TypeScript** para type safety
- **Tailwind CSS + Shadcn/ui** para estilos modernos
- **Zustand** para gestión de estado
- **TanStack Query** para server state management
- **React Hook Form + Zod** para formularios validados
- **Framer Motion** para animaciones fluidas
- **Leaflet** para mapas interactivos

### Backend
- **Go 1.25+** como runtime principal
- **Gin** como framework HTTP
- **GORM** como ORM
- **PostgreSQL** como base de datos principal
- **Redis** para caché y sesiones
- **JWT** para autenticación segura
- **Bcrypt** para hash de contraseñas
- **Cloudinary** para gestión de imágenes

### DevOps & Herramientas
- **Docker + Docker Compose** para containerización
- **Air** para live reload en desarrollo
- **Makefile** para automatización de comandos
- **PostgreSQL** con connection pooling
- **Redis** para caché distribuido

## Características Principales

### Para la Comunidad
- Registro familiar multi-generacional (Issei → Gosei)
- Directorio comunitario con búsqueda avanzada
- Eventos culturales y notificaciones
- Preservación de historias familiares
- Conexión entre familias Nikkei

### Para Administradores
- Dashboard con estadísticas completas
- Gestión de membresías y cuotas
- Reportes demográficos y genealógicos
- Herramientas de comunicación
- Análisis de participación en eventos

### Funcionalidades Técnicas
- Autenticación JWT segura
- API RESTful documentada
- Responsive design (móvil primero)
- Búsqueda en tiempo real
- Upload y gestión de imágenes
- Exportación de reportes (PDF, Excel)

## Autor

- **Desarrollador**: Juan Antonio Velázquez Alarcón
- **Cliente**: Asociación Nikkei de Sinaloa
- **Propósito**: Servicio Social - Ingeniería en Sistemas Computacionales

---

<div align="center">

**Preservando el pasado, conectando el presente, construyendo el futuro**

*Sistema desarrollado con cariño para la comunidad Nikkei de Sinaloa*

</div>