<template>
    <div class="admin-container">
        <!-- Header -->
        <header class="admin-header">
            <div class="header-content">
                <h1>Panel de Administración</h1>
                <div class="admin-info">
                    <span class="ws-status" :class="{ connected: wsConnected }">
                        <span class="ws-indicator"></span>
                        {{ wsConnected ? 'Tiempo Real' : 'Desconectado' }}
                    </span>
                    <span class="admin-name">
                        <User :size="20" />
                        {{ adminUsername }}
                    </span>
                    <button @click="cerrarSesion" class="btn-logout">
                        <LogOut :size="18" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </header>

        <!-- Tabs de navegación -->
        <div class="tabs-container">
            <div class="tabs">
                <button v-for="tab in tabs" :key="tab.id" :class="['tab', { active: activeTab === tab.id }]"
                    @click="activeTab = tab.id">
                    <component :is="tab.icon" :size="20" class="tab-icon" />
                    <span>{{ tab.name }}</span>
                </button>
            </div>
        </div>

        <!-- Contenido -->
        <main class="admin-content">
            <!-- Dashboard / Estadísticas -->
            <div v-if="activeTab === 'dashboard'" class="tab-content">
                <div class="section-title">
                    <BarChart3 :size="28" />
                    <h2>Dashboard</h2>
                </div>

                <!-- Cards de estadísticas -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon stat-primary">
                            <Vote :size="32" />
                        </div>
                        <div class="stat-data">
                            <h3>{{ stats.totalVotos }}</h3>
                            <p>Total de Votos</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon stat-info">
                            <Users :size="32" />
                        </div>
                        <div class="stat-data">
                            <h3>{{ stats.totalEstudiantes }}</h3>
                            <p>Total de Estudiantes</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon stat-success">
                            <TrendingUp :size="32" />
                        </div>
                        <div class="stat-data">
                            <h3>{{ participacionPorcentaje }}%</h3>
                            <p>Participación</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon stat-warning">
                            <Trophy :size="32" />
                        </div>
                        <div class="stat-data">
                            <h3>{{ stats.candidatos }}</h3>
                            <p>Candidatos</p>
                        </div>
                    </div>
                </div>

                <!-- Flash Electoral -->
                <div class="flash-electoral">
                    <div class="flash-header">
                        <div class="flash-logo">
                            <Vote :size="32" />
                            <div class="flash-title-group">
                                <h2>FLASH ELECTORAL</h2>
                                <p>BOCA DE URNA - RESULTADOS EN VIVO</p>
                            </div>
                        </div>
                        <div class="flash-year">2025</div>
                    </div>

                    <div v-if="loading" class="loading">
                        <Loader2 :size="40" class="spin" />
                        <p>Cargando resultados...</p>
                    </div>
                    
                    <div v-else class="candidatos-resultados">
                        <div v-for="(candidato, index) in resultadosOrdenados" :key="candidato.id" 
                             class="candidato-resultado"
                             :class="{ 'ganador': index === 0 }">
                            <div class="candidato-header">
                                <div class="candidato-foto-wrapper">
                                    <img :src="candidato.foto_url" :alt="candidato.nombre_completo" class="candidato-foto-resultado" />
                                    <div v-if="index === 0" class="corona-ganador">
                                        <Trophy :size="24" />
                                    </div>
                                </div>
                                <div class="candidato-datos">
                                    <div class="candidato-nombre-resultado">{{ candidato.nombre_completo }}</div>
                                    <div class="candidato-lista-badge" :style="{ backgroundColor: getColorLista(index) }">
                                        {{ candidato.lista }}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="barra-votos-wrapper">
                                <div class="porcentaje-grande">{{ calcularPorcentaje(candidato.total_votos) }}%</div>
                                <div class="barra-votos-container">
                                    <div class="barra-votos-fill" 
                                         :style="{ 
                                             height: calcularPorcentaje(candidato.total_votos) + '%',
                                             backgroundColor: getColorLista(index)
                                         }">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gestión de Candidatos -->
            <div v-if="activeTab === 'candidatos'" class="tab-content">
                <div class="section-header">
                    <div class="section-title">
                        <Trophy :size="28" />
                        <h2>Gestión de Candidatos</h2>
                    </div>
                    <button @click="mostrarFormularioCandidato = true" class="btn btn-primary">
                        <Plus :size="18" />
                        Nuevo Candidato
                    </button>
                </div>

                <div v-if="loadingCandidatos" class="loading">
                    <Loader2 :size="40" class="spin" />
                    <p>Cargando candidatos...</p>
                </div>

                <div v-else-if="candidatos.length === 0" class="empty-state">
                    <AlertCircle :size="48" />
                    <p>No hay candidatos registrados</p>
                    <button @click="mostrarFormularioCandidato = true" class="btn btn-primary">
                        <Plus :size="18" />
                        Crear Primer Candidato
                    </button>
                </div>

                <div v-else class="candidatos-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Foto</th>
                                <th>Nombre Completo</th>
                                <th>Lista</th>
                                <th>Propuestas</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="candidato in candidatos" :key="candidato.id">
                                <td>
                                    <img :src="candidato.foto_url" :alt="candidato.nombre_completo"
                                        class="candidato-avatar" />
                                </td>
                                <td>{{ candidato.nombre_completo }}</td>
                                <td><span class="badge">{{ candidato.lista }}</span></td>
                                <td class="propuestas-cell">{{ candidato.propuestas }}</td>
                                <td>
                                    <span :class="['status-badge', candidato.activo ? 'active' : 'inactive']">
                                        {{ candidato.activo ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="actions">
                                        <button @click="editarCandidato(candidato)" class="btn-icon btn-edit"
                                            title="Editar">
                                            <Edit2 :size="18" />
                                        </button>
                                        <button @click="eliminarCandidato(candidato.id)" class="btn-icon btn-delete"
                                            title="Eliminar">
                                            <Trash2 :size="18" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Lista de Votantes -->
            <div v-if="activeTab === 'votantes'" class="tab-content">
                <div class="section-title">
                    <CheckCircle2 :size="28" />
                    <h2>Estudiantes que Votaron</h2>
                </div>

                <div class="votantes-toolbar">
                    <div class="search-box">
                        <Search :size="20" class="search-icon" />
                        <input v-model="searchVotante" type="text" placeholder="Buscar por DNI o nombre..."
                            class="search-input" />
                    </div>
                    <button class="btn btn-export" @click="exportarVotantesExcel"
                        :disabled="votantesFiltrados.length === 0">
                        <Download :size="18" />
                        Exportar Excel
                    </button>
                </div>

                <div v-if="loadingVotantes" class="loading">
                    <Loader2 :size="40" class="spin" />
                    <p>Cargando votantes...</p>
                </div>

                <div v-else class="votantes-table">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>DNI</th>
                                <th>Nombre Completo</th>
                                <th>Grado</th>
                                <th>Sección</th>
                                <th>Fecha de Voto</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(votante, index) in votantesFiltrados" :key="votante.id">
                                <td>{{ index + 1 }}</td>
                                <td><span class="dni-badge">{{ votante.dni }}</span></td>
                                <td>{{ votante.nombre_completo }}</td>
                                <td>{{ votante.grado }}</td>
                                <td>{{ votante.seccion }}</td>
                                <td>{{ formatearFecha(votante.fecha_voto) }}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div v-if="votantesFiltrados.length === 0" class="empty-state">
                        <Search :size="48" />
                        <p>No se encontraron votantes</p>
                    </div>
                </div>
            </div>
        </main>

        <!-- Modal: Formulario de Candidato -->
        <div v-if="mostrarFormularioCandidato" class="modal-overlay" @click="cerrarFormulario">
            <div class="modal-content modal-large" @click.stop>
                <div class="modal-header">
                    <div class="modal-title">
                        <component :is="candidatoEditando ? Edit2 : UserPlus" :size="24" />
                        <h2>{{ candidatoEditando ? 'Editar Candidato' : 'Nuevo Candidato' }}</h2>
                    </div>
                    <button @click="cerrarFormulario" class="btn-close">
                        <X :size="24" />
                    </button>
                </div>

                <form @submit.prevent="guardarCandidato" class="candidato-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Nombre Completo *</label>
                            <input v-model="formCandidato.nombre_completo" type="text" required
                                placeholder="Ej: María González Pérez" />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Lista *</label>
                            <input v-model="formCandidato.lista" type="text" required
                                placeholder="Ej: Lista A - Cambio Estudiantil" />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Icono del Partido *</label>
                            <div class="upload-container">
                                <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect"
                                    class="file-input" id="foto-upload" />
                                <label for="foto-upload" class="file-label">
                                    <component :is="subiendoImagen ? Loader2 : Plus" :size="20"
                                        :class="{ spin: subiendoImagen }" />
                                    {{ subiendoImagen ? 'Subiendo imagen...' : 'Seleccionar imagen' }}
                                </label>
                                <div v-if="formCandidato.foto_url" class="image-preview">
                                    <img :src="formCandidato.foto_url" alt="Preview" />
                                    <button type="button" @click="eliminarImagen" class="btn-remove-image">
                                        <X :size="16" />
                                    </button>
                                </div>
                            </div>
                            <small>Se recomienda una imagen cuadrada (ej: 400x400px) en formato PNG o JPG</small>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Propuestas *</label>
                            <textarea v-model="formCandidato.propuestas" rows="4" required
                                placeholder="Describe las propuestas del candidato..."></textarea>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Orden</label>
                            <input v-model.number="formCandidato.orden" type="number" min="0" />
                            <small>Orden de aparición (menor número aparece primero)</small>
                        </div>

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input v-model="formCandidato.activo" type="checkbox" />
                                Candidato activo
                            </label>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="button" @click="cerrarFormulario" class="btn btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary" :disabled="guardando">
                            {{ guardando ? 'Guardando...' : 'Guardar Candidato' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal: Confirmar Cierre de Sesión -->
        <div v-if="mostrarModalCerrarSesion" class="modal-overlay" @click="cancelarCerrarSesion">
            <div class="modal-content modal-small" @click.stop>
                <div class="modal-header">
                    <div class="modal-title">
                        <LogOut :size="24" />
                        <h2>Cerrar Sesión</h2>
                    </div>
                    <button @click="cancelarCerrarSesion" class="btn-close">
                        <X :size="24" />
                    </button>
                </div>

                <div class="modal-body">
                    <p>¿Estás seguro que deseas cerrar sesión?</p>
                    <p class="modal-subtitle">Tendrás que volver a iniciar sesión para acceder al panel de
                        administración.</p>
                </div>

                <div class="modal-actions">
                    <button @click="cancelarCerrarSesion" class="btn btn-secondary">
                        Cancelar
                    </button>
                    <button @click="confirmarCerrarSesion" class="btn btn-danger">
                        <LogOut :size="18" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import {
    User, LogOut, BarChart3, Vote, Users, TrendingUp, Trophy,
    Plus, Edit2, Trash2, CheckCircle2, Search, Loader2,
    AlertCircle, X, UserPlus, Download
} from 'lucide-vue-next'

const router = useRouter()

// Obtener datos del admin desde sessionStorage
const adminData = sessionStorage.getItem('admin')
const adminUsername = ref(adminData ? JSON.parse(adminData).username : 'Admin')

// WebSocket
let ws = null
const wsConnected = ref(false)

// Estado
const activeTab = ref('dashboard')
const loading = ref(true)
const loadingCandidatos = ref(true)
const loadingVotantes = ref(true)
const guardando = ref(false)
const mostrarModalCerrarSesion = ref(false)
const subiendoImagen = ref(false)
const fileInput = ref(null)

const stats = ref({
    totalVotos: 0,
    totalEstudiantes: 0,
    candidatos: 0
})

const resultados = ref([])
const candidatos = ref([])
const votantes = ref([])
const searchVotante = ref('')
const pollingId = ref(null)
const pollingActivo = ref(false)

// Formulario de candidato
const mostrarFormularioCandidato = ref(false)
const candidatoEditando = ref(null)
const formCandidato = ref({
    nombre_completo: '',
    lista: '',
    foto_url: '',
    propuestas: '',
    orden: 0,
    activo: true
})

// En Vercel, las rutas /api/* se enrutan automáticamente a las funciones serverless
const API_URL = '/api'
const POLLING_INTERVAL = Number(import.meta.env.VITE_VOTES_POLL_MS) || 5000

const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'candidatos', name: 'Candidatos', icon: Trophy },
    { id: 'votantes', name: 'Votantes', icon: CheckCircle2 }
]

// Computed
const participacionPorcentaje = computed(() => {
    if (stats.value.totalEstudiantes === 0) return 0
    return ((stats.value.totalVotos / stats.value.totalEstudiantes) * 100).toFixed(1)
})

const votantesFiltrados = computed(() => {
    if (!searchVotante.value) return votantes.value

    const search = searchVotante.value.toLowerCase()
    return votantes.value.filter(v =>
        v.dni.includes(search) ||
        v.nombre_completo.toLowerCase().includes(search)
    )
})

const resultadosOrdenados = computed(() => {
    return [...resultados.value].sort((a, b) => b.total_votos - a.total_votos)
})

// Métodos
onMounted(() => {
    cargarDashboard()
    cargarCandidatos()
    cargarVotantes()
    iniciarPolling()
})

// Desmontar componente
onUnmounted(() => {
    detenerPolling()
})

const cargarDashboard = async () => {
    loading.value = true
    try {
        const response = await fetch(`${API_URL}/resultados`)
        const data = await response.json()

        if (data.success) {
            resultados.value = data.resultados
            stats.value.totalVotos = data.totalVotos
            stats.value.candidatos = data.resultados.length
        }

        // Obtener total de estudiantes
        const statsResponse = await fetch(`${API_URL}/admin/stats`)
        const statsData = await statsResponse.json()
        if (statsData.success) {
            stats.value.totalEstudiantes = statsData.totalEstudiantes
        }
    } catch (error) {
        console.error('Error:', error)
    } finally {
        loading.value = false
    }
}

const cargarCandidatos = async () => {
    loadingCandidatos.value = true
    try {
        const response = await fetch(`${API_URL}/admin/candidatos`)
        const data = await response.json()

        if (data.success) {
            candidatos.value = data.candidatos
        }
    } catch (error) {
        console.error('Error:', error)
    } finally {
        loadingCandidatos.value = false
    }
}

const cargarVotantes = async () => {
    loadingVotantes.value = true
    try {
        const response = await fetch(`${API_URL}/admin/votantes`)
        const data = await response.json()

        if (data.success) {
            votantes.value = data.votantes
        }
    } catch (error) {
        console.error('Error:', error)
    } finally {
        loadingVotantes.value = false
    }
}

const exportarVotantesExcel = () => {
    if (!votantesFiltrados.value.length) {
        alert('No hay votantes para exportar')
        return
    }

    const datos = votantesFiltrados.value.map((v, index) => ({
        '#': index + 1,
        DNI: v.dni,
        'Nombre Completo': v.nombre_completo,
        Grado: v.grado,
        Sección: v.seccion,
        'Fecha de Voto': formatearFecha(v.fecha_voto)
    }))

    const hoja = XLSX.utils.json_to_sheet(datos)
    const libro = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(libro, hoja, 'Votantes')

    const fechaArchivo = new Date().toISOString().split('T')[0]
    XLSX.writeFile(libro, `votantes-${fechaArchivo}.xlsx`)
}

const iniciarPolling = () => {
    detenerPolling()
    pollingActivo.value = true
    wsConnected.value = true
    console.log(`🔄 Polling iniciado cada ${POLLING_INTERVAL}ms`)
    
    pollingId.value = setInterval(() => {
        cargarDashboard()
        cargarVotantes()
    }, POLLING_INTERVAL)
}

const detenerPolling = () => {
    if (pollingId.value) {
        clearInterval(pollingId.value)
        pollingId.value = null
        pollingActivo.value = false
        wsConnected.value = false
        console.log('⏸️ Polling detenido')
    }
}

const calcularPorcentaje = (votos) => {
    if (stats.value.totalVotos === 0) return 0
    return ((votos / stats.value.totalVotos) * 100).toFixed(1)
}

const getColorBarra = (candidato) => {
    const colores = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0']
    const index = resultados.value.findIndex(c => c.id === candidato.id)
    return colores[index % colores.length]
}

const getColorLista = (index) => {
    const colores = [
        '#c62828', // Rojo intenso para el primero
        '#1565c0', // Azul oscuro
        '#2e7d32', // Verde
        '#f57c00', // Naranja
        '#6a1b9a', // Morado
        '#00838f'  // Cyan oscuro
    ]
    return colores[index % colores.length]
}

const editarCandidato = (candidato) => {
    candidatoEditando.value = candidato
    formCandidato.value = { ...candidato }
    mostrarFormularioCandidato.value = true
}

const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida')
        return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB')
        return
    }

    await subirImagenCloudinary(file)
}

