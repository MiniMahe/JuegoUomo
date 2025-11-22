// Script para actualizar manualmente el game-data.json
// Este script se ejecutaría en el servidor o durante el build

const fs = require('fs');
const path = require('path');

const gameDataPath = path.join(__dirname, '../public/game-data.json');

function updateGameData(newData) {
    try {
        const currentData = JSON.parse(fs.readFileSync(gameDataPath, 'utf8'));
        const updatedData = { ...currentData, ...newData };
        fs.writeFileSync(gameDataPath, JSON.stringify(updatedData, null, 2));
        console.log('✅ game-data.json actualizado correctamente');
    } catch (error) {
        console.error('❌ Error actualizando game-data.json:', error);
    }
}

// Ejemplo de uso:
// updateGameData({ currentGame: null, activeSessions: {} });