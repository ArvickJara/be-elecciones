# 🧪 Guía de Pruebas - Sistema de Elecciones

## ✅ Estado Actual del Sistema

### ✨ Servicios Ejecutándose:
- **Backend API**: http://localhost:3000 ✅
- **Frontend Vue**: http://localhost:5174 ✅
- **Base de Datos**: Turso (conectado) ✅

---

## 📋 Cómo Probar el Sistema

### 1️⃣ Obtener un DNI de Prueba

Para probar el login, necesitas un DNI de un estudiante real de tu base de datos. Puedes obtenerlo ejecutando:

```bash
# En una nueva terminal
cd /home/aarvick/Development/fe-elecciones
node -e "
import('dotenv/config').then(() => {
  import('@libsql/client').then(({ createClient }) => {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    });
    db.execute('SELECT numero_documento, nombres, apellido_paterno FROM estudiantes LIMIT 5')
      .then(result => {
        console.log('\n📝 DNIs de prueba:\n');
        result.rows.forEach(row => {
          console.log('DNI:', row.numero_documento, '-', row.nombres, row.apellido_paterno);
        });
        process.exit(0);
      });
  });
});
"
```

### 2️⃣ Flujo Completo de Votación

1. **Abrir la aplicación**: http://localhost:5174
2. **Seleccionar "Soy Estudiante"**
3. **Ingresar un DNI válido** (de la lista anterior)
4. **Sistema valida el DNI**:
   - ✅ Si existe: Muestra pantalla de votación
   - ❌ Si no existe: Muestra error
   - ⚠️ Si ya votó: Muestra mensaje de que ya votó
5. **Seleccionar un candidato** (click en la tarjeta)
6. **Confirmar voto**
7. **Ver pantalla de éxito**

### 3️⃣ Probar Login de Administrador

1. **Seleccionar "Soy Administrador"**
2. **Credenciales**:
   - Usuario: `admin`
   - Contraseña: `admin123`

---

## 🔍 Verificar Datos en la Base de Datos

### Ver candidatos registrados:
```bash
node -e "
import('dotenv/config').then(() => {
  import('@libsql/client').then(({ createClient }) => {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    });
    db.execute('SELECT * FROM candidatos')
      .then(result => {
        console.log('\n🎯 Candidatos registrados:\n');
        result.rows.forEach(c => {
          console.log('-', c.nombre_completo, '(' + c.lista + ')');
        });
        process.exit(0);
      });
  });
});
"
```

### Ver votos registrados:
```bash
node -e "
import('dotenv/config').then(() => {
  import('@libsql/client').then(({ createClient }) => {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    });
    db.execute('SELECT COUNT(*) as total FROM votos')
      .then(result => {
        console.log('\n🗳️  Total de votos:', result.rows[0].total);
        process.exit(0);
      });
  });
});
"
```

---

## 🎯 Endpoints de la API

### Probar con curl:

#### 1. Verificar que el servidor está funcionando:
```bash
curl http://localhost:3000/api/health
```

#### 2. Validar un DNI:
```bash
curl -X POST http://localhost:3000/api/auth/student \
  -H "Content-Type: application/json" \
  -d '{"dni":"12345678"}'
```

#### 3. Obtener candidatos:
```bash
curl http://localhost:3000/api/candidatos
```

#### 4. Ver resultados:
```bash
curl http://localhost:3000/api/resultados
```

---

## 🐛 Solución de Problemas

### Error: "No se pudo conectar con el servidor"
- ✅ Verifica que el backend esté corriendo: `npm run server`
- ✅ Verifica que esté en el puerto 3000

### Error: "DNI no encontrado"
- ✅ Asegúrate de usar un DNI de la base de datos
- ✅ Verifica que hayas importado correctamente el padrón

### Error: "Ya has votado"
- ✅ Cada DNI solo puede votar una vez
- ✅ Usa otro DNI para seguir probando

### Frontend no carga:
- ✅ Verifica que Vite esté corriendo: `npm run dev`
- ✅ Abre el navegador en el puerto correcto

---

## 📊 Características Implementadas

✅ **Autenticación de Estudiantes**
- Validación de DNI contra base de datos
- Verificación de si ya votó
- Prevención de doble voto

✅ **Sistema de Votación**
- Visualización de candidatos
- Selección de candidato
- Confirmación de voto
- Registro en base de datos

✅ **Interfaz de Usuario**
- Diseño responsivo
- Animaciones suaves
- Feedback visual
- Mensajes de confirmación

✅ **Seguridad**
- Un voto por estudiante
- Validación en backend
- Constraint de base de datos

---

## 🚀 Siguiente Paso Sugerido

Prueba el flujo completo:
1. Obtén un DNI de prueba
2. Ingresa a http://localhost:5174
3. Realiza una votación completa
4. Verifica que el voto se registró

¡Listo para probar! 🎉