const subirImagenCloudinary = async (file) => {
    subiendoImagen.value = true

    try {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

        if (!cloudName || !uploadPreset) {
            alert('Cloudinary no está configurado. Por favor configura las variables de entorno.')
            return
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', uploadPreset)
        formData.append('folder', 'candidatos')

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        )

        const data = await response.json()

        if (data.secure_url) {
            formCandidato.value.foto_url = data.secure_url
            // Imagen subida exitosamente (sin alerta)
        } else {
            alert('Error al subir la imagen')
        }
    } catch (error) {
        console.error('Error:', error)
        alert('Error al conectar con Cloudinary')
    } finally {
        subiendoImagen.value = false
        // Limpiar el input
        if (fileInput.value) {
            fileInput.value.value = ''
        }
    }
}

const eliminarImagen = () => {
    formCandidato.value.foto_url = ''
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

const eliminarCandidato = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este candidato?')) return

    try {
        const response = await fetch(`${API_URL}/admin/candidatos/${id}`, {
            method: 'DELETE'
        })

        const data = await response.json()

        if (data.success) {
            alert('Candidato eliminado exitosamente')
            cargarCandidatos()
            cargarDashboard()
        } else {
            alert(data.message || 'Error al eliminar')
        }
    } catch (error) {
        alert('Error al conectar con el servidor')
    }
}

const guardarCandidato = async () => {
    // Validar que haya una foto
    if (!formCandidato.value.foto_url) {
        alert('Por favor sube el icono del partido')
        return
    }

    guardando.value = true

    try {

        const url = candidatoEditando.value
            ? `${API_URL}/admin/candidatos/${candidatoEditando.value.id}`
            : `${API_URL}/admin/candidatos`

        const method = candidatoEditando.value ? 'PUT' : 'POST'

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formCandidato.value)
        })

        const data = await response.json()

        if (data.success) {
            alert(candidatoEditando.value ? 'Candidato actualizado' : 'Candidato creado')
            cerrarFormulario()
            cargarCandidatos()
            cargarDashboard()
        } else {
            alert(data.message || 'Error al guardar')
        }
    } catch (error) {
        alert('Error al conectar con el servidor')
    } finally {
        guardando.value = false
    }
}

const cerrarFormulario = () => {
    mostrarFormularioCandidato.value = false
    candidatoEditando.value = null
    formCandidato.value = {
        nombre_completo: '',
        lista: '',
        foto_url: '',
        propuestas: '',
        orden: 0,
        activo: true
    }
}

const formatearFecha = (fecha) => {
    if (!fecha) return '-'
    return new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        dateStyle: 'short',
        timeStyle: 'medium'
    }).format(new Date(fecha))
}

