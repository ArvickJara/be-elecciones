<template>
    <div class="success-container">
        <div class="success-card">
            <div class="success-icon">✓</div>
            <h1>¡Gracias por Participar!</h1>
            <p class="message">Tu voto ha sido registrado exitosamente.</p>
            <p class="info">Tu participación es fundamental para nuestra democracia escolar.</p>

            <div class="actions">
                <button @click="volverInicio" class="btn btn-primary">
                    Volver al Inicio
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const volverInicio = () => {
    router.push('/')
}
</script>

<style scoped>
.success-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.success-card {
    background: white;
    border-radius: 20px;
    padding: 60px 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 100%;
    text-align: center;
    animation: slideIn 0.5s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.success-icon {
    width: 100px;
    height: 100px;
    background: #4CAF50;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3em;
    margin: 0 auto 30px;
    animation: pop 0.5s ease 0.3s both;
}

@keyframes pop {
    0% {
        transform: scale(0);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
    }
}

h1 {
    color: #333;
    margin-bottom: 20px;
    font-size: 2em;
}

.message {
    color: #4CAF50;
    font-size: 1.2em;
    font-weight: 500;
    margin-bottom: 15px;
}

.info {
    color: #666;
    line-height: 1.6;
    margin-bottom: 30px;
}

.actions {
    margin-top: 30px;
}

.btn {
    padding: 15px 40px;
    border: none;
    border-radius: 8px;
    font-size: 1.1em;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.btn-primary {
    background: #667eea;
    color: white;
}

.btn-primary:hover {
    background: #5568d3;
    transform: scale(1.05);
}

@media (max-width: 600px) {
    .success-card {
        padding: 40px 20px;
    }

    h1 {
        font-size: 1.5em;
    }
}
</style>
