import Pusher from 'pusher'

let pusherInstance = null

const hasRealtimeConfig = () => (
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET &&
    process.env.PUSHER_CLUSTER
)

const getPusher = () => {
    if (!hasRealtimeConfig()) {
        return null
    }

    if (!pusherInstance) {
        pusherInstance = new Pusher({
            appId: process.env.PUSHER_APP_ID,
            key: process.env.PUSHER_KEY,
            secret: process.env.PUSHER_SECRET,
            cluster: process.env.PUSHER_CLUSTER,
            useTLS: true
        })
    }

    return pusherInstance
}

export const notifyVotoRegistrado = async (payload = {}) => {
    try {
        const pusher = getPusher()
        if (!pusher) {
            console.warn('Realtime (Pusher) no configurado, omitiendo evento')
            return
        }

        await pusher.trigger('votos', 'registrado', payload)
    } catch (error) {
        console.error('Error enviando evento realtime:', error)
    }
}