const cerrarSesion = () => {
    mostrarModalCerrarSesion.value = true
}

const confirmarCerrarSesion = () => {
    sessionStorage.removeItem('admin')
    router.push('/')
}

const cancelarCerrarSesion = () => {
    mostrarModalCerrarSesion.value = false
}
</script>

<style scoped>
.admin-container {
    min-height: 100vh;
    background: #f5f7fa;
}

.admin-header {
    background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
    color: white;
    padding: 20px 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-content h1 {
    margin: 0;
    font-size: 1.8em;
}

.admin-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.admin-name {
    font-weight: 500;
}

.ws-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    font-size: 0.9em;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
}

.ws-status.connected {
    color: white;
}

.ws-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
}

.ws-status.connected .ws-indicator {
    background: #4CAF50;
    animation: pulse 2s infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.btn-logout {
    padding: 8px 20px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-logout:hover {
    background: rgba(255, 255, 255, 0.3);
}

.tabs-container {
    background: white;
    border-bottom: 1px solid #e0e0e0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.tabs {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    gap: 5px;
}

.tab {
    padding: 15px 25px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-weight: 500;
    transition: all 0.3s;
}

.tab:hover {
    color: #2e7d32;
    background: #f5f7fa;
}

.tab.active {
    color: #2e7d32;
    border-bottom-color: #2e7d32;
}

.tab-icon {
    font-size: 1.2em;
}

.admin-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 30px 20px;
}

.tab-content h2 {
    color: #333;
    margin-bottom: 25px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    gap: 20px;
}

.stat-icon {
    font-size: 3em;
    line-height: 1;
}

.stat-data h3 {
    margin: 0;
    font-size: 2em;
    color: #333;
}

.stat-data p {
    margin: 5px 0 0;
    color: #666;
}

/* Flash Electoral */
.flash-electoral {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
    border: 2px solid #c62828;
    max-height: 75vh;
    display: flex;
    flex-direction: column;
}

.flash-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 2px solid #c62828;
    flex-shrink: 0;
}

.flash-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    color: white;
}

.flash-logo svg {
    color: #c62828;
    width: 24px;
    height: 24px;
}

.flash-title-group h2 {
    margin: 0;
    color: white;
    font-size: 1em;
    font-weight: 800;
    letter-spacing: 0.3px;
}

.flash-title-group p {
    margin: 2px 0 0;
    color: #c62828;
    font-size: 0.6em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.flash-year {
    background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%);
    color: white;
    font-size: 1.2em;
    font-weight: 900;
    padding: 6px 16px;
    border-radius: 25px;
    border: 2px solid white;
    box-shadow: 0 3px 12px rgba(198, 40, 40, 0.4);
}

.candidatos-resultados {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    max-height: calc(75vh - 80px);
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 8px;
}

.candidatos-resultados::-webkit-scrollbar {
    width: 6px;
}

.candidatos-resultados::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.candidatos-resultados::-webkit-scrollbar-thumb {
    background: #c62828;
    border-radius: 10px;
}

.candidato-resultado {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 12px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    height: 100%;
}

.candidato-resultado:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-5px);
}

.candidato-resultado.ganador {
    background: linear-gradient(135deg, rgba(198, 40, 40, 0.25) 0%, rgba(183, 28, 28, 0.15) 100%);
    border: 3px solid #c62828;
    box-shadow: 0 0 25px rgba(198, 40, 40, 0.5);
}

.candidato-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    width: 100%;
}

.candidato-foto-wrapper {
    position: relative;
}

.candidato-foto-resultado {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: 3px solid white;
    object-fit: cover;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.candidato-resultado.ganador .candidato-foto-resultado {
    border-color: #ffd700;
    box-shadow: 0 0 25px rgba(255, 215, 0, 0.8);
}

.corona-ganador {
    position: absolute;
    top: -6px;
    right: -6px;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    color: #1a1a1a;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
    box-shadow: 0 3px 10px rgba(255, 215, 0, 0.6);
    animation: bounce 2s ease-in-out infinite;
}

.corona-ganador svg {
    width: 16px;
    height: 16px;
}

@keyframes bounce {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-5px);
    }
}

.candidato-datos {
    flex: 1;
}

.candidato-nombre-resultado {
    color: white;
    font-size: 0.9em;
    font-weight: 700;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    line-height: 1.2;
}

.candidato-lista-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 15px;
    color: white;
    font-weight: 700;
    font-size: 0.7em;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    margin-bottom: 3px;
}

.barra-votos-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: 100%;
    margin-top: auto;
    flex: 1;
    justify-content: flex-end;
}

.barra-votos-container {
    width: 50px;
    height: 120px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.2);
    position: relative;
    display: flex;
    align-items: flex-end;
}

.barra-votos-fill {
    width: 100%;
    transition: height 1.5s cubic-bezier(0.4, 0, 0.2, 1);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
    box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.2);
    animation: fillBarVertical 1.5s ease-out;
    display: flex;
    align-items: center;
    justify-content: center;
}

@keyframes fillBarVertical {
    from {
        height: 0 !important;
    }
}

.porcentaje-grande {
    color: white;
    font-size: 1.5em;
    font-weight: 900;
    text-align: center;
    text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.6);
    order: -1;
}

.candidato-resultado.ganador .porcentaje-grande {
    color: #ffd700;
    text-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;
}

.btn-primary {
    background: #2e7d32;
    color: white;
}

.btn-primary:hover {
    background: #256428;
}

.btn-secondary {
    background: #e0e0e0;
    color: #333;
}

.btn-secondary:hover {
    background: #d0d0d0;
}

.btn-danger {
    background: #f44336;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-danger:hover {
    background: #d32f2f;
}

.candidatos-table,
.votantes-table {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    background: #f5f7fa;
}

th {
    padding: 15px;
    text-align: left;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #e0e0e0;
}

td {
    padding: 15px;
    border-bottom: 1px solid #f0f0f0;
    color: #666;
}

.candidato-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
}

.badge {
    display: inline-block;
    padding: 4px 12px;
    background: #2e7d32;
    color: white;
    border-radius: 20px;
    font-size: 0.85em;
}

.propuestas-cell {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85em;
    font-weight: 500;
}

.status-badge.active {
    background: #c8e6c9;
    color: #2e7d32;
}

