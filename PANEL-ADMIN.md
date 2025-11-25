# 🔐 Panel de Administración - Guía de Uso

## 📊 Características del Panel

El panel de administración te permite gestionar completamente el sistema de elecciones escolares.

---

## 🚪 Acceso al Panel

### Credenciales:
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Pasos para acceder:
1. Ir a la página principal
2. Click en "Soy Administrador"
3. Ingresar credenciales
4. Acceder al panel completo

---

## 📈 Sección: Dashboard

El dashboard muestra las estadísticas principales en tiempo real:

### Métricas Principales:
- **Total de Votos**: Cantidad de votos emitidos
- **Total de Estudiantes**: Estudiantes registrados en el padrón
- **Participación**: Porcentaje de votación
- **Candidatos**: Número de candidatos activos

### Gráficos:

#### 1. Resultados por Candidato
- Gráfico de barras horizontal
- Muestra votos de cada candidato
- Colores distintivos por candidato
- Porcentaje en tiempo real

#### 2. Distribución de Votos
- Vista tipo lista con indicadores
- Listas de candidatos con colores
- Cantidad y porcentaje de votos
- Actualización automática

---

## 🏆 Sección: Gestión de Candidatos

Administra todos los candidatos del proceso electoral.

### Ver Candidatos:
- Lista completa de candidatos
- Información detallada:
  - Foto del candidato
  - Nombre completo
  - Lista electoral
  - Propuestas
  - Estado (Activo/Inactivo)

### Crear Nuevo Candidato:

1. Click en "**+ Nuevo Candidato**"
2. Llenar formulario:
   - **Nombre Completo** (requerido)
   - **Lista** (requerido) - Ej: "Lista A - Cambio Estudiantil"
   - **URL de Foto** (opcional) - Se genera automáticamente si se deja vacío
   - **Propuestas** (requerido) - Describe las propuestas del candidato
   - **Orden** (opcional) - Orden de aparición (menor = primero)
   - **Candidato activo** - Checkbox para activar/desactivar

3. Click en "**Guardar Candidato**"

### Editar Candidato:

1. Click en el ícono ✏️ de editar
2. Modificar los campos deseados
3. Click en "**Guardar Candidato**"

### Eliminar Candidato:

1. Click en el ícono 🗑️ de eliminar
2. Confirmar la eliminación
3. **Nota**: No se puede eliminar un candidato que ya tiene votos

---

## ✅ Sección: Votantes

Lista completa de estudiantes que ya ejercieron su voto.

### Información Mostrada:
- Número de orden
- DNI del estudiante
- Nombre completo
- Grado
- Sección
- Fecha y hora del voto

### Búsqueda:
- Buscar por DNI
- Buscar por nombre
- Filtrado en tiempo real

### Funcionalidades:
- Ver todos los votantes
- Monitorear participación en tiempo real
- Exportar datos (próximamente)

---

## 📊 Uso de las Estadísticas

### Monitoreo en Tiempo Real:
- El dashboard se actualiza automáticamente
- Los gráficos reflejan los votos actuales
- Las estadísticas se calculan dinámicamente

### Análisis de Participación:
```
Porcentaje de Participación = (Total Votos / Total Estudiantes) × 100
```

### Interpretación de Resultados:
- **Barras verdes**: Indica el candidato con más votos
- **Porcentajes**: Muestran la distribución de votos
- **Comparativa**: Fácil visualización del rendimiento

---

## 🔒 Seguridad

### Protecciones Implementadas:
- ✅ Autenticación requerida para acceder
- ✅ SessionStorage para mantener sesión
- ✅ Redirección automática si no está autenticado
- ✅ No se pueden eliminar candidatos con votos

### Mejores Prácticas:
- Cerrar sesión al terminar
- No compartir credenciales
- Monitorear cambios regularmente

---

## 🎨 Interfaz del Panel

### Navegación por Pestañas:
- **Dashboard** 📊 - Vista general y gráficos
- **Candidatos** 🏆 - Gestión de candidatos
- **Votantes** ✅ - Lista de quienes votaron

### Colores y Estados:
- **Verde**: Activo, exitoso
- **Rojo**: Inactivo, error
- **Azul**: Información, acciones
- **Gris**: Neutro, secundario

---

## 📱 Responsive

El panel funciona en:
- ✅ Computadoras de escritorio
- ✅ Laptops
- ✅ Tablets
- ✅ Móviles (con diseño adaptado)

---

## 🚀 Flujo de Trabajo Típico

### Al Inicio de las Elecciones:
1. Crear todos los candidatos
2. Verificar que estén activos
3. Confirmar propuestas y fotos

### Durante las Elecciones:
1. Monitorear dashboard regularmente
2. Ver participación en tiempo real
3. Revisar lista de votantes

### Al Final de las Elecciones:
1. Ver resultados finales
2. Analizar estadísticas
3. Exportar datos (próximamente)

---

## 🔧 Endpoints API Utilizados

### Estadísticas:
- `GET /api/admin/stats` - Estadísticas generales
- `GET /api/resultados` - Resultados de votación

### Candidatos:
- `GET /api/admin/candidatos` - Listar todos
- `POST /api/admin/candidatos` - Crear nuevo
- `PUT /api/admin/candidatos/:id` - Actualizar
- `DELETE /api/admin/candidatos/:id` - Eliminar

### Votantes:
- `GET /api/admin/votantes` - Listar votantes

---

## 💡 Tips y Consejos

### Gestión de Candidatos:
- Usa números de orden para controlar la secuencia
- Las fotos se generan automáticamente si no las proporcionas
- Escribe propuestas claras y concisas

### Monitoreo:
- Revisa el dashboard frecuentemente
- Observa tendencias en tiempo real
- Identifica problemas de participación rápidamente

### Seguridad:
- Cierra sesión cuando no uses el panel
- Mantén las credenciales seguras
- Solo comparte acceso con personal autorizado

---

## 🆘 Solución de Problemas

### "No se pueden ver los candidatos"
- Verifica que el servidor esté corriendo
- Revisa la consola del navegador
- Asegúrate de estar autenticado

### "Error al crear candidato"
- Verifica campos requeridos
- Revisa formato de URL de foto
- Confirma conexión con servidor

### "No aparecen votantes"
- Asegúrate de que haya votos registrados
- Verifica conexión con base de datos
- Refresca la página

---

## 📞 Soporte

Si necesitas ayuda:
1. Revisa esta documentación
2. Verifica los logs del servidor
3. Consulta la consola del navegador
4. Contacta al equipo de desarrollo

---

**Panel de Administración v1.0**  
Sistema de Elecciones Escolares 2025
