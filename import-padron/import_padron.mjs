import 'dotenv/config';
import { createClient } from '@libsql/client';
import XLSX from 'xlsx';

// Conexión a Turso
const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

/**
 * Convierte valores "SI/NO", "VALIDADO", etc. a 0/1
 */
function toBoolInt(value) {
    if (!value) return 0;
    const v = String(value).trim().toUpperCase();
    if (['SI', 'SÍ', 'VALIDADO', '1'].includes(v)) return 1;
    return 0;
}

/**
 * Intenta convertir una fecha de Excel a 'YYYY-MM-DD'
 */
function toISODate(value) {
    if (!value) return null;
    // Si viene como Date
    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }
    // Si viene como string 'dd/mm/yyyy'
    const s = String(value).trim();
    const parts = s.split('/');
    if (parts.length === 3) {
        const [d, m, y] = parts;
        return `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    // Último recurso: devolver el string tal cual
    return s;
}

/**
 * Inserta o actualiza institución educativa y devuelve su id
 */
async function getOrCreateInstitucion(codigoModular, nombreIE, nivel) {
    if (!codigoModular) {
        throw new Error('Falta CÓDIGO MODULAR para una fila');
    }

    const result = await db.execute({
        sql: `
      INSERT INTO instituciones_educativas (codigo_modular, nombre_ie, nivel)
      VALUES (?, ?, ?)
      ON CONFLICT(codigo_modular) DO UPDATE SET
        nombre_ie = excluded.nombre_ie,
        nivel = excluded.nivel
      RETURNING id;
    `,
        args: [String(codigoModular).trim(), nombreIE || 'SIN NOMBRE', nivel],
    });

    return result.rows[0].id;
}

/**
 * Inserta o actualiza estudiante y devuelve su id
 */
async function getOrCreateEstudiante(row) {
    const tipoDocumento = row['TIPO DE DOCUMENTO'];
    const numeroDocumento = row['NÚMERO DE DOCUMENTO'];
    const codigoEst = row['CÓDIGO DEL ESTUDIANTE'];
    const apePat = row['APELLIDO PATERNO'];
    const apeMat = row['APELLIDO MATERNO'];
    const nombres = row['NOMBRES'];
    const sexo = row['SEXO'];
    const fechaNac = toISODate(row['FECHA DE NACIMIENTO']);
    const edad = row['EDAD (AL 31 DE MARZO)'];

    if (!numeroDocumento) {
        throw new Error('Fila sin NÚMERO DE DOCUMENTO, no se puede crear estudiante');
    }

    const result = await db.execute({
        sql: `
      INSERT INTO estudiantes (
        tipo_documento,
        numero_documento,
        codigo_estudiante,
        apellido_paterno,
        apellido_materno,
        nombres,
        sexo,
        fecha_nacimiento,
        edad_al_31_marzo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(numero_documento) DO UPDATE SET
        tipo_documento    = excluded.tipo_documento,
        codigo_estudiante = excluded.codigo_estudiante,
        apellido_paterno  = excluded.apellido_paterno,
        apellido_materno  = excluded.apellido_materno,
        nombres           = excluded.nombres,
        sexo              = excluded.sexo,
        fecha_nacimiento  = excluded.fecha_nacimiento,
        edad_al_31_marzo  = excluded.edad_al_31_marzo
      RETURNING id;
    `,
        args: [
            tipoDocumento || 'DNI',
            String(numeroDocumento).trim(),
            codigoEst ? String(codigoEst).trim() : null,
            apePat || '',
            apeMat || '',
            nombres || '',
            sexo || null,
            fechaNac,
            edad != null ? Number(edad) : null,
        ],
    });

    return result.rows[0].id;
}

/**
 * Inserta registro en padron_matricula
 */
async function insertPadron(row, anio, nivel, institucionId, estudianteId) {
    const item = row['ITEM'];
    const grado = row['GRADO'] || row['GRADO ']; // por si hay espacios
    const seccion = row['SECCIÓN'] || row['SECCION'];
    const validadoReniec = row['VALIDADO CON RENIEC'];
    const estadoMat = row['ESTADO DE MATRICULA'];
    const tipoVacante = row['TIPO DE VACANTE'];

    await db.execute({
        sql: `
      INSERT INTO padron_matricula (
        estudiante_id,
        institucion_id,
        anio,
        item,
        grado,
        seccion,
        validado_reniec,
        estado_matricula,
        tipo_vacante,
        nivel
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
        args: [
            estudianteId,
            institucionId,
            anio,
            item != null ? Number(item) : null,
            grado || '',
            seccion || '',
            toBoolInt(validadoReniec),
            estadoMat || null,
            tipoVacante || null,
            nivel,
        ],
    });
}

