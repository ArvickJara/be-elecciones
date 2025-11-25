# Cloudinary: Upload Unsigned vs Signed

Este documento explica las dos opciones disponibles para subir imágenes a Cloudinary y cuándo usar cada una.

## 📋 Resumen de Opciones

| Característica | Upload Unsigned | Upload Signed |
|----------------|----------------|---------------|
| **Configuración** | ✅ Simple (solo Cloud Name + Preset) | ⚠️ Requiere API Key + Secret |
| **Seguridad** | ⚠️ Cualquiera puede subir (con preset) | ✅ Solo usuarios autenticados |
| **Velocidad** | ✅ Directo desde el navegador | ⚠️ Pasa por el servidor |
| **Control** | ⚠️ Limitado por configuración del preset | ✅ Total control desde backend |
| **Credenciales sensibles** | ✅ No expone secretos | ✅ Mantiene secretos en servidor |
| **Uso recomendado** | Aplicaciones simples, prototipos | Producción, mayor seguridad |

---

## 🔓 Opción 1: Upload Unsigned (Configuración Actual)

### ✅ Ya está funcionando con:
- Cloud Name: `dmkdgm4m6`
- Upload Preset: `elecciones_preset`

### 📝 Configuración en Cloudinary:

1. Ve a **Settings** → **Upload**
2. Encuentra tu preset `elecciones_preset`
3. Asegúrate que esté configurado como:
   - **Signing Mode**: `Unsigned`
   - **Folder**: `candidatos` (opcional)

### 🎯 Variables de entorno necesarias (.env):
```env
VITE_CLOUDINARY_CLOUD_NAME=dmkdgm4m6
VITE_CLOUDINARY_UPLOAD_PRESET=elecciones_preset
```

### ✅ Ventajas:
- ✅ **Configuración simple** - Solo necesitas 2 variables
- ✅ **Rápido** - Sube directamente desde el navegador a Cloudinary
- ✅ **Sin backend** - No necesitas código adicional en el servidor
- ✅ **Suficiente seguridad** para tu caso (elecciones escolares internas)

### ⚠️ Consideraciones:
- Cualquiera con el preset podría subir imágenes (pero está limitado por las reglas del preset)
- No tienes control fino sobre quién sube

### 💡 Recomendación:
**✅ USAR ESTA OPCIÓN** para tu sistema de elecciones escolares. Es suficientemente seguro porque:
- Solo los administradores autenticados acceden al panel
- El preset puede tener límites de tamaño y tipo de archivo
- Es más simple y rápido

---

## 🔐 Opción 2: Upload Signed (Más Seguro)

### 📝 Dónde obtener API Key y API Secret:

1. Ve a tu **Dashboard** en Cloudinary
2. En la parte superior verás:
   ```
   Cloud name: dmkdgm4m6
   API Key: 123456789012345  ← ESTE
   API Secret: xxxxxxxxxxx     ← Y ESTE
   ```
3. Copia ambos valores

### 🎯 Variables de entorno necesarias (.env):
```env
# Frontend (para mostrar el cloud name)
VITE_CLOUDINARY_CLOUD_NAME=dmkdgm4m6

# Backend (NUNCA expongas estos en el frontend)
CLOUDINARY_CLOUD_NAME=dmkdgm4m6
CLOUDINARY_API_KEY=tu-api-key-de-cloudinary
CLOUDINARY_API_SECRET=tu-api-secret-de-cloudinary
```

### 🔧 Cómo funciona:

1. **Frontend** solicita una firma al backend
2. **Backend** genera la firma usando el API Secret
3. **Frontend** usa la firma para subir a Cloudinary
4. **Cloudinary** valida la firma y acepta/rechaza

### ✅ Ventajas:
- ✅ **Mayor seguridad** - Solo el backend puede generar firmas
- ✅ **Control total** - Puedes validar usuarios, límites, etc.
- ✅ **Auditoría** - Registro de quién subió qué
- ✅ **API Secret protegido** - Nunca se expone al navegador

### ⚠️ Desventajas:
- ⚠️ **Más complejo** - Requiere endpoint adicional
- ⚠️ **Más lento** - Requiere 2 peticiones (firma + upload)
- ⚠️ **Requiere instalar paquete** - `npm install cloudinary`

---

## 🚀 Implementación de Upload Signed (Opcional)

Si decides usar la opción más segura:

### Paso 1: Instalar el paquete de Cloudinary

```bash
npm install cloudinary
```

### Paso 2: Configurar el .env con tus credenciales

```env
CLOUDINARY_CLOUD_NAME=dmkdgm4m6
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

### Paso 3: El endpoint ya está creado en server.js

Ya agregué el endpoint `/api/cloudinary/signature` que genera firmas.

### Paso 4: Modificar el frontend para usar signed upload

El frontend necesitaría:
1. Llamar a `/api/cloudinary/signature` primero
2. Usar la firma recibida para subir a Cloudinary

---

## 🎯 Mi Recomendación para tu Proyecto

### ✅ **USAR UNSIGNED UPLOAD** porque:

1. **Es suficientemente seguro para tu caso**:
   - Solo los administradores autenticados acceden al panel
   - Ya tienes autenticación con usuario/contraseña
   - Es un sistema interno de elecciones escolares

2. **Es más simple y rápido**:
   - Menos código que mantener
   - Menos puntos de fallo
   - Subida directa sin pasar por tu servidor

3. **El preset unsigned ya tiene seguridad**:
   - Puedes configurar límites de tamaño
   - Puedes restringir tipos de archivo
   - Puedes configurar transformaciones automáticas

### Configuración Recomendada del Preset:

En Cloudinary, configura tu preset así:
- **Signing Mode**: Unsigned
- **Access mode**: Public
- **Resource type**: Image
- **Allowed formats**: jpg, png, webp
- **Max file size**: 5 MB
- **Folder**: candidatos
- **Use filename**: Yes
- **Unique filename**: Yes (para evitar sobrescribir)

---

## 🔒 Cuándo usar Upload Signed:

Usa signed upload si:
- ✅ Vas a abrir la subida a usuarios no autenticados
- ✅ Necesitas auditoría detallada de quién subió qué
- ✅ Quieres validar permisos adicionales en el backend
- ✅ Necesitas reglas de negocio complejas antes de subir
- ✅ Vas a usar esto en producción con muchos usuarios

Para tu caso (sistema escolar interno con admin autenticado), **unsigned es perfecto**.

---

## 🆘 Solución de Problemas

### "Unsigned upload is not allowed"
- Verifica que el preset esté en modo **Unsigned**
- Revisa que el nombre del preset sea exacto

### "Invalid API Key"
- Solo pasa si usas signed upload
- Verifica que copiaste correctamente el API Key

### "Upload preset not found"
- Verifica el nombre: `elecciones_preset`
- Asegúrate que existe en tu cuenta de Cloudinary

---

## 📚 Recursos Adicionales

- [Cloudinary Upload Presets](https://cloudinary.com/documentation/upload_presets)
- [Signed vs Unsigned Uploads](https://cloudinary.com/documentation/upload_images#unsigned_upload)
- [Upload API Reference](https://cloudinary.com/documentation/image_upload_api_reference)

---

**Conclusión**: Tu configuración actual con **unsigned upload** es perfecta para tu sistema de elecciones escolares. ✅
