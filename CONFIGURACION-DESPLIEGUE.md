# 📦 Archivos de Configuración de Despliegue

Este documento explica los archivos creados para facilitar el despliegue del proyecto.

## ✅ Archivos Creados

### 1. `vercel.json`
Configura Vercel para servir correctamente la SPA de Vue.js. Redirige todas las rutas a `index.html` para que el Vue Router funcione correctamente.

### 2. `.env.example`
Plantilla de variables de entorno para el **backend**. Documenta todas las variables necesarias:
- Puerto del servidor
- Credenciales de Turso
- URL del frontend para CORS
- Credenciales de administrador

### 3. `.env.production.example`
Plantilla de variables de entorno para el **frontend** en producción. Define la URL del API backend.

### 4. `DEPLOYMENT.md`
Guía completa paso a paso para desplegar el proyecto en:
- Frontend: Vercel
- Backend: Railway o Render
- Base de datos: Turso

## 🔧 Cambios en el Código

### `server.js`
- ✅ Agregada configuración de CORS dinámica usando `process.env.FRONTEND_URL`
- ✅ Preparado para usar variables de entorno en producción

### Componentes Vue actualizados:
- ✅ `LoginView.vue` - Usa `import.meta.env.VITE_API_URL`
- ✅ `VotingView.vue` - Usa `import.meta.env.VITE_API_URL`
- ✅ `AdminView.vue` - Usa `import.meta.env.VITE_API_URL`

Todos los componentes ahora usan variables de entorno y tienen fallback a localhost para desarrollo.

## 🚀 Próximos Pasos

1. Lee el archivo `DEPLOYMENT.md` para instrucciones detalladas
2. Copia `.env.example` a `.env` y configura tus valores locales
3. Sigue la guía en `DEPLOYMENT.md` para desplegar en producción

## 📝 Notas

- En desarrollo, la aplicación sigue funcionando con `http://localhost:3000`
- En producción, usará las URLs configuradas en las variables de entorno
- No es necesario cambiar código entre desarrollo y producción
