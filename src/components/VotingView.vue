<template>
    <div class="voting-container" v-if="estudiante">
        <div class="voting-header">
            <div class="student-info">
                <h2>Bienvenido(a), {{ estudiante.nombreCompleto }}</h2>
                <p class="info-detail">
                    <strong>Grado:</strong> {{ estudiante.grado }} - {{ estudiante.seccion }} |
                    <strong>Nivel:</strong> {{ estudiante.nivel }}
                </p>
                <p class="info-detail">
                    <strong>Institución:</strong> {{ estudiante.institucion }}
                </p>
            </div>
            <button class="btn-logout" @click="cerrarSesion">Cerrar Sesión</button>
        </div>

        <div class="voting-content">
            <h1 class="main-title">Elecciones Escolares 2025</h1>
            <p class="subtitle">Selecciona tu candidato(a) preferido(a)</p>

            <div v-if="loading" class="loading">
                <div class="spinner"></div>
                <p>Cargando candidatos...</p>
            </div>

            <div v-else-if="error" class="error-message">
                <p>{{ error }}</p>
                <button @click="cargarCandidatos" class="btn btn-primary">Reintentar</button>
            </div>

            <div v-else class="candidatos-grid">
                <div v-for="candidato in candidatos" :key="candidato.id" class="candidato-card"
                    :class="{ selected: candidatoSeleccionado === candidato.id }"
                    @click="seleccionarCandidato(candidato.id)">
                    <div class="card-header">
                        <img :src="candidato.foto_url" :alt="candidato.nombre_completo" class="candidato-foto" />
                        <div class="candidato-lista">{{ candidato.lista }}</div>
                    </div>
                    <div class="card-body">
                        <h3>{{ candidato.nombre_completo }}</h3>
                        <div class="propuestas">
                            <h4>Propuestas:</h4>
                            <p>{{ candidato.propuestas }}</p>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="check-icon" v-if="candidatoSeleccionado === candidato.id">✓</div>
                    </div>
                </div>
            </div>

            <div v-if="!loading && !error && candidatos.length > 0" class="voting-actions">
                <button class="btn btn-vote" :disabled="!candidatoSeleccionado || votando" @click="confirmarVoto">
                    {{ votando ? 'Registrando voto...' : 'Confirmar Voto' }}
                </button>
            </div>
        </div>

        <!-- Modal de confirmación -->
        <div v-if="mostrarConfirmacion" class="modal-overlay" @click="mostrarConfirmacion = false">
            <div class="modal-content" @click.stop>
                <h2>Confirmar Voto</h2>
                <p>¿Estás seguro de votar por <strong>{{ getNombreCandidato(candidatoSeleccionado) }}</strong>?</p>
                <p class="warning">⚠️ Esta acción no se puede deshacer</p>
                <div class="modal-actions">
                    <button class="btn btn-secondary" @click="mostrarConfirmacion = false">Cancelar</button>
                    <button class="btn btn-primary" @click="registrarVoto">Confirmar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Obtener datos del estudiante desde sessionStorage
const estudianteData = sessionStorage.getItem('estudiante')
const estudiante = estudianteData ? JSON.parse(estudianteData) : null

// Si no hay datos, redirigir al login
if (!estudiante) {
    router.push('/')
}

const candidatos = ref([])
const candidatoSeleccionado = ref(null)
const loading = ref(true)
const error = ref(null)
const votando = ref(false)
const mostrarConfirmacion = ref(false)

// En Vercel, las rutas /api/* se enrutan automáticamente a las funciones serverless
const API_URL = '/api'

onMounted(() => {
    cargarCandidatos()
})

const cargarCandidatos = async () => {
    loading.value = true
    error.value = null

    try {
        const response = await fetch(`${API_URL}/candidatos`)
        const data = await response.json()

        if (data.success) {
            candidatos.value = data.candidatos
        } else {
            error.value = data.message || 'Error al cargar candidatos'
        }
    } catch (err) {
        error.value = 'No se pudo conectar con el servidor. Verifica que esté ejecutándose.'
    } finally {
        loading.value = false
    }
}

const seleccionarCandidato = (id) => {
    candidatoSeleccionado.value = id
}

const confirmarVoto = () => {
    if (!candidatoSeleccionado.value) return
    mostrarConfirmacion.value = true
}

