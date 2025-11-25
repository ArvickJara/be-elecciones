-- Tabla de candidatos
CREATE TABLE IF NOT EXISTS candidatos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_completo TEXT NOT NULL,
    foto_url TEXT,
    lista TEXT NOT NULL,
    propuestas TEXT,
    orden INTEGER DEFAULT 0,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de votos
CREATE TABLE IF NOT EXISTS votos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudiante_id INTEGER NOT NULL,
    candidato_id INTEGER NOT NULL,
    fecha_voto DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    FOREIGN KEY (candidato_id) REFERENCES candidatos(id),
    UNIQUE(estudiante_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_votos_estudiante ON votos(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_votos_candidato ON votos(candidato_id);

-- Datos de ejemplo: Insertar candidatos
INSERT INTO candidatos (nombre_completo, lista, propuestas, orden, foto_url) VALUES
('María González Pérez', 'Lista A - Cambio Estudiantil', 'Mejora de infraestructura, más actividades deportivas, biblioteca digital', 1, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'),
('Carlos Rodríguez López', 'Lista B - Futuro Brillante', 'Internet gratis, más talleres artísticos, mejora del comedor', 2, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'),
('Ana Martínez Silva', 'Lista C - Juntos por el Cole', 'Áreas verdes, reciclaje, apoyo psicológico estudiantil', 3, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana');
