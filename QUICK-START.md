# 🚀 Quick Start - Despliegue en Vercel

## ⚡ En 5 Minutos

### 1. Prepara tu Repositorio
```bash
git add .
git commit -m "Ready for Vercel"
git push origin main
```

### 2. Ve a Vercel
1. Abre [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Selecciona tu repositorio `be-elecciones`

### 3. Configura Variables de Entorno
En Vercel, agrega estas 4 variables:

```
TURSO_DATABASE_URL = tu_url_aqui
TURSO_AUTH_TOKEN = tu_token_aqui  
ADMIN_USERNAME = admin
ADMIN_PASSWORD = cambiar_esto
```

### 4. Deploy
Click "Deploy" y espera 2 minutos.

### 5. ¡Listo!
Visita: `https://tu-proyecto.vercel.app`

---

## 🔍 Verificación Rápida

Abre tu navegador y prueba:

✅ `https://tu-proyecto.vercel.app` - Frontend
✅ `https://tu-proyecto.vercel.app/api/health` - Backend

Si ves `{"status":"ok"}` en el segundo, ¡funciona!

---

## 💻 Desarrollo Local

### Terminal 1 - Frontend
```bash
npm run dev
```
Abre: http://localhost:5173

### Terminal 2 - Backend  
```bash
npm run server
```
Backend: http://localhost:3000

---

## 📄 Documentación Completa

- 📘 **[Guía Completa de Vercel](./DEPLOYMENT-VERCEL.md)** ← Empieza aquí
- 📗 **[Cambios Realizados](./VERCEL-CHANGES.md)**
- 📙 **[README Actualizado](./README-VERCEL.md)**

---

## 🆘 Problemas Comunes

### "Module not found: @libsql/client"
→ Espera a que Vercel termine de instalar dependencias

### "Base de datos no conecta"
→ Verifica las variables de entorno en Vercel

### "API no responde"
→ Revisa los logs: Vercel Dashboard → Functions → Ver logs

---

## 🎉 ¡Eso es Todo!

Tu aplicación está corriendo completamente en Vercel.

**Siguiente**: Lee [DEPLOYMENT-VERCEL.md](./DEPLOYMENT-VERCEL.md) para más detalles.
