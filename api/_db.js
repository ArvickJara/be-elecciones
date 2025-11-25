// api/_db.js
// Módulo compartido para la conexión a Turso
import { createClient } from '@libsql/client';

let dbInstance = null;

export function getDb() {
    if (!dbInstance) {
        dbInstance = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
    }
    return dbInstance;
}
