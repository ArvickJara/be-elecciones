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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

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
    background: #f3f3f3;
    padding: 20px;
}

.voting-header {
    background: white;
    border-radius: 15px;
    padding: 20px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.student-info h2 {
    margin: 0 0 10px 0;
    color: #333;
}

.info-detail {
    margin: 5px 0;
    color: #666;
    font-size: 0.9em;
}

.btn-logout {
    padding: 10px 20px;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-logout:hover {
    background: #d32f2f;
}

.voting-content {
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.main-title {
    text-align: center;
    color: #333;
    margin-bottom: 10px;
    font-size: 2em;
}

.subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 30px;
    font-size: 1.1em;
}

.loading {
    text-align: center;
    padding: 40px;
}

.spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
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

.error-message {
    text-align: center;
    padding: 40px;
    color: #f44336;
}

.candidatos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.candidato-card {
    border: 3px solid #e0e0e0;
    border-radius: 15px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    background: white;
}

.candidato-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.candidato-card.selected {
    border-color: #4CAF50;
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.4);
}

.card-header {
    position: relative;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    text-align: center;
}

.candidato-foto {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 5px solid white;
    background: white;
    object-fit: cover;
}

.candidato-lista {
    background: rgba(255, 255, 255, 0.95);
    color: #667eea;
    padding: 8px 15px;
    border-radius: 20px;
    font-weight: bold;
    margin-top: 15px;
    font-size: 0.9em;
}

.card-body {
    padding: 20px;
}

.card-body h3 {
    color: #333;
    margin-bottom: 15px;
    text-align: center;
}

.propuestas {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 10px;
    margin-top: 10px;
}

.propuestas h4 {
    color: #667eea;
    margin: 0 0 10px 0;
    font-size: 0.95em;
}

.propuestas p {
    color: #666;
    margin: 0;
    font-size: 0.9em;
    line-height: 1.5;
}

.card-footer {
    padding: 15px;
    text-align: center;
    min-height: 50px;
}

.check-icon {
    background: #4CAF50;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5em;
    font-weight: bold;
}

.voting-actions {
    text-align: center;
    margin-top: 30px;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.btn-vote {
    background: #4CAF50;
    color: white;
    padding: 15px 50px;
    font-size: 1.2em;
}

.btn-vote:hover:not(:disabled) {
    background: #45a049;
    transform: scale(1.05);
}

.btn-vote:disabled {
    background: #cccccc;
    cursor: not-allowed;
}

.btn-primary {
    background: #667eea;
    color: white;
}

.btn-primary:hover {
    background: #5568d3;
}

.btn-secondary {
    background: #e0e0e0;
    color: #333;
}

.btn-secondary:hover {
    background: #d0d0d0;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 15px;
    padding: 30px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
    color: #333;
    margin-bottom: 15px;
}

.modal-content p {
    color: #666;
    margin-bottom: 10px;
    line-height: 1.6;
}

.modal-content .warning {
    color: #ff9800;
    font-weight: 500;
    margin-top: 20px;
}

.modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 25px;
}

.modal-actions .btn {
    flex: 1;
}

@media (max-width: 768px) {
    .voting-header {
        flex-direction: column;
        gap: 15px;
    }

    .candidatos-grid {
        grid-template-columns: 1fr;
    }

    .main-title {
        font-size: 1.5em;
    }
}
</style>
