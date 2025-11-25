# 🗳️ Sistema de Elecciones Escolares

Sistema web para gestionar elecciones escolares con validación de DNI, votación electrónica y resultados en tiempo real.

## ✨ Características

- ✅ **Login de Estudiantes**: Validación de DNI contra base de datos
- ✅ **Login de Administradores**: Acceso para gestión
- ✅ **Votación Electrónica**: Interface intuitiva para votar
- ✅ **Prevención de Doble Voto**: Control automático
- ✅ **Base de Datos Turso**: Almacenamiento en la nube
- ✅ **Diseño Responsivo**: Funciona en cualquier dispositivo

## 🚀 Inicio Rápido

### 1. Iniciar el Servidor Backend

En una terminal, ejecuta:

```bash
npm run server
```

El servidor estará disponible en: **http://localhost:3000**

### 2. Iniciar el Frontend

En otra terminal, ejecuta:

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5174** (o el puerto que Vite asigne)

## 📋 Flujo de Uso

### Para Estudiantes:

1. Accede a la página principal
2. Selecciona "Soy Estudiante"
3. Ingresa tu DNI (8 dígitos)
4. Si tu DNI está registrado, verás los candidatos
5. Selecciona tu candidato preferido
6. Confirma tu voto

### Para Administradores:

1. Accede a la página principal
2. Selecciona "Soy Administrador"
3. Ingresa credenciales:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`

## 🗄️ Base de Datos

El sistema utiliza **Turso (LibSQL)** con las siguientes tablas:

- `estudiantes`: Datos de los estudiantes
- `instituciones_educativas`: Colegios registrados
- `padron_matricula`: Registro de matrículas
- `candidatos`: Lista de candidatos
- `votos`: Registro de votos emitidos

### Configurar la Base de Datos

Si necesitas recrear las tablas:

```bash
npm run setup-db
```

## 📡 API Endpoints

### Autenticación

- `POST /api/auth/student` - Validar DNI de estudiante
- `POST /api/auth/admin` - Login de administrador

### Votación

- `GET /api/candidatos` - Obtener lista de candidatos
- `POST /api/votar` - Registrar voto

### Resultados

- `GET /api/resultados` - Obtener conteo de votos

## 🧪 Pruebas

Para probar el sistema, puedes usar cualquier DNI de los estudiantes importados en tu base de datos.

## 🔧 Tecnologías

- **Frontend**: Vue 3 + Vite
- **Backend**: Express.js
- **Base de Datos**: Turso (LibSQL)
- **Routing**: Vue Router

## 📝 Próximas Funcionalidades

- [ ] Panel de administración completo
- [ ] Gestión de candidatos (CRUD)
- [ ] Vista de resultados en tiempo real
- [ ] Exportación de reportes
- [ ] Sistema de roles y permisos
- [ ] Autenticación con JWT
- [ ] Dashboard con estadísticas

## 🔐 Variables de Entorno

El archivo `.env` contiene:

```
TURSO_DATABASE_URL=tu_url_de_turso
TURSO_AUTH_TOKEN=tu_token_de_turso
PORT=3000
```

## 📞 Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.

---

**Versión**: 1.0.0  
**Fecha**: Noviembre 2025
