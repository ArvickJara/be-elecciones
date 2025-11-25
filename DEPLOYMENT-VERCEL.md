# 🚀 Guía de Despliegue en Vercel - Todo en Uno

Esta guía te ayudará a desplegar el proyecto completo (Frontend + Backend) en **Vercel**.

---

## 📋 Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Tu base de datos Turso configurada y funcionando
- Git instalado
- Repositorio del proyecto en GitHub/GitLab/Bitbucket

---

## ✨ Ventajas de esta configuración

- ✅ **Todo en una plataforma**: Frontend y Backend en Vercel
- ✅ **Serverless Functions**: Backend escalable automáticamente
- ✅ **Sin costos de servidor**: Plan gratuito generoso
- ✅ **Despliegue automático**: Se actualiza con cada push a GitHub
- ✅ **URLs simples**: Rutas relativas `/api/*`
- ✅ **Base de datos externa**: Turso (ya configurado)

---

## 📁 Estructura del Proyecto

El proyecto ahora tiene dos partes:

### Frontend (Vue.js)
```
src/
├── components/
├── assets/
└── main.js
```

### Backend (Serverless Functions)
```
api/
├── _db.js                    # Conexión compartida a Turso
├── health.js                 # GET /api/health
├── candidatos.js             # GET /api/candidatos
├── votar.js                  # POST /api/votar
├── resultados.js             # GET /api/resultados
├── auth/
│   ├── student.js            # POST /api/auth/student
│   └── admin.js              # POST /api/auth/admin
├── admin/
│   ├── stats.js              # GET /api/admin/stats
│   ├── candidatos.js         # CRUD candidatos
│   └── votantes.js           # GET /api/admin/votantes
└── cloudinary/
    └── signature.js          # POST /api/cloudinary/signature
```

---

## 🎯 Paso 1: Preparar el Repositorio

1. **Asegúrate de que todos los cambios estén commiteados**:
   ```bash
   git add .
   git commit -m "Configuración para Vercel Serverless"
   git push origin main
   ```

2. **Verifica que estos archivos existan**:
   - ✅ `/api/*` (carpeta con las funciones serverless)
   - ✅ `/vercel.json` (configuración de Vercel)
   - ✅ `/vite.config.js` (con proxy configurado para desarrollo)

---

## 🚀 Paso 2: Desplegar en Vercel

### A. Conectar el Repositorio

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
2. Click en **"Add New..."** → **"Project"**
3. Selecciona tu repositorio `be-elecciones`
4. Vercel detectará automáticamente que es un proyecto Vite

### B. Configurar el Proyecto

**Framework Preset**: Vite
**Build Command**: `npm run build` (automático)
**Output Directory**: `dist` (automático)
**Install Command**: `npm install` (automático)

### C. Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega las siguientes variables:

#### Variables obligatorias:

```
TURSO_DATABASE_URL=tu_url_de_turso_aqui
TURSO_AUTH_TOKEN=tu_token_de_turso_aqui
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_password_seguro_aqui
```

#### Variables opcionales (si usas Cloudinary):

```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_UPLOAD_PRESET=tu_preset
```

**Importante**: Asegúrate de marcar las variables para todos los entornos (Production, Preview, Development)

### D. Desplegar

1. Click en **"Deploy"**
2. Vercel construirá y desplegará tu aplicación
3. En 2-3 minutos, obtendrás una URL como: `https://tu-proyecto.vercel.app`

---

## ✅ Paso 3: Verificar el Despliegue

### Probar el Backend (API)

Visita estas URLs para verificar que el backend funciona:

```
https://tu-proyecto.vercel.app/api/health
```

Deberías ver:
```json
{
  "status": "ok",
  "message": "Servidor funcionando correctamente"
}
```

### Probar el Frontend

1. Visita: `https://tu-proyecto.vercel.app`
2. Intenta hacer login con un DNI de prueba
3. Verifica que todo funcione correctamente

---

## 🔧 Desarrollo Local

### Configuración para desarrollo

El proyecto está configurado para funcionar tanto en desarrollo como en producción:

**Frontend (Vite)**:
```bash
npm run dev
```
- El proxy en `vite.config.js` redirige `/api/*` a `http://localhost:3000`

