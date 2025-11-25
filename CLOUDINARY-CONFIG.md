# Configuración de Cloudinary para Carga de Imágenes

Este proyecto utiliza Cloudinary para almacenar las imágenes de los iconos de los partidos políticos.

## Pasos para configurar Cloudinary

### 1. Crear una cuenta en Cloudinary

1. Ve a [https://cloudinary.com](https://cloudinary.com)
2. Regístrate para obtener una cuenta gratuita
3. Una vez dentro, encontrarás tu **Dashboard**

### 2. Obtener las credenciales

En el Dashboard de Cloudinary encontrarás:
- **Cloud Name**: Tu identificador único (ej: `dxxxxx123`)
- **API Key**: Tu llave de API
- **API Secret**: Tu secreto de API

### 3. Crear un Upload Preset (Preset de Subida)

1. Ve a **Settings** → **Upload**
2. Scroll hasta encontrar **Upload presets**
3. Haz clic en **Add upload preset**
4. Configura el preset:
   - **Preset name**: `elecciones_preset`
   - **Signing Mode**: Selecciona **Unsigned**
   - **Folder**: `candidatos` (opcional, para organizar las imágenes)
   - **Use filename**: Puedes activarlo si quieres mantener los nombres originales
   - **Unique filename**: Activado (recomendado para evitar duplicados)
5. Guarda el preset

### 4. Configurar las variables de entorno

Edita el archivo `.env` en la raíz del proyecto:

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name-aqui
VITE_CLOUDINARY_UPLOAD_PRESET=elecciones_preset
```

**Importante**: Reemplaza `tu-cloud-name-aqui` con tu Cloud Name real de Cloudinary.

### 5. Reiniciar el servidor de desarrollo

Después de configurar las variables de entorno, reinicia el servidor:

```bash
# Detener el servidor actual (Ctrl+C)
# Luego iniciar nuevamente
npm run dev
```

## Cómo funciona

1. El administrador selecciona una imagen desde el formulario de creación/edición de candidato
2. La imagen se valida (tipo y tamaño máximo 5MB)
3. Se sube automáticamente a Cloudinary usando la API
4. Cloudinary devuelve una URL segura de la imagen
5. Esta URL se guarda en la base de datos junto con los datos del candidato

## Límites de la cuenta gratuita

Cloudinary ofrece en su plan gratuito:
- **25 GB** de almacenamiento
- **25 GB** de ancho de banda mensual
- **1000** transformaciones al mes

Esto es más que suficiente para un sistema de elecciones escolares.

## Seguridad

- El preset está configurado como **unsigned**, lo que permite subir imágenes desde el frontend sin exponer el API Secret
- Solo se permiten imágenes (el código valida el tipo de archivo)
- Tamaño máximo: 5MB por imagen
- Las imágenes se organizan en la carpeta `candidatos` para mejor gestión

## Solución de problemas

### Error: "Cloudinary no está configurado"

Verifica que:
1. Las variables de entorno estén correctamente configuradas en `.env`
2. Los nombres de las variables sean exactos: `VITE_CLOUDINARY_CLOUD_NAME` y `VITE_CLOUDINARY_UPLOAD_PRESET`
3. Hayas reiniciado el servidor después de editar el `.env`

### Error al subir imagen

Verifica que:
1. El Upload Preset esté configurado como **Unsigned** en Cloudinary
2. El nombre del preset coincida con el configurado en `.env`
3. Tu conexión a internet esté funcionando correctamente

### Las imágenes no se muestran

Verifica que:
1. La URL devuelta por Cloudinary sea válida
2. No haya restricciones de CORS en tu navegador
3. La imagen se haya subido correctamente (revisa en el Media Library de Cloudinary)

## Alternativa sin Cloudinary

Si no deseas usar Cloudinary, puedes:
1. Usar otro servicio similar (ImgBB, ImageKit, etc.)
2. Implementar tu propio servidor de subida de archivos
3. Modificar el código para aceptar solo URLs externas de imágenes ya alojadas

---

Para más información, consulta la [documentación oficial de Cloudinary](https://cloudinary.com/documentation).