.status-badge.inactive {
    background: #ffcdd2;
    color: #c62828;
}

.actions {
    display: flex;
    gap: 10px;
}

.btn-icon {
    padding: 5px 10px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2em;
    transition: transform 0.2s;
}

.btn-icon:hover {
    transform: scale(1.2);
}

.search-box {
    margin-bottom: 20px;
}

.votantes-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 15px;
    justify-content: space-between;
    margin-bottom: 20px;
}

.search-input {
    width: 100%;
    padding: 12px 20px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1em;
}

.search-input:focus {
    outline: none;
    border-color: #2e7d32;
}

.loading {
    text-align: center;
    padding: 40px;
    color: #666;
}

.empty-state {
    text-align: center;
    padding: 40px;
    color: #999;
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
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-large {
    max-width: 800px;
}

.modal-small {
    max-width: 450px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25px;
    border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
    margin: 0;
    color: #333;
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.5em;
    cursor: pointer;
    color: #666;
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.btn-close:hover {
    background: #f0f0f0;
}

.modal-body {
    padding: 25px;
}

.modal-body p {
    margin: 0 0 10px;
    color: #333;
    font-size: 1.05em;
}

.modal-subtitle {
    color: #666 !important;
    font-size: 0.95em !important;
}

.candidato-form {
    padding: 25px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: 500;
    color: #333;
}

.form-group input,
.form-group textarea {
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1em;
    font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #2e7d32;
}

.form-group small {
    color: #999;
    font-size: 0.85em;
}

.upload-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.file-input {
    display: none;
}

.file-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px 24px;
    background: #2e7d32;
    color: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
    width: fit-content;
}

.file-label:hover {
    background: #256428;
}

.image-preview {
    position: relative;
    width: 150px;
    height: 150px;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid #e0e0e0;
}

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.btn-remove-image {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(244, 67, 54, 0.9);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.btn-remove-image:hover {
    background: rgba(211, 47, 47, 1);
    transform: scale(1.1);
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
}

.modal-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin: 25px;
    padding-top: 20px;
    border-top: 1px solid #e0e0e0;
}

@media (max-width: 1024px) {
    .charts-section {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: 15px;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    table {
        font-size: 0.9em;
    }

    th,
    td {
        padding: 10px;
    }
}

/* Estilos adicionales para iconos */
.admin-name,
.btn-logout {
    display: flex;
    align-items: center;
    gap: 8px;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 25px;
}

.section-title h2 {
    margin: 0;
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.stat-primary {
    background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
}

.stat-info {
    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
}

.stat-success {
    background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
}

.stat-warning {
    background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
}

.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.search-box {
    position: relative;
    margin-bottom: 20px;
}

.search-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
}

.search-input {
    width: 100%;
    padding: 12px 20px 12px 45px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1em;
}

.btn-export {
    background: #2e7d32;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-export:hover {
    background: #256428;
}

.btn-export:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-icon {
    padding: 8px;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-edit {
    color: #2196F3;
}

.btn-edit:hover {
    background: #E3F2FD;
}

.btn-delete {
    color: #f44336;
}

.btn-delete:hover {
    background: #FFEBEE;
}

.modal-title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.modal-title h2 {
    margin: 0;
}

.dni-badge {
    background: #E3F2FD;
    color: #1976D2;
    padding: 4px 12px;
    border-radius: 6px;
    font-weight: 500;
    font-family: 'Courier New', monospace;
}

.candidato-nombre {
    font-weight: 500;
    color: #333;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #999;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.empty-state p {
    font-size: 1.1em;
    margin: 0;
}

/* Responsive Flash Electoral */
@media (max-width: 768px) {
    .flash-electoral {
        padding: 20px;
    }

    .flash-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }

    .flash-title-group h2 {
        font-size: 1.3em;
    }

    .flash-year {
        font-size: 1.8em;
        padding: 8px 20px;
    }

    .candidato-header {
        flex-direction: column;
        text-align: center;
    }

    .candidato-foto-resultado {
        width: 80px;
        height: 80px;
    }

    .candidato-nombre-resultado {
        font-size: 1.1em;
    }

    .barra-votos-wrapper {
        flex-direction: column;
        gap: 10px;
    }

    .barra-votos-container {
        height: 40px;
    }

    .porcentaje-grande {
        font-size: 2em;
        text-align: center;
        min-width: auto;
    }
}
</style>