**Backend (Node.js Express)**:
```bash
npm run server
```
- El servidor Express tradicional sigue funcionando en `http://localhost:3000`

### Variables de entorno locales

Crea un archivo `.env` en la raíz:

```
# Variables para el backend local
TURSO_DATABASE_URL=tu_url_de_turso
TURSO_AUTH_TOKEN=tu_token_de_turso
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Variables de Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

---

## 📝 Cómo Funciona

### En Desarrollo Local

```
Frontend (Vite) → Proxy → Backend (Express)
http://localhost:5173/api/* → http://localhost:3000/api/*
```

### En Producción (Vercel)

```
Frontend (Vercel) ← Misma URL → Backend (Serverless Functions)
https://tu-app.vercel.app/          ← Frontend
https://tu-app.vercel.app/api/*     ← Backend
```

Vercel enruta automáticamente:
- Rutas `/api/*` → Funciones serverless en `/api/`
- Todas las demás rutas → `index.html` (Vue SPA)

---

## 🔄 Actualizaciones Automáticas

Cada vez que hagas push a tu rama principal:
1. Vercel detecta los cambios
2. Construye el proyecto automáticamente
3. Despliega la nueva versión
4. Te notifica por email

```bash
git add .
git commit -m "Actualización"
git push origin main
```

¡Y listo! En 2-3 minutos tu aplicación estará actualizada.

---

## 🆘 Solución de Problemas

### Error: "Module not found: @libsql/client"

**Solución**: Vercel necesita instalar las dependencias. Verifica que `@libsql/client` esté en `package.json`:

```json
{
  "dependencies": {
    "@libsql/client": "^0.x.x"
  }
}
```

### Error de CORS

Los archivos en `/api/` ya tienen headers CORS configurados. Si sigues teniendo problemas, verifica los logs en Vercel.

### Base de datos no conecta

1. Ve a **Settings** → **Environment Variables** en Vercel
2. Verifica que `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` sean correctos
3. Asegúrate de que estén marcados para **Production**

### Logs y Debugging

**Ver logs en Vercel**:
1. Ve a tu proyecto en Vercel
2. Click en el deployment más reciente
3. Ve a **"Functions"** tab
4. Click en cualquier función para ver sus logs

### La aplicación se ve bien pero el API no funciona

1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña **Network**
3. Intenta hacer una acción (login, votar, etc.)
4. Revisa las peticiones a `/api/*`
5. Si hay errores 500, revisa los logs en Vercel

---

## 💰 Costos

### Plan Gratuito de Vercel incluye:
- ✅ 100 GB de ancho de banda
- ✅ 100 GB-Hrs de ejecución de funciones
- ✅ Despliegues ilimitados
- ✅ HTTPS automático
- ✅ Dominio personalizado
- ✅ Actualizaciones automáticas

Para un sistema de elecciones escolar, el plan gratuito es más que suficiente.

### Turso (Base de Datos)
- Plan gratuito: 9 GB de almacenamiento
- Más que suficiente para miles de estudiantes

---

## 🎉 ¡Listo!

Tu aplicación de elecciones escolares está completamente desplegada en Vercel.

### URLs Finales:
- **Aplicación completa**: `https://tu-proyecto.vercel.app`
- **API Health**: `https://tu-proyecto.vercel.app/api/health`
- **Panel Admin**: `https://tu-proyecto.vercel.app` (login → admin)

### Credenciales de Admin:
- Usuario: El que configuraste en `ADMIN_USERNAME`
- Contraseña: La que configuraste en `ADMIN_PASSWORD`

---

## 🔐 Recomendaciones de Seguridad

1. **Cambia las credenciales de admin** inmediatamente después del despliegue
2. **Mantén seguros** tus tokens de Turso
3. **No compartas** tu `.env` en GitHub (ya está en `.gitignore`)
4. **Monitorea** los logs de Vercel regularmente

---

## 📚 Recursos Adicionales

- [Documentación de Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Documentación de Turso](https://docs.turso.tech/)
- [Vite Proxy Configuration](https://vitejs.dev/config/server-options.html#server-proxy)

---

**¿Necesitas ayuda?** Revisa los logs en Vercel o consulta la documentación oficial.
