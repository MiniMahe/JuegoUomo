class JsonDatabaseService {
    static BIN_ID = process.env.REACT_APP_JSONBIN_BIN_ID || 'default-bin-id';
    static API_KEY = process.env.REACT_APP_JSONBIN_API_KEY || 'default-api-key';
    static API_URL = 'https://api.jsonbin.io/v3/b';

    static defaultData = {
        currentGame: null,
        activeSessions: {},
        lastUpdated: new Date().toISOString()
    };

    // Cargar datos
    static async loadGameData() {
        try {
            // Intentar cargar de JSONBin primero
            const remoteData = await this.fetchFromJsonBin();
            if (remoteData) {
                // Actualizar local storage con datos remotos
                localStorage.setItem('game_data', JSON.stringify(remoteData));
                return remoteData;
            }

            // Fallback a localStorage
            const localData = localStorage.getItem('game_data');
            if (localData) {
                return JSON.parse(localData);
            }
            return { ...this.defaultData };
        } catch (error) {
            console.log('Error cargando datos, usando valores por defecto');
            return { ...this.defaultData };
        }
    }

    // Guardar datos
    static async saveGameData(data) {
        try {
            data.lastUpdated = new Date().toISOString();

            // Guardar localmente primero (optimista)
            localStorage.setItem('game_data', JSON.stringify(data));

            // Guardar en JSONBin
            await this.saveToJsonBin(data);

            return true;
        } catch (error) {
            console.error('Error guardando datos:', error);
            return false;
        }
    }

    // Helpers JSONBin
    static async fetchFromJsonBin() {
        if (!this.BIN_ID || this.BIN_ID === 'default-bin-id') return null;
        try {
            const response = await fetch(`${this.API_URL}/${this.BIN_ID}/latest`, {
                headers: {
                    'X-Master-Key': this.API_KEY
                }
            });
            if (!response.ok) return null;
            const data = await response.json();
            return data.record;
        } catch (error) {
            console.error('JSONBin fetch error:', error);
            return null;
        }
    }

    static async saveToJsonBin(data) {
        if (!this.BIN_ID || this.BIN_ID === 'default-bin-id') return false;
        try {
            const response = await fetch(`${this.API_URL}/${this.BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.API_KEY
                },
                body: JSON.stringify(data)
            });
            return response.ok;
        } catch (error) {
            console.error('JSONBin save error:', error);
            return false;
        }
    }

    // Operaciones del juego
    static async getCurrentGame() {
        const data = await this.loadGameData();
        return data.currentGame;
    }

    static async saveCurrentGame(game) {
        const data = await this.loadGameData();
        data.currentGame = game;
        return await this.saveGameData(data);
    }

    // Operaciones de sesiones
    static async getActiveSessions() {
        const data = await this.loadGameData();
        return data.activeSessions || {};
    }

    static async saveActiveSessions(sessions) {
        const data = await this.loadGameData();
        data.activeSessions = sessions;
        return await this.saveGameData(data);
    }

    // Actualizar sesión específica
    static async updateSession(session) {
        const sessions = await this.getActiveSessions();
        sessions[session.id] = {
            ...session,
            lastUpdated: new Date().toISOString()
        };
        return await this.saveActiveSessions(sessions);
    }

    // Limpiar sesiones expiradas
    static async cleanupExpiredSessions() {
        const sessions = await this.getActiveSessions();
        const now = new Date();
        const expiredTime = 2 * 60 * 60 * 1000;

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

    // Test de conexión
    static async testConnection() {
        const remoteData = await this.fetchFromJsonBin();
        return !!remoteData;
    }
}

export default JsonDatabaseService;