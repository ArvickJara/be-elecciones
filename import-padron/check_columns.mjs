import XLSX from 'xlsx';

const workbook = XLSX.readFile('./data/padron de estudiantes de primaria-2025.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Leer todo como array
const allData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

console.log('=== Filas 6-15 para ver la estructura ===');
for (let i = 6; i < 16; i++) {
    console.log(`\nFila ${i}:`, allData[i]);
}