const registrarVoto = async () => {
    votando.value = true

    try {
        const response = await fetch(`${API_URL}/votar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estudianteId: estudiante.id,
                candidatoId: candidatoSeleccionado.value
            })
        })

        const data = await response.json()

        if (data.success) {
            // Limpiar datos del estudiante después de votar
            sessionStorage.removeItem('estudiante')
            router.push('/success')
        } else {
            alert(data.message || 'Error al registrar el voto')
        }
    } catch (err) {
        alert('Error al conectar con el servidor')
    } finally {
        votando.value = false
        mostrarConfirmacion.value = false
    }
}

const getNombreCandidato = (id) => {
    const candidato = candidatos.value.find(c => c.id === id)
    return candidato ? candidato.nombre_completo : ''
}

const cerrarSesion = () => {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        // Limpiar datos del estudiante
        sessionStorage.removeItem('estudiante')
        router.push('/')
    }
}
</script>

<style scoped>
.voting-container {
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
}

.voting-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('@/assets/cole/portada2.png');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    opacity: 1;
    z-index: 0;
}

.voting-header {
    position: relative;
    z-index: 1;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    padding: 20px 40px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #2e7d32;
}

.student-info h2 {
    margin: 0 0 8px 0;
    color: #1b5e20;
    font-size: 1.5em;
    font-weight: 700;
}

.info-detail {
    margin: 4px 0;
    color: #555;
    font-size: 0.95em;
}

.info-detail strong {
    color: #2e7d32;
}

.btn-logout {
    padding: 12px 28px;
    background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
    color: white;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95em;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(229, 57, 53, 0.3);
}

.btn-logout:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(229, 57, 53, 0.4);
}

.voting-content {
    position: relative;
    z-index: 1;
    max-width: 1400px;
    margin: 40px auto;
    padding: 40px;
}

.main-title {
    text-align: center;
    color: white;
    margin-bottom: 8px;
    font-size: 2.8em;
    font-weight: 800;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
    letter-spacing: -0.5px;
}

.subtitle {
    text-align: center;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 50px;
    font-size: 1.3em;
    font-weight: 300;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
}

.loading {
    text-align: center;
    padding: 60px;
}

.spinner {
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-top: 5px solid white;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.loading p {
    color: white;
    font-size: 1.1em;
}

.error-message {
    text-align: center;
    padding: 40px;
    color: white;
    background: rgba(244, 67, 54, 0.9);
    border-radius: 15px;
    backdrop-filter: blur(10px);
}

.candidatos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 30px;
    margin-bottom: 40px;
}

.candidato-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    position: relative;
}

.candidato-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 20px;
    border: 3px solid transparent;
    transition: all 0.3s ease;
    pointer-events: none;
}

.candidato-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
}

.candidato-card.selected {
    transform: translateY(-10px) scale(1.03);
    box-shadow: 0 20px 60px rgba(46, 125, 50, 0.4);
}

.candidato-card.selected::before {
    border-color: #2e7d32;
}

.card-header {
    position: relative;
    background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
    padding: 30px 20px 25px;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.card-header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.1);
        opacity: 0.8;
    }
}

.candidato-foto {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    border: 6px solid white;
    background: white;
    object-fit: cover;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
}

.candidato-card:hover .candidato-foto {
    transform: scale(1.08);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
}

.candidato-lista {
    background: white;
    color: #1b5e20;
    padding: 8px 20px;
    border-radius: 25px;
    font-weight: 700;
    margin-top: 15px;
    font-size: 1em;
    display: inline-block;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    position: relative;
    z-index: 1;
    letter-spacing: 0.5px;
}

.card-body {
    padding: 25px;
    background: linear-gradient(to bottom, #fafafa 0%, white 100%);
}

.card-body h3 {
    color: #1b5e20;
    margin-bottom: 18px;
    text-align: center;
    font-size: 1.4em;
    font-weight: 700;
}

.propuestas {
    background: white;
    padding: 18px;
    border-radius: 12px;
    margin-top: 12px;
    border-left: 4px solid #2e7d32;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.propuestas h4 {
    color: #2e7d32;
    margin: 0 0 12px 0;
    font-size: 1em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.propuestas p {
    color: #555;
    margin: 0;
    font-size: 0.95em;
    line-height: 1.7;
}

.card-footer {
    padding: 20px;
    text-align: center;
    min-height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f9;
}

.check-icon {
    background: linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%);
    color: white;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8em;
    font-weight: bold;
    box-shadow: 0 4px 20px rgba(76, 175, 80, 0.4);
    animation: checkBounce 0.5s ease;
}

@keyframes checkBounce {
    0% {
        transform: scale(0);
    }
    50% {
        transform: scale(1.2);
    }
    100% {
        transform: scale(1);
    }
}

.voting-actions {
    text-align: center;
    margin-top: 50px;
}

.btn {
    padding: 14px 28px;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
}

.btn-vote {
    background: linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%);
    color: white;
    padding: 18px 60px;
    font-size: 1.3em;
    box-shadow: 0 8px 30px rgba(76, 175, 80, 0.4);
    border: none;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.btn-vote:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(76, 175, 80, 0.5);
}

.btn-vote:disabled {
    background: linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%);
    cursor: not-allowed;
    box-shadow: none;
}

.btn-primary {
    background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(46, 125, 50, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(46, 125, 50, 0.4);
}

.btn-secondary {
    background: #f5f5f5;
    color: #333;
    border: 2px solid #ddd;
}

.btn-secondary:hover {
    background: #e8e8e8;
    border-color: #ccc;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.modal-content {
    background: white;
    border-radius: 20px;
    padding: 40px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideUp {
    from {
        transform: translateY(50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-content h2 {
    color: #1b5e20;
    margin-bottom: 20px;
    font-size: 1.8em;
    font-weight: 700;
}

.modal-content p {
    color: #555;
    margin-bottom: 12px;
    line-height: 1.8;
    font-size: 1.05em;
}

.modal-content .warning {
    color: #ff6f00;
    font-weight: 600;
    margin-top: 25px;
    padding: 15px;
    background: #fff3e0;
    border-radius: 10px;
    border-left: 4px solid #ff6f00;
}

.modal-actions {
    display: flex;
    gap: 15px;
    margin-top: 30px;
}

.modal-actions .btn {
    flex: 1;
}

@media (max-width: 768px) {
    .voting-header {
        flex-direction: column;
        gap: 15px;
        padding: 20px;
    }

    .voting-content {
        padding: 20px;
        margin: 20px auto;
    }

    .candidatos-grid {
        grid-template-columns: 1fr;
        gap: 25px;
    }

    .main-title {
        font-size: 2em;
    }

    .subtitle {
        font-size: 1.1em;
    }

    .btn-vote {
        padding: 16px 40px;
        font-size: 1.1em;
    }
}
</style>
