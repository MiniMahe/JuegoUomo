class PersistenceService {
    static STORAGE_KEYS = {
        GAME_DATA: 'game_data',
        ACTIVE_SESSIONS: 'active_sessions',
        GAME_VERSION: 'game_version'
    };

    // Simular una "base de datos" en localStorage
    static async initializeGameData() {
        const defaultData = {
            currentGame: null,
            activeSessions: {},
            lastUpdated: new Date().toISOString()
        };

        if (!localStorage.getItem(this.STORAGE_KEYS.GAME_DATA)) {
            await this.saveGameData(defaultData);
        }

        return await this.loadGameData();
    }

    static async loadGameData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.GAME_DATA);
            if (!data) {
                return await this.initializeGameData();
            }

            const parsedData = JSON.parse(data);
            console.log('📂 Datos del juego cargados:', parsedData);
            return parsedData;
        } catch (error) {
            console.error('❌ Error cargando datos del juego:', error);
            return await this.initializeGameData();
        }
    }

    static async saveGameData(data) {
        try {
            data.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEYS.GAME_DATA, JSON.stringify(data));
            localStorage.setItem(this.STORAGE_KEYS.GAME_VERSION, Date.now().toString());

            console.log('💾 Datos del juego guardados:', data);
            return true;
        } catch (error) {
            console.error('❌ Error guardando datos del juego:', error);
            return false;
        }
    }

    // Operaciones específicas para el juego
    static async getCurrentGame() {
        const data = await this.loadGameData();
        return data.currentGame;
    }

    static async saveCurrentGame(game) {
        const data = await this.loadGameData();
        data.currentGame = game;
        return await this.saveGameData(data);
    }

    static async deleteCurrentGame() {
        const data = await this.loadGameData();
        data.currentGame = null;
        data.activeSessions = {};
        return await this.saveGameData(data);
    }

    // Operaciones para sesiones
    static async getActiveSessions() {
        const data = await this.loadGameData();
        return data.activeSessions || {};
    }

    static async saveActiveSessions(sessions) {
        const data = await this.loadGameData();
        data.activeSessions = sessions;
        return await this.saveGameData(data);
    }

    static async updateSession(session) {
        const sessions = await this.getActiveSessions();
        sessions[session.id] = {
            ...session,
            lastUpdated: new Date().toISOString()
        };
        return await this.saveActiveSessions(sessions);
    }

    static async removeSession(sessionId) {
        const sessions = await this.getActiveSessions();
        delete sessions[sessionId];
        return await this.saveActiveSessions(sessions);
    }

    static async cleanupExpiredSessions() {
        const sessions = await this.getActiveSessions();
        const now = new Date();
        const expiredTime = 2 * 60 * 60 * 1000; // 2 horas

        let updated = false;
        Object.keys(sessions).forEach(sessionId => {
            const session = sessions[sessionId];
            const lastActivity = new Date(session.lastActivity || session.lastUpdated);
            if (now - lastActivity > expiredTime) {
                delete sessions[sessionId];
                updated = true;
            }
        });

        if (updated) {
            await this.saveActiveSessions(sessions);
        }
    }

    // Operaciones para participantes
    static async addParticipant(participant) {
        const game = await this.getCurrentGame();
        if (!game) throw new Error('No hay juego activo');

        if (!game.participants) {
            game.participants = [];
        }

        // Verificar si el participante ya existe
        const existingIndex = game.participants.findIndex(p => p.name === participant.name);
        if (existingIndex >= 0) {
            game.participants[existingIndex] = participant;
        } else {
            game.participants.push(participant);
        }

        return await this.saveCurrentGame(game);
    }

    static async removeParticipant(participantName) {
        const game = await this.getCurrentGame();
        if (!game) throw new Error('No hay juego activo');

        game.participants = game.participants.filter(p => p.name !== participantName);
        return await this.saveCurrentGame(game);
    }

    static async updateParticipant(participantName, updates) {
        const game = await this.getCurrentGame();
        if (!game) throw new Error('No hay juego activo');

        const participant = game.participants.find(p => p.name === participantName);
        if (!participant) throw new Error('Participante no encontrado');

        Object.assign(participant, updates);
        return await this.saveCurrentGame(game);
    }

    // Operaciones para objetos
    static async addItem(item) {
        const game = await this.getCurrentGame();
        if (!game) throw new Error('No hay juego activo');

        if (!game.items) {
            game.items = [];
        }

        if (!game.items.includes(item)) {
            game.items.push(item);
        }

        return await this.saveCurrentGame(game);
    }

    static async removeItem(item) {
        const game = await this.getCurrentGame();
        if (!game) throw new Error('No hay juego activo');

        game.items = game.items.filter(i => i !== item);
        return await this.saveCurrentGame(game);
    }

    // Operaciones para ubicaciones
    static async addLocation(location) {
        const game = await this.getCurrentGame();
        if (!game) throw new Error('No hay juego activo');

        if (!game.locations) {
            game.locations = [];
        }

        if (!game.locations.includes(location)) {
            game.locations.push(location);
        }

        return await this.saveCurrentGame(game);
    }

    static async removeLocation(location) {
        const game = await this.getCurrentGame();
        if (!game) throw new Error('No hay juego activo');

        game.locations = game.locations.filter(l => l !== location);
        return await this.saveCurrentGame(game);
    }

    // Exportar datos (para backup o migración)
    static async exportGameData() {
        const data = await this.loadGameData();
        return JSON.stringify(data, null, 2);
    }

    // Importar datos (para restaurar)
    static async importGameData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            return await this.saveGameData(data);
        } catch (error) {
            throw new Error('Datos JSON inválidos');
        }
    }

    // Reset completo
    static async resetAllData() {
        localStorage.removeItem(this.STORAGE_KEYS.GAME_DATA);
        localStorage.removeItem(this.STORAGE_KEYS.GAME_VERSION);
        return await this.initializeGameData();
    }

    // Estadísticas
    static async getStats() {
        const data = await this.loadGameData();
        const game = data.currentGame;

        return {
            hasActiveGame: !!game,
            participantsCount: game ? game.participants.length : 0,
            itemsCount: game ? game.items.length : 0,
            locationsCount: game ? game.locations.length : 0,
            activeSessionsCount: Object.keys(data.activeSessions || {}).length,
            lastUpdated: data.lastUpdated
        };
    }
}

// Inicializar al cargar el servicio
PersistenceService.initializeGameData();

export default PersistenceService;