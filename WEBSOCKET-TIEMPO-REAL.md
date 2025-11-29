# WebSocket - Actualizaciones en Tiempo Real

Este proyecto ahora utiliza **WebSockets** para actualizar los datos del panel de administración en tiempo real, sin necesidad de recargar la página o hacer polling periódico.

## 🎯 ¿Qué es WebSocket?

WebSocket es un protocolo de comunicación bidireccional que mantiene una conexión persistente entre el cliente y el servidor. A diferencia de HTTP tradicional (petición-respuesta), WebSocket permite que el servidor envíe datos al cliente en cualquier momento.

## 🔧 Implementación

### Backend (server.js)

1. **Servidor WebSocket**: Se crea un servidor WebSocket que corre junto con el servidor HTTP Express.

```javascript
import { WebSocketServer } from 'ws';
import http from 'http';

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
```

2. **Gestión de Clientes**: Se mantiene un Set con todos los clientes conectados.

```javascript
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    
    ws.on('close', () => {
        clients.delete(ws);
    });
});
```

3. **Broadcast de Eventos**: Cuando ocurre un cambio (voto registrado, candidato creado/editado/eliminado), se notifica a todos los clientes conectados.

```javascript
function broadcastUpdate(event, data) {
    const message = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
    clients.forEach((client) => {
        if (client.readyState === 1) { // 1 = OPEN
            client.send(message);
        }
    });
}
```

### Frontend (AdminView.vue)

1. **Conexión Automática**: Al montar el componente, se establece automáticamente la conexión WebSocket.

```javascript
onMounted(() => {
    cargarDashboard()
    cargarCandidatos()
    cargarVotantes()
    conectarWebSocket()
})
```

2. **Reconexión Automática**: Si la conexión se pierde, el cliente intenta reconectar automáticamente después de 3 segundos.

```javascript
ws.onclose = () => {
    wsConnected.value = false
    setTimeout(() => {
        conectarWebSocket()
    }, 3000)
}
```

3. **Actualización de Datos**: Cuando se recibe un mensaje del servidor, se actualizan los datos correspondientes.

```javascript
ws.onmessage = (event) => {
    const message = JSON.parse(event.data)
    
    if (message.event === 'voto_registrado') {
        cargarDashboard()
        cargarVotantes()
    } else if (message.event === 'candidatos_actualizados') {
        cargarCandidatos()
        cargarDashboard()
    }
}
```

## 📊 Eventos Soportados

### `voto_registrado`
Se emite cuando un estudiante vota.

**Payload:**
```json
{
    "event": "voto_registrado",
    "data": {
        "candidatoId": 1,
        "timestamp": "2025-11-29T10:30:00.000Z"
    }
}
```

**Acciones en el cliente:**
- Recarga estadísticas del dashboard
- Recarga lista de votantes

### `candidatos_actualizados`
Se emite cuando se crea, edita o elimina un candidato.

**Payload:**
```json
{
    "event": "candidatos_actualizados",
    "data": {
        "action": "create|update|delete",
        "candidatoId": 1,
        "timestamp": "2025-11-29T10:30:00.000Z"
    }
}
```

**Acciones en el cliente:**
- Recarga lista de candidatos
- Recarga estadísticas del dashboard

## 🎨 Indicador Visual

El panel de administración muestra un indicador visual del estado de la conexión WebSocket en el header:

- **🟢 "Tiempo Real"** (verde pulsante): Conectado
- **⚪ "Desconectado"** (gris): Desconectado

## 🚀 Ventajas

1. **Datos en Tiempo Real**: Los cambios se reflejan instantáneamente en todos los navegadores conectados
2. **Sin Polling**: No se hacen peticiones periódicas innecesarias
3. **Eficiente**: Usa menos recursos que hacer peticiones HTTP cada X segundos
4. **Escalable**: Soporta múltiples administradores viendo el panel simultáneamente
5. **Confiable**: Reconexión automática si se pierde la conexión

## 📝 Notas de Desarrollo

- En desarrollo local, el WebSocket se conecta a `ws://localhost:3000`
- En producción (Vercel), se usa `wss://` (WebSocket seguro sobre HTTPS)
- Los mensajes se envían en formato JSON
- Cada mensaje incluye un timestamp para debugging

## 🔍 Debugging

Para ver los eventos WebSocket en la consola del navegador:

```javascript
// En AdminView.vue, los mensajes se loguean automáticamente:
console.log('📨 Mensaje recibido:', message)
console.log('🗳️ Nuevo voto registrado, actualizando datos...')
console.log('👤 Candidatos actualizados, recargando...')
```

En el servidor:
```javascript
console.log('✅ Nuevo cliente WebSocket conectado')
console.log('❌ Cliente WebSocket desconectado')
console.log('📡 Broadcast enviado:', event, data)
```

## ⚠️ Consideraciones para Vercel

⚠️ **IMPORTANTE**: Vercel NO soporta WebSockets nativamente en su plataforma serverless.

Para usar WebSockets en producción, necesitarías:
1. Usar un servicio externo de WebSocket (Pusher, Ably, Socket.io con servidor dedicado)
2. Desplegar el backend en un servicio que soporte conexiones persistentes (Railway, Render, Heroku)
3. O implementar polling como fallback

Para desarrollo local, WebSockets funcionan perfectamente con el servidor Express.