/**
 * Función principal: lee un Excel de padrón y lo importa
 */
async function importarPadron(filePath, nivel, anio) {
    console.log(`\n=== Importando ${filePath} (${nivel} ${anio}) ===`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Leer todo como array de arrays
    const allData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

    console.log(`Filas totales: ${allData.length}`);

    let count = 0;
    let currentCodigoModular = null;
    let currentNombreIE = null;
    let institucionId = null;

    // Recorrer desde la fila 7 (datos de la institución está en fila 7, estudiantes empiezan en fila 12)
    for (let i = 7; i < allData.length; i++) {
        const row = allData[i];

        try {
            // Si la fila tiene datos en la columna 4 (CÓDIGO MODULAR), es una institución
            if (row[4] && String(row[4]).match(/^\d{7}$/)) {
                currentCodigoModular = String(row[4]).trim();
                currentNombreIE = row[5] ? String(row[5]).trim() : 'SIN NOMBRE';
                institucionId = await getOrCreateInstitucion(currentCodigoModular, currentNombreIE, nivel);
                console.log(`  📍 Institución: ${currentCodigoModular} - ${currentNombreIE}`);
                continue;
            }

            // Si la fila tiene ITEM en columna 0, es un estudiante
            if (row[0] && typeof row[0] === 'number' && row[7]) {
                // Si no tenemos institución actual, saltar
                if (!institucionId) {
                    console.warn('  ⚠️ Estudiante sin institución, saltando...');
                    continue;
                }

                // Construir objeto con los datos del estudiante
                const estudianteRow = {
                    'TIPO DE DOCUMENTO': row[3] || 'DNI',
                    'NÚMERO DE DOCUMENTO': row[7] ? String(row[7]).trim() : null,
                    'CÓDIGO DEL ESTUDIANTE': row[10] ? String(row[10]).trim() : null,
                    'APELLIDO PATERNO': row[12] || '',
                    'APELLIDO MATERNO': row[16] || '',
                    'NOMBRES': row[19] || '',
                    'SEXO': row[22] || null,
                    'FECHA DE NACIMIENTO': row[23] || null,
                    'EDAD (AL 31 DE MARZO)': row[24] || null,
                    'ITEM': row[0],
                    'GRADO': row[1] || '',
                    'SECCIÓN': row[2] || '',
                    'VALIDADO CON RENIEC': row[8] || null,
                    'ESTADO DE MATRICULA': row[25] || null,
                    'TIPO DE VACANTE': row[26] || null,
                };

                const estudianteId = await getOrCreateEstudiante(estudianteRow);
                await insertPadron(estudianteRow, anio, nivel, institucionId, estudianteId);

                count++;
                if (count % 50 === 0) {
                    console.log(`  → ${count} estudiantes importados...`);
                }
            }

        } catch (err) {
            console.error(`Error en fila ${i}:`, err.message);
        }
    }

    console.log(`✅ Importación completada. Estudiantes insertados: ${count}`);
}// Ejecutar importaciones
(async () => {
    try {
        // Ajusta las rutas a los archivos que subiste
        await importarPadron('./data/padron de estudiantes de primaria-2025.xlsx', 'PRIMARIA', 2025);
        await importarPadron('./data/Padron de estudiantes de secundaria-2025.xlsx', 'SECUNDARIA', 2025);

        console.log('\n✅ Todo terminado');
        process.exit(0);
    } catch (err) {
        console.error('Error general:', err);
        process.exit(1);
    }
})();
