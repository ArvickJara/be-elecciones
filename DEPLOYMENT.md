# 🚀 Guía de Despliegue - Sistema de Elecciones Escolares

Esta guía te ayudará a desplegar el proyecto completo usando:
- **Frontend**: Vercel
- **Backend**: Railway o Render
- **Base de datos**: Turso (ya configurado)

---

## 📋 Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Railway](https://railway.app) o [Render](https://render.com)
- Tu base de datos Turso configurada
- Git instalado
- Repositorio del proyecto en GitHub/GitLab/Bitbucket

---

## 🎯 Parte 1: Desplegar el Backend

### Opción A: Railway (Recomendado)

1. **Crear cuenta en Railway**
   - Ve a https://railway.app
   - Inicia sesión con GitHub

2. **Crear nuevo proyecto**
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Autoriza Railway y selecciona tu repositorio

3. **Configurar variables de entorno**
   - En tu proyecto, ve a "Variables"
   - Agrega las siguientes variables:
     ```
     PORT=3000
     TURSO_DATABASE_URL=tu_url_de_turso
     TURSO_AUTH_TOKEN=tu_token_de_turso
     FRONTEND_URL=https://tu-app.vercel.app
     ADMIN_USERNAME=admin
     ADMIN_PASSWORD=tu_password_seguro
     ```

4. **Configurar el comando de inicio**
   - Railway debería detectar automáticamente `npm start`
   - Si no, ve a Settings → Deploy → Start Command: `node server.js`

5. **Obtener la URL del backend**
   - Railway te asignará una URL como: `https://tu-proyecto.up.railway.app`
   - **Guarda esta URL**, la necesitarás para el frontend

---

### Opción B: Render

1. **Crear cuenta en Render**
   - Ve a https://render.com
   - Inicia sesión con GitHub

2. **Crear nuevo Web Service**
   - Click en "New +"
   - Selecciona "Web Service"
   - Conecta tu repositorio

3. **Configurar el servicio**
   - **Name**: elecciones-backend (o el que prefieras)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free (o el que prefieras)

4. **Agregar variables de entorno**
   - En la sección "Environment", agrega:
     ```
     TURSO_DATABASE_URL=tu_url_de_turso
     TURSO_AUTH_TOKEN=tu_token_de_turso
     FRONTEND_URL=https://tu-app.vercel.app
     ADMIN_USERNAME=admin
     ADMIN_PASSWORD=tu_password_seguro
     ```
   - No necesitas agregar PORT, Render lo asigna automáticamente

5. **Deploy**
   - Click en "Create Web Service"
   - Render construirá y desplegará tu backend
   - Obtendrás una URL como: `https://tu-proyecto.onrender.com`
   - **Guarda esta URL**

---

## 🎨 Parte 2: Desplegar el Frontend en Vercel

1. **Crear archivo de configuración de entorno**
   - Crea un archivo `.env.production` en la raíz del proyecto:
     ```
     VITE_API_URL=https://tu-backend-url.railway.app/api
     ```
   - Reemplaza con la URL de tu backend (Railway o Render)

2. **Actualizar el código del frontend**
   - Necesitamos usar la variable de entorno en lugar de hardcodear la URL
   - Abre estos archivos y reemplaza `http://localhost:3000/api` con `import.meta.env.VITE_API_URL`:
     - `src/components/LoginView.vue`
     - `src/components/VotingView.vue`
     - `src/components/AdminView.vue`

3. **Desplegar en Vercel**
   - Ve a https://vercel.com
   - Click en "Add New..." → "Project"
   - Importa tu repositorio de Git
   - Vercel detectará automáticamente que es un proyecto Vite

4. **Configurar el proyecto**
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (debería estar configurado automáticamente)
   - **Output Directory**: `dist` (debería estar configurado automáticamente)

5. **Agregar variables de entorno**
   - En "Environment Variables", agrega:
     ```
     VITE_API_URL=https://tu-backend-url.railway.app/api
     ```
   - Reemplaza con tu URL real del backend

6. **Deploy**
   - Click en "Deploy"
   - Vercel construirá y desplegará tu frontend
   - Obtendrás una URL como: `https://tu-proyecto.vercel.app`

7. **Actualizar CORS en el backend**
   - Vuelve a Railway/Render
   - Actualiza la variable `FRONTEND_URL` con tu URL de Vercel
   - El backend se redesplegará automáticamente

---

## 🔄 Actualizar el código para usar variables de entorno

### LoginView.vue
Busca esta línea:
```javascript
const API_URL = 'http://localhost:3000/api'
```

Reemplázala con:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
```

### VotingView.vue
Busca esta línea:
```javascript
const API_URL = 'http://localhost:3000/api'
```

Reemplázala con:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
```

### AdminView.vue
Busca esta línea (si existe):
```javascript
const API_URL = 'http://localhost:3000/api'
```

Reemplázala con:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
```

---

## ✅ Verificación

1. **Probar el backend**
   - Visita: `https://tu-backend-url/api/health`
   - Deberías ver: `{"status":"ok","message":"Servidor funcionando correctamente"}`

2. **Probar el frontend**
   - Visita tu URL de Vercel
   - Intenta hacer login con un DNI de prueba
   - Verifica que todo funcione correctamente

---

## 🔧 Comandos útiles para desarrollo local

```bash
# Frontend (en la raíz del proyecto)
npm run dev

# Backend (en la raíz del proyecto)
npm run server
# o
node server.js
```

---

## 📝 Notas importantes

### Desarrollo vs Producción
- En desarrollo: usa `http://localhost:3000/api`
- En producción: usa la URL de Railway/Render

### Actualizaciones automáticas
- **Vercel**: Se redespliega automáticamente cuando haces push a tu rama principal
- **Railway/Render**: Se redespliega automáticamente cuando haces push

### Logs y debugging
- **Railway**: Ve a tu proyecto → "View Logs"
- **Render**: Ve a tu servicio → "Logs"
- **Vercel**: Ve a tu proyecto → "Deployments" → Click en un deployment → "View Function Logs"

### Costos
- **Vercel Free**: 100 GB bandwidth, build time ilimitado
- **Railway Free**: $5 de crédito mensual, ~500 horas de ejecución
- **Render Free**: 750 horas mensuales, pero el servicio se duerme después de 15 min de inactividad
- **Turso**: Plan gratuito incluye 9 GB de almacenamiento

---

## 🆘 Solución de problemas comunes

### Error de CORS
- Verifica que `FRONTEND_URL` en el backend coincida con tu URL de Vercel
- Asegúrate de incluir el protocolo https://

### Backend no responde
- Verifica los logs en Railway/Render
- Confirma que las variables de entorno de Turso estén correctas
- En Render Free, el servicio se duerme; la primera petición puede tardar 30-60 segundos

### Frontend no conecta con backend
- Verifica que `VITE_API_URL` esté configurada correctamente en Vercel
- Abre las DevTools del navegador y revisa la consola y la pestaña Network

### Base de datos no conecta
- Verifica que `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` sean correctos
- Confirma que tu base de datos Turso esté activa

---

## 🎉 ¡Listo!

Tu aplicación de elecciones escolares ahora está desplegada y lista para usar en producción.

### URLs finales:
- Frontend: `https://tu-proyecto.vercel.app`
- Backend: `https://tu-proyecto.railway.app` o `https://tu-proyecto.onrender.com`
- Base de datos: Turso (ya configurado)
