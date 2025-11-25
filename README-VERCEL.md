# 🗳️ Sistema de Elecciones Escolares - Vercel Edition

Sistema completo de votación electrónica para elecciones escolares, desplegable en Vercel con backend serverless.

## ✨ Características

- 🎨 **Frontend moderno** con Vue.js 3 y Vite
- ⚡ **Backend serverless** con Vercel Functions
- 🗄️ **Base de datos** Turso (LibSQL)
- 🔒 **Autenticación** por DNI para estudiantes
- 👨‍💼 **Panel de administración** completo
- 📊 **Resultados en tiempo real**
- 🖼️ **Integración con Cloudinary** para fotos de candidatos
- 📱 **Diseño responsive**

## 🏗️ Arquitectura

```
Frontend (Vue.js) + Backend (Serverless) → Todo en Vercel
                        ↓
                  Base de Datos (Turso)
```

## 📁 Estructura del Proyecto

```
fe-elecciones/
├── api/                      # Backend Serverless Functions
│   ├── _db.js               # Conexión compartida a Turso
│   ├── health.js            # Health check
│   ├── candidatos.js        # Obtener candidatos
│   ├── votar.js             # Registrar voto
│   ├── resultados.js        # Resultados de elecciones
│   ├── auth/                # Autenticación
│   │   ├── student.js       # Login estudiantes
│   │   └── admin.js         # Login admin
│   ├── admin/               # Panel de administración
│   │   ├── stats.js         # Estadísticas
│   │   ├── candidatos.js    # CRUD candidatos
│   │   └── votantes.js      # Lista de votantes
│   └── cloudinary/          # Integración Cloudinary
│       └── signature.js     # Firma para uploads
│
├── src/                     # Frontend Vue.js
│   ├── components/          # Componentes Vue
│   ├── router/              # Vue Router
│   └── assets/              # Imágenes y estilos
│
├── vercel.json              # Configuración de Vercel
├── vite.config.js           # Configuración de Vite
└── package.json             # Dependencias
```

## 🚀 Despliegue Rápido en Vercel

### 1. Clonar el repositorio

```bash
git clone https://github.com/ArvickJara/be-elecciones.git
cd be-elecciones
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables:

```
TURSO_DATABASE_URL=tu_url_de_turso
TURSO_AUTH_TOKEN=tu_token_de_turso
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_password_seguro
```

### 4. Desplegar

```bash
# Método 1: Conectar repositorio en vercel.com (recomendado)
# Ve a vercel.com, importa el repo y despliega

# Método 2: Usando Vercel CLI
npm i -g vercel
vercel
```

¡Listo! Tu aplicación estará en línea en minutos.

📖 **[Ver guía completa de despliegue](./DEPLOYMENT-VERCEL.md)**

## 💻 Desarrollo Local

### Requisitos

- Node.js 18+
- npm o yarn
- Cuenta en Turso con base de datos configurada

### Configuración

1. **Clonar e instalar**:
   ```bash
   git clone https://github.com/ArvickJara/be-elecciones.git
   cd be-elecciones
   npm install
   ```

2. **Configurar variables de entorno**:
   
   Crea un archivo `.env` en la raíz:
   ```
   TURSO_DATABASE_URL=libsql://tu-database.turso.io
   TURSO_AUTH_TOKEN=tu_token_aqui
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

3. **Iniciar el proyecto**:

   **Terminal 1 - Frontend**:
   ```bash
   npm run dev
   ```
   Abre: http://localhost:5173

   **Terminal 2 - Backend**:
   ```bash
   npm run server
   ```
   Backend en: http://localhost:3000

### Scripts Disponibles

```bash
npm run dev          # Inicia Vite dev server
npm run build        # Construye para producción
npm run preview      # Preview de producción
npm run server       # Inicia servidor Express (desarrollo)
```

## 🔧 Cómo Funciona

### En Desarrollo

El frontend (Vite) usa un proxy para redirigir `/api/*` al backend local:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:3000'
  }
}
```

### En Producción (Vercel)

Vercel enruta automáticamente:
- `/api/*` → Funciones serverless en `/api/`
- Todo lo demás → Frontend Vue.js

```javascript
// vercel.json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 📊 Endpoints del API

### Públicos

- `GET /api/health` - Health check
- `POST /api/auth/student` - Login estudiante
- `GET /api/candidatos` - Lista de candidatos
- `POST /api/votar` - Registrar voto

### Administración

- `POST /api/auth/admin` - Login admin
- `GET /api/admin/stats` - Estadísticas
- `GET /api/admin/candidatos` - Gestionar candidatos
- `POST /api/admin/candidatos` - Crear candidato
- `PUT /api/admin/candidatos` - Actualizar candidato
- `DELETE /api/admin/candidatos` - Eliminar candidato
- `GET /api/admin/votantes` - Lista de votantes
- `GET /api/resultados` - Resultados de elecciones

## 🗄️ Base de Datos

El proyecto usa **Turso** (LibSQL) como base de datos.

### Tablas Principales

- `estudiantes` - Datos de estudiantes
- `candidatos` - Candidatos a elecciones
- `votos` - Registro de votos
- `padron_matricula` - Padrón electoral
- `instituciones_educativas` - Colegios

Ver `db-setup.sql` para el esquema completo.

## 🔐 Seguridad

- ✅ Validación de DNI antes de votar
- ✅ Prevención de doble voto
- ✅ Autenticación de administrador
- ✅ Variables de entorno para credenciales
- ✅ CORS configurado
- ✅ SQL con parámetros preparados

## 📱 Interfaz de Usuario

### Vista de Estudiante

1. Login con DNI
2. Visualización de candidatos con fotos y propuestas
3. Selección de candidato
4. Confirmación de voto
5. Mensaje de éxito

### Panel de Administración

1. Dashboard con estadísticas
2. Gestión de candidatos (CRUD)
3. Lista de votantes
4. Resultados en tiempo real
5. Subida de fotos a Cloudinary

## 🎨 Tecnologías

### Frontend
- Vue.js 3
- Vue Router
- Vite
- CSS moderno

### Backend
- Vercel Serverless Functions
- Node.js
- Turso (LibSQL)

### Infraestructura
- Vercel (hosting + serverless)
- Turso (base de datos)
- Cloudinary (almacenamiento de imágenes)

## 📄 Documentación

- 📘 [Guía de Despliegue en Vercel](./DEPLOYMENT-VERCEL.md)
- 📗 [Guía Original (Railway/Render)](./DEPLOYMENT.md)
- 📙 [Configuración de Cloudinary](./CLOUDINARY-CONFIG.md)
- 📕 [Resumen del Proyecto](./RESUMEN.md)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

**ArvickJara**
- GitHub: [@ArvickJara](https://github.com/ArvickJara)

## 🙏 Agradecimientos

- Turso por la base de datos serverless
- Vercel por el hosting gratuito
- Cloudinary por el almacenamiento de imágenes

---

**¿Necesitas ayuda?** Abre un issue o consulta la [guía de despliegue](./DEPLOYMENT-VERCEL.md).
