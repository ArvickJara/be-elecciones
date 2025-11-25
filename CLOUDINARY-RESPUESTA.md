# 🔑 Respuesta Rápida: API Key y API Secret

## ❓ Tu Pregunta
> "¿En dónde configuro la API Key y el API Secret?"

## ✅ Respuesta Corta
**NO NECESITAS configurar API Key ni API Secret** para tu configuración actual.

Tu sistema usa **"unsigned upload"** que solo requiere:
- ✅ Cloud Name: `dmkdgm4m6` (ya lo tienes)
- ✅ Upload Preset: `elecciones_preset` (ya lo tienes)

## 📍 Dónde encontrar las credenciales (por si las necesitas después)

Ve a tu Dashboard de Cloudinary: https://console.cloudinary.com/

Verás algo así:

```
┌─────────────────────────────────────────┐
│  Cloud name: dmkdgm4m6                  │
│  API Key: 123456789012345               │ ← API KEY
│  API Secret: ************************** │ ← API SECRET (click para ver)
│  [Copy Credentials]                     │
└─────────────────────────────────────────┘
```

## 🔓 Tu Configuración Actual (Unsigned) - ✅ RECOMENDADA

### En `.env`:
```env
# ✅ Esto es TODO lo que necesitas:
VITE_CLOUDINARY_CLOUD_NAME=dmkdgm4m6
VITE_CLOUDINARY_UPLOAD_PRESET=elecciones_preset
```

### Seguridad:
- ✅ No expone credenciales sensibles
- ✅ Suficientemente seguro para tu caso (solo admins autenticados)
- ✅ Más rápido (sube directo desde el navegador)

## 🔐 Configuración Alternativa (Signed) - Solo si necesitas MÁS seguridad

Si en el futuro quieres máxima seguridad:

### En `.env`:
```env
# Frontend
VITE_CLOUDINARY_CLOUD_NAME=dmkdgm4m6

# Backend (nunca expongas estos)
CLOUDINARY_CLOUD_NAME=dmkdgm4m6
CLOUDINARY_API_KEY=123456789012345           ← Copiar del Dashboard
CLOUDINARY_API_SECRET=tu-api-secret-aqui     ← Copiar del Dashboard
```

### Pasos adicionales:
1. Instalar: `npm install cloudinary`
2. El endpoint `/api/cloudinary/signature` ya está creado en `server.js`
3. Modificar el frontend para usar signed upload

## 🎯 Recomendación Final

**✅ Mantén tu configuración actual (unsigned)**

Es perfecta porque:
- Simple y funcional
- Segura (solo admins pueden acceder al panel)
- Rápida (sin latencia del servidor)
- Sin dependencias adicionales

Solo usarías API Key/Secret si:
- Vas a abrir esto al público (no es tu caso)
- Necesitas control granular de permisos
- Quieres auditoría detallada de cada upload

---

## 🚀 Pasos Siguientes

1. ✅ **Tu .env ya está correcto** con las variables actuales
2. ✅ **El código ya funciona** con unsigned upload
3. ✅ **Reinicia el servidor**: 
   ```bash
   npm run dev
   ```
4. ✅ **Prueba subir una imagen** desde el panel de admin

**¡Ya está todo listo para funcionar!** 🎉

---

**Documentación completa**: Lee `CLOUDINARY-OPCIONES.md` para entender a fondo ambas opciones.
