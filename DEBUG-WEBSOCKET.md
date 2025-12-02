# 🔧 Guía de Depuración de WebSockets

## 🚨 Problema Actual
Los WebSockets no están funcionando - los votos no se actualizan en tiempo real en el panel de administración.

## ✅ Solución Implementada

### 1. Correcciones Realizadas

#### En `server.js`:
- ✅ Eliminada importación innecesaria de `lib/realtime.js` (era para Pusher)
- ✅ Agregado `broadcastUpdate('voto_registrado', ...)` en el endpoint `/api/votar`
- ✅ Configuración de WebSocket Server verificada
- ✅ Función `broadcastUpdate` está activa

#### En `AdminView.vue`:
- ✅ Agregada función `conectarWebSocket()`
- ✅ Llamada en `onMounted()`
- ✅ Manejadores de eventos `onmessage`, `onopen`, `onclose`, `onerror`
- ✅ Reconexión automática cada 3 segundos
- ✅ Indicador visual de conexión en el header

### 2. Cómo Probar

#### Opción A: Usando el Archivo de Prueba
1. **Abrir en el navegador**: `test-websocket.html`
2. **Hacer clic en "Conectar"**
3. **Verificar que aparezca**: "🟢 Conectado"
4. **Hacer clic en "Simular Voto"**
5. **Observar en los logs** si llega un mensaje WebSocket

#### Opción B: Probar en el Panel Real
1. **Abrir dos pestañas del navegador**
   - Pestaña 1: Panel de Administración (`http://localhost:5173`)
   - Pestaña 2: Vista de Votación (`http://localhost:5173`)

2. **En la Pestaña 1 (Admin)**:
   - Abrir DevTools (F12)
   - Ir a la pestaña Console
   - Buscar el mensaje: `🔌 Conectando a WebSocket: ws://localhost:3000`
   - Verificar: `✅ WebSocket conectado`

3. **En la Pestaña 2 (Votación)**:
   - Simular un voto de un estudiante

4. **Volver a la Pestaña 1 (Admin)**:
   - En la consola debería aparecer: `📨 Mensaje recibido:` con el evento `voto_registrado`
   - Los datos del dashboard deberían actualizarse automáticamente

### 3. Verificar el Servidor

**Comandos en terminal:**

```bash
# Terminal 1: Servidor Backend (puerto 3000)
node server.js

# Deberías ver:
# 🚀 Servidor HTTP corriendo en http://localhost:3000
# 🔌 Servidor WebSocket corriendo en ws://localhost:3000
# 📊 Base de datos conectada a Turso

# Terminal 2: Servidor Frontend (puerto 5173)
npm run dev
```

### 4. Logs Esperados

#### Cuando un cliente se conecta:
```
✅ Nuevo cliente WebSocket conectado
```

#### Cuando se registra un voto:
```
📡 Broadcast enviado: voto_registrado { candidatoId: 1, timestamp: '2025-11-29T...' }
```

#### Cuando un cliente se desconecta:
```
❌ Cliente WebSocket desconectado
```

### 5. Problemas Comunes

#### ❌ "WebSocket connection failed"
**Causa**: El servidor backend no está corriendo
**Solución**: Ejecutar `node server.js` en una terminal

#### ❌ "net::ERR_CONNECTION_REFUSED"
**Causa**: Puerto 3000 bloqueado o servidor caído
**Solución**: 
- Verificar que no haya otro proceso en el puerto 3000
- Reiniciar el servidor

#### ❌ Los datos no se actualizan
**Causa**: El broadcast no se está enviando
**Solución**:
- Verificar que `broadcastUpdate()` esté llamándose después de insertar el voto
- Revisar los logs del servidor para ver si aparece "📡 Broadcast enviado"

#### ❌ "WebSocket is closed before the connection is established"
**Causa**: URL incorrecta o CORS bloqueando
**Solución**:
- Verificar la URL del WebSocket en AdminView.vue
- En desarrollo debe ser: `ws://localhost:3000`

### 6. Herramientas de Depuración

#### En el Navegador (DevTools):

**Console Tab:**
```javascript
// Ver estado del WebSocket
console.log(ws.readyState)
// 0 = CONNECTING
// 1 = OPEN
// 2 = CLOSING
// 3 = CLOSED
```

**Network Tab:**
- Filtrar por "WS" (WebSocket)
- Ver los mensajes enviados y recibidos
- Verificar que la conexión esté activa

#### En el Servidor:

Agregar más logs temporales en `server.js`:
```javascript
// En broadcastUpdate()
console.log('Clientes conectados:', clients.size);
console.log('Enviando a clientes:', Array.from(clients).length);
```

### 7. Checklist de Verificación

Antes de probar, asegúrate que:

- [ ] El servidor backend está corriendo (`node server.js`)
- [ ] El servidor frontend está corriendo (`npm run dev`)
- [ ] No hay conflictos de puerto (3000 y 5173)
- [ ] Los imports en `server.js` están correctos (sin `lib/realtime.js`)
- [ ] La función `broadcastUpdate()` existe y está siendo llamada
- [ ] El AdminView.vue tiene la función `conectarWebSocket()`
- [ ] No hay errores de compilación en la consola

### 8. Comandos Útiles

```bash
# Ver qué proceso usa el puerto 3000
lsof -i :3000
# o
netstat -tulpn | grep 3000

# Matar proceso en puerto 3000
kill -9 $(lsof -t -i:3000)

# Reiniciar servidores
# Terminal 1:
node server.js

# Terminal 2:
npm run dev
```

### 9. Estado Actual del Código

**✅ Archivos Corregidos:**
- `server.js` - WebSocket Server configurado y broadcasts agregados
- `src/components/AdminView.vue` - Cliente WebSocket implementado
- `test-websocket.html` - Herramienta de prueba creada

**⚠️ Archivos sin Modificar (para producción con Vercel):**
- `api/votar.js` - Usa Pusher (para producción en Vercel)
- `lib/realtime.js` - Usa Pusher (para producción en Vercel)

**Nota**: Para desarrollo local usamos WebSocket nativo. Para producción en Vercel necesitarás Pusher u otro servicio porque Vercel no soporta WebSockets persistentes.

### 10. Próximos Pasos

1. **Reiniciar ambos servidores** (backend y frontend)
2. **Abrir `test-websocket.html`** en el navegador
3. **Hacer clic en "Conectar"** y verificar conexión
4. **Abrir panel de admin** y verificar el indicador "🟢 Tiempo Real"
5. **Hacer una prueba de voto** desde otra pestaña
6. **Verificar que los datos se actualicen** sin recargar

Si después de seguir esta guía los WebSockets siguen sin funcionar, revisar los logs de consola del navegador y del servidor para identificar el error específico.
