class JsonDatabaseService {
    static BIN_ID = process.env.REACT_APP_JSONBIN_BIN_ID || 'default-bin-id';
    static API_KEY = process.env.REACT_APP_JSONBIN_API_KEY || 'default-api-key';
    static API_URL = 'https://api.jsonbin.io/v3/b';

    static defaultData = {
        currentGame: null,
        activeSessions: {},
        lastUpdated: new Date().toISOString()
    };

    static async loadGameData() {
        try {
            // Si no hay configuración, usar localStorage
            if (this.BIN_ID === 'default-bin-id' || this.API_KEY === 'default-api-key') {
                const localData = localStorage.getItem('game_data');
                return localData ? JSON.parse(localData) : { ...this.defaultData };
            }

            const response = await fetch(`${this.API_URL}/${this.BIN_ID}/latest`, {
                headers: {
                    'X-Master-Key': this.API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('JSONBin error');

            const result = await response.json();
            return result.record;
        } catch (error) {
            console.log('Usando datos locales:', error.message);
            const localData = localStorage.getItem('game_data');
            return localData ? JSON.parse(localData) : { ...this.defaultData };
        }
    }

    static async saveGameData(data) {
        data.lastUpdated = new Date().toISOString();

        try {
            if (this.BIN_ID !== 'default-bin-id' && this.API_KEY !== 'default-api-key') {
                await fetch(`${this.API_URL}/${this.BIN_ID}`, {
                    method: 'PUT',
                    headers: {
                        'X-Master-Key': this.API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            }
        } catch (error) {
            console.log('Guardando solo localmente:', error.message);
        }

        localStorage.setItem('game_data', JSON.stringify(data));
        return true;
    }

    static async getCurrentGame() {
        const data = await this.loadGameData();
        return data.currentGame;
    }

    static async saveCurrentGame(game) {
        const data = await this.loadGameData();
        data.currentGame = game;
        return await this.saveGameData(data);
    }

    static async getActiveSessions() {
        const data = await this.loadGameData();
        return data.activeSessions || {};
    }

    static async saveActiveSessions(sessions) {
        const data = await this.loadGameData();
        data.activeSessions = sessions;
        return await this.saveGameData(data);
    }

    static async testConnection() {
        if (this.BIN_ID === 'default-bin-id' || this.API_KEY === 'default-api-key') {
            return false;
        }

        try {
            const response = await fetch(`${this.API_URL}/${this.BIN_ID}/latest`, {
                headers: { 'X-Master-Key': this.API_KEY }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

export default JsonDatabaseService;