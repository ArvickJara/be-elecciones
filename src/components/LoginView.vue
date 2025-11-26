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
                        <img src="@/assets/cole/logo_es.png" alt="Logo" class="logo" />
                    </div>

                    <h2 class="title">{{ tituloMostrado }}</h2>

                    <div class="login-options">
                        <!-- Login Estudiante -->
                        <div v-if="loginType === 'student'" class="login-form">
                            <form @submit.prevent="handleStudentLogin">
                                <div class="form-group">
                                    <label for="dni">DNI del Estudiante</label>
                                    <input id="dni" v-model="studentDni" type="text" placeholder="Ingrese su DNI"
                                        maxlength="8" pattern="[0-9]{8}" required :disabled="loading" />
                                </div>
                                <div class="form-group">
                                    <label for="dniConfirm">Contraseña</label>
                                    <div class="input-with-icon">
                                        <input id="dniConfirm" v-model="studentDniConfirm"
                                            :type="mostrarPassword ? 'text' : 'password'"
                                            placeholder="Ingrese su contraseña" maxlength="8" pattern="[0-9]{8}"
                                            required :disabled="loading" />
                                        <button type="button" class="toggle-password"
                                            @click="mostrarPassword = !mostrarPassword" :disabled="loading"
                                            tabindex="-1">
                                            <svg v-if="!mostrarPassword" xmlns="http://www.w3.org/2000/svg" fill="none"
                                                viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none"
                                                viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary" :disabled="loading">
                                    {{ loading ? 'Validando...' : 'Ingresar a Votar' }}
                                </button>
                            </form>

                            <button class="admin-link-corner" @click="loginType = 'admin'">
                                Panel de administración
                            </button>
                        </div>

                        <!-- Login Administrador -->
                        <div v-else class="login-form">
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
                                <button type="button" class="btn btn-link" @click="loginType = 'student'"
                                    :disabled="loading">
                                    ← Volver a votación
                                </button>
                            </form>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Estado
const loginType = ref('student') // Por defecto muestra el formulario de estudiante
const studentDni = ref('')
const studentDniConfirm = ref('')
const adminUsername = ref('')
const adminPassword = ref('')
const loading = ref(false)
const mostrarModalYaVoto = ref(false)
const countdown = ref(5)
const mostrarPassword = ref(false) // Estado para mostrar/ocultar contraseña
const tituloMostrado = ref('') // Texto que se va mostrando letra por letra

// Computed property para el título completo
const tituloLogin = computed(() => {
    return loginType.value === 'admin' ? 'Panel de Administración' : 'Sistema de votación digital'
})

// Función para animar el texto tipo máquina de escribir
const animarTexto = (texto) => {
    tituloMostrado.value = ''
    let index = 0

    const interval = setInterval(() => {
        if (index < texto.length) {
            tituloMostrado.value += texto[index]
            index++
        } else {
            clearInterval(interval)
        }
    }, 80) // Velocidad de escritura en milisegundos
}

// Observar cambios en loginType y animar el título
watch(loginType, (newValue) => {
    const nuevoTitulo = newValue === 'admin' ? 'Panel de Administración' : 'Sistema de votación digital'
    animarTexto(nuevoTitulo)
})

// Iniciar la animación al cargar
onMounted(() => {
    animarTexto(tituloLogin.value)
})

// En Vercel, las rutas /api/* se enrutan automáticamente a las funciones serverless
const API_URL = '/api'

// Manejar login de estudiante
const handleStudentLogin = async () => {
    // Validar DNI (8 dígitos)
    if (studentDni.value.length !== 8 || !/^\d+$/.test(studentDni.value)) {
        alert('Por favor, ingrese un DNI válido (8 dígitos)')
        return
    }

    // Validar confirmación de DNI
    if (studentDniConfirm.value.length !== 8 || !/^\d+$/.test(studentDniConfirm.value)) {
        alert('Por favor, confirme su DNI correctamente (8 dígitos)')
        return
    }

    // Verificar que ambos DNI coincidan
    if (studentDni.value !== studentDniConfirm.value) {
        alert('Los DNI no coinciden. Por favor, verifique e intente nuevamente.')
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
                    loginType.value = 'student'
                    studentDni.value = ''
                    studentDniConfirm.value = ''
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
    position: relative;
}

.login-layout {
    min-height: 100vh;
    position: relative;
}

/* Sección izquierda con imagen de fondo - Ahora ocupa todo */
.background-section {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('@/assets/cole/portada_fondo.png');
    background-size: cover;
    background-position: center;
    z-index: 0;
}

.overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.08));
}

/* Sección derecha con formulario - Ahora centrado sobre el fondo */
.login-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 40px;
    z-index: 1;
}

.login-card {
    position: relative;
    width: 100%;
    max-width: 420px;

    /* ✨ Glassmorphism Auténtico */
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);

    padding: 48px 40px 48px 40px;
    border-radius: 24px;

    /* Borde elegante en blanco semitransparente */
    border: 1px solid rgba(255, 255, 255, 0.2);

    /* Sombra elegante */
    box-shadow:
        0 8px 32px 0 rgba(31, 38, 135, 0.2),
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.2);

    animation: fadeIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.admin-link-corner {
    margin-top: 20px;
    width: 100%;
    text-align: right;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    text-decoration: underline;
    cursor: pointer;
    padding: 8px;
    transition: all 0.3s ease;
    display: block;
}

.admin-link-corner:hover {
    color: rgba(255, 255, 255, 0.95);
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
}

.logo-container {
    text-align: center;
    margin-bottom: 24px;
}

.logo {
    width: 190px;
    height: auto;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

.title {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    margin-bottom: 28px;
    text-align: center;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    min-height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cursor {
    display: inline-block;
    margin-left: 4px;
    animation: blink 1s infinite;
    font-weight: 300;
}

@keyframes blink {

    0%,
    49% {
        opacity: 1;
    }

    50%,
    100% {
        opacity: 0;
    }
}

.subtitle {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.9);
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
    border-radius: 12px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    width: 100%;
    padding: 14px 24px;
}

.btn-student,
.btn-admin {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    text-align: left;
    border: 1.5px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 14px;
    color: white;
}

.btn-student:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.btn-admin:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.icon-user {
    font-size: 1.75rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.9);
}

.icon-user svg {
    width: 28px;
    height: 28px;
}

.btn-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.btn-text strong {
    color: white;
    font-size: 1.05rem;
    font-weight: 600;
}

.btn-text small {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.85rem;
    font-weight: 400;
}

.btn-primary {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    margin-bottom: 12px;
    font-weight: 600;
    border: 1.5px solid rgba(255, 255, 255, 0.3);
    margin-top: 8px;
    transition: all 0.3s ease;
}

.btn-primary:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.btn-primary:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    opacity: 0.6;
}

.btn-link {
    background: transparent;
    color: rgba(255, 255, 255, 0.9);
    text-align: left;
    padding: 10px 0;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.btn-link:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
    padding-left: 8px;
}

.login-form {
    animation: fadeIn 0.3s ease;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: rgba(255, 255, 255, 0.95);
    font-weight: 600;
    font-size: 0.95rem;
}

.form-group input {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    color: white;
}

.form-group input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.form-group input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
}

.input-with-icon {
    position: relative;
    width: 100%;
}

.input-with-icon input {
    padding-right: 45px;
}

.toggle-password {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;
    border-radius: 6px;
}

.toggle-password:hover {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.1);
}

.toggle-password:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.toggle-password svg {
    width: 20px;
    height: 20px;
}

.help-text {
    text-align: center;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 15px;
}

.link {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    font-weight: 500;
}

.link:hover {
    text-decoration: underline;
}

@media (max-width: 1024px) {
    .login-container {
        padding: 20px;
    }

    .login-card {
        max-width: 100%;
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

    .login-card {
        padding: 40px 28px 60px 28px;
    }
}

/* Modal para estudiante que ya votó */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: fadeIn 0.3s ease;
}

.modal-ya-voto {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 40px;
    max-width: 450px;
    width: 90%;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
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
    background: rgba(255, 255, 255, 0.25);
    border: 2px solid rgba(255, 255, 255, 0.4);
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
    color: white;
    margin-bottom: 15px;
    font-size: 1.8em;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.modal-ya-voto p {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    margin-bottom: 10px;
}

.thank-you {
    color: rgba(255, 255, 255, 0.95);
    font-weight: 500;
    font-size: 1.1em;
    margin-top: 15px;
}

.countdown {
    margin-top: 25px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    font-size: 1.1em;
}
</style>