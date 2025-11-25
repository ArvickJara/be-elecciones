<template>
    <div class="login-page">
        <div class="login-layout">
            <!-- Sección izquierda con imagen de fondo -->
            <div class="background-section">
                <div class="overlay"></div>
            </div>

            <!-- Sección derecha con formulario -->
            <div class="login-container">
                <div class="login-card">
                    <div class="logo-container">
                        <img src="@/assets/cole/logo_mejor.png" alt="Logo" class="logo" />
                    </div>

                    <h2 class="title">Iniciar sesión</h2>

                    <div class="login-options">
                        <!-- Login Estudiante -->
                        <div v-if="loginType === 'student'" class="login-form">
                            <form @submit.prevent="handleStudentLogin">
                                <div class="form-group">
                                    <label for="dni">DNI del Estudiante</label>
                                    <input id="dni" v-model="studentDni" type="text" placeholder="Ingrese su DNI"
                                        maxlength="8" pattern="[0-9]{8}" required :disabled="loading" />
                                </div>
                                <button type="submit" class="btn btn-primary" :disabled="loading">
                                    {{ loading ? 'Validando...' : 'Ingresar' }}
                                </button>
                                <button type="button" class="btn btn-link" @click="loginType = 'select'"
                                    :disabled="loading">
                                    ← Volver
                                </button>
                            </form>
                        </div>

                        <!-- Login Administrador -->
                        <div v-else-if="loginType === 'admin'" class="login-form">
                            <form @submit.prevent="handleAdminLogin">
                                <div class="form-group">
                                    <label for="username">Usuario</label>
                                    <input id="username" v-model="adminUsername" type="text" placeholder="Usuario"
                                        required :disabled="loading" />
                                </div>
                                <div class="form-group">
                                    <label for="password">Contraseña</label>
                                    <input id="password" v-model="adminPassword" type="password"
                                        placeholder="Contraseña" required :disabled="loading" />
                                </div>
                                <button type="submit" class="btn btn-primary" :disabled="loading">
                                    {{ loading ? 'Verificando...' : 'Ingresar' }}
                                </button>
                                <button type="button" class="btn btn-link" @click="loginType = 'select'"
                                    :disabled="loading">
                                    ← Volver
                                </button>
                            </form>
                        </div>

                        <!-- Selección de tipo de login -->
                        <div v-else class="login-select">
                            <div class="login-buttons">
                                <button class="btn btn-student" @click="loginType = 'student'">
                                    <span class="icon-user">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </span>
                                    <span class="btn-text">
                                        <strong>Soy Estudiante</strong>
                                        <small>Acceso para votar</small>
                                    </span>
                                </button>
                            </div>

                            <button class="admin-link-corner" @click="loginType = 'admin'">
                                Panel de administración
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para estudiante que ya votó -->
        <div v-if="mostrarModalYaVoto" class="modal-overlay">
            <div class="modal-content modal-ya-voto">
                <div class="modal-icon">✓</div>
                <h2>Ya has votado</h2>
                <p>Has ejercido tu derecho al voto exitosamente.</p>
                <p class="thank-you">¡Gracias por participar en las elecciones escolares!</p>
                <div class="countdown">
                    Redirigiendo en {{ countdown }} segundos...
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Estado
const loginType = ref('select') // 'select', 'student', 'admin'
const studentDni = ref('')
const adminUsername = ref('')
const adminPassword = ref('')
const loading = ref(false)
const mostrarModalYaVoto = ref(false)
const countdown = ref(5)

// En Vercel, las rutas /api/* se enrutan automáticamente a las funciones serverless
const API_URL = '/api'

// Manejar login de estudiante
const handleStudentLogin = async () => {
    // Validar DNI (8 dígitos)
    if (studentDni.value.length !== 8 || !/^\d+$/.test(studentDni.value)) {
        alert('Por favor, ingrese un DNI válido (8 dígitos)')
        return
    }

    loading.value = true

    try {
        const response = await fetch(`${API_URL}/auth/student`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dni: studentDni.value })
        })

        const data = await response.json()

        if (data.success) {
            // Guardar datos del estudiante en sessionStorage
            sessionStorage.setItem('estudiante', JSON.stringify(data.estudiante))
            // Redirigir a la vista de votación
            router.push({ name: 'vote' })
        } else if (data.yaVoto) {
            // Mostrar modal cuando ya votó
            mostrarModalYaVoto.value = true
            countdown.value = 5

            // Countdown timer
            const interval = setInterval(() => {
                countdown.value--
                if (countdown.value <= 0) {
                    clearInterval(interval)
                    mostrarModalYaVoto.value = false
                    loginType.value = 'select'
                    studentDni.value = ''
                }
            }, 1000)
        } else {
            alert(data.message || 'Error al validar el DNI')
        }
    } catch (error) {
        alert('No se pudo conectar con el servidor. Asegúrate de que esté ejecutándose.')
    } finally {
        loading.value = false
    }
}

// Manejar login de administrador
const handleAdminLogin = async () => {
    if (!adminUsername.value || !adminPassword.value) {
        alert('Por favor, complete todos los campos')
        return
    }

    loading.value = true

    try {
        const response = await fetch(`${API_URL}/auth/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: adminUsername.value,
                password: adminPassword.value
            })
        })

        const data = await response.json()

        if (data.success) {
            // Guardar datos del admin en sessionStorage
            sessionStorage.setItem('admin', JSON.stringify(data.admin))
            // Redirigir al panel de administración
            router.push({ name: 'admin' })
        } else {
            alert(data.message || 'Credenciales incorrectas')
        }
    } catch (error) {
        alert('No se pudo conectar con el servidor')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    overflow: hidden;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.login-layout {
    display: grid;
    grid-template-columns: 58% 42%;
    min-height: 100vh;

    background-color: #f9fafb;
}

/* Sección izquierda con imagen de fondo */
.background-section {
    position: relative;
    background-image: url('@/assets/cole/portada_fondo.png');
    background-size: cover;
    background-position: center;
    overflow: hidden;

    /* AGREGA ESTA LÍNEA */
    border-bottom-right-radius: 550px;
    /* Puedes aumentar o disminuir este número para cambiar la curvatura */
}

.overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1));
    border-bottom-right-radius: 80px;
}

/* Sección derecha con formulario */
.login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9fafb;
    padding: 40px;
}

.login-card {
    position: relative;
    width: 100%;
    max-width: 420px;
    background: white;
    /* CAMBIO: Aumenté el último valor (padding-bottom) a 80px para separar el texto */
    padding: 28px 32px 80px 32px;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.admin-link-corner {
    position: absolute;
    bottom: 20px;
    right: 25px;
    background: none;
    border: none;
    color: #9ca3af;
    /* Color gris suave */
    font-size: 0.8rem;
    text-decoration: underline;
    /* Subrayado */
    cursor: pointer;
    padding: 5px;
    transition: color 0.2s;
}

.admin-link-corner:hover {
    color: #4b5563;
    /* Gris más oscuro al pasar el mouse */
}

.logo-container {
    text-align: center;
    margin-bottom: 20px;
}

.logo {
    width: 150px;
    height: auto;
}

.title {
    font-size: 1.6rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 24px;
    text-align: center;
}

.subtitle {
    font-size: 0.95rem;
    color: #6b7280;
    margin-bottom: 18px;
    text-align: center;
}

.login-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.btn {
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.25s ease;
    font-weight: 500;
    width: 100%;
    padding: 14px 24px;
}

.btn-student,
.btn-admin {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    text-align: left;
    border: 2px solid #e5e7eb;
    background: white;
}

.btn-student:hover {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.btn-admin:hover {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.icon-user {
    font-size: 1.75rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #10b981;
}

.icon-user svg {
    width: 28px;
    height: 28px;
}

.btn-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.btn-text strong {
    color: #1f2937;
    font-size: 1rem;
}

.btn-text small {
    color: #6b7280;
    font-size: 0.8rem;
    font-weight: 400;
}

.btn-primary {
    background: #10b981;
    color: white;
    margin-bottom: 12px;
}

.btn-primary:hover {
    background: #059669;
}

.btn-primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
}

.btn-link {
    background: transparent;
    color: #6b7280;
    text-align: left;
    padding: 8px 0;
    font-size: 0.95rem;
}

.btn-link:hover {
    color: #374151;
}

.login-form {
    animation: fadeIn 0.25s ease;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #374151;
    font-weight: 500;
    font-size: 0.95rem;
}

.form-group input {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
    box-sizing: border-box;
}

.form-group input:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.help-text {
    text-align: center;
    font-size: 0.9rem;
    color: #6b7280;
    margin-top: 15px;
}

.link {
    color: #10b981;
    text-decoration: none;
    font-weight: 500;
}

.link:hover {
    text-decoration: underline;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 1024px) {
    .login-layout {
        grid-template-columns: 1fr;
    }

    .background-section {
        display: none;
    }

    .login-container {
        padding: 20px;
    }
}

@media (max-width: 600px) {
    .logo {
        width: 140px;
    }

    .title {
        font-size: 1.5rem;
    }

    .btn {
        padding: 12px 20px;
        font-size: 0.95rem;
    }
}

/* Modal para estudiante que ya votó */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: fadeIn 0.3s ease;
}

.modal-ya-voto {
    background: white;
    border-radius: 20px;
    padding: 40px;
    max-width: 450px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.4s ease;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-icon {
    width: 80px;
    height: 80px;
    background: #4CAF50;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3em;
    margin: 0 auto 20px;
    animation: scaleIn 0.5s ease 0.2s both;
}

@keyframes scaleIn {
    from {
        transform: scale(0);
    }

    to {
        transform: scale(1);
    }
}

.modal-ya-voto h2 {
    color: #333;
    margin-bottom: 15px;
    font-size: 1.8em;
}

.modal-ya-voto p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 10px;
}

.thank-you {
    color: #4CAF50;
    font-weight: 500;
    font-size: 1.1em;
    margin-top: 15px;
}

.countdown {
    margin-top: 25px;
    padding: 15px;
    background: #f5f5f5;
    border-radius: 10px;
    color: #667eea;
    font-weight: 500;
    font-size: 1.1em;
}
</style>
