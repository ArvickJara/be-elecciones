import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../components/LoginView.vue'
import VotingView from '../components/VotingView.vue'
import SuccessView from '../components/SuccessView.vue'
import AdminView from '../components/AdminView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'login',
            component: LoginView
        },
        {
            path: '/vote',
            name: 'vote',
            component: VotingView,
            beforeEnter: (to, from, next) => {
                // Verificar que haya datos del estudiante en sessionStorage
                const estudianteData = sessionStorage.getItem('estudiante')
                if (!estudianteData) {
                    next('/')
                } else {
                    next()
                }
            }
        },
        {
            path: '/success',
            name: 'success',
            component: SuccessView
        },
        {
            path: '/admin',
            name: 'admin',
            component: AdminView,
            beforeEnter: (to, from, next) => {
                // Verificar que haya datos del admin en sessionStorage
                const adminData = sessionStorage.getItem('admin')
                if (!adminData) {
                    next('/')
                } else {
                    next()
                }
            }
        }
    ]
})

export default router