import SessionService from './sessionService';
import JsonDatabaseService from './jsonDatabaseService';

class GameService {
    static async createGame(adminData) {
        const game = {
            id: 'game_' + Date.now(),
            state: 'ready',
            createdAt: new Date().toISOString(),
            participants: adminData.participants.map(name => ({
                name: typeof name === 'string' ? name : name.name,
                assigned: false,
                userName: null
            })),
            items: adminData.items,
            locations: adminData.locations,
            assignments: [],
            name: adminData.name
        };

        await JsonDatabaseService.saveCurrentGame(game);
        return game;
    }

    static async getGame() {
        return await JsonDatabaseService.getCurrentGame();
    }

    static async saveGame(game) {
        await JsonDatabaseService.saveCurrentGame(game);
    }

    static async resetGame() {
        await JsonDatabaseService.saveCurrentGame(null);
    }

    static async canUserJoin() {
        const game = await this.getGame();
        return game && game.state === 'ready';
    }

    static async getAvailableParticipants() {
        const game = await this.getGame();
        if (!game) return [];

        const activeSessions = await SessionService.getAllActiveSessions();
        const takenPlayers = new Set(activeSessions.map(session => session.playerName));

        return game.participants.filter(p => !takenPlayers.has(p.name));
    }

    static async assignPlayerToUser(playerName, userName) {
        const game = await this.getGame();
        if (!game) throw new Error('No hay juego activo');

        const isTaken = await SessionService.isPlayerTaken(playerName);
        if (isTaken) throw new Error('Personaje ya seleccionado');

        const participant = game.participants.find(p => p.name === playerName);
        if (!participant) throw new Error('Jugador no encontrado');

        participant.userName = userName;
        participant.joinedAt = new Date().toISOString();

        await SessionService.createSession(userName, playerName);
        await this.saveGame(game);

        return participant;
    }

    static async performRandomAssignments() {
        const game = await this.getGame();
        if (!game) throw new Error('No hay juego activo');

        const unassignedParticipants = game.participants.filter(p => p.userName && !p.assigned);
        const availableItems = [...game.items];
        const availableLocations = [...game.locations];

        // Validaciones
        if (unassignedParticipants.length === 0) throw new Error('No hay participantes');
        if (unassignedParticipants.length > availableItems.length) throw new Error('No hay objetos suficientes');
        if (unassignedParticipants.length > availableLocations.length) throw new Error('No hay ubicaciones suficientes');

        // Mezclar arrays
        const shuffleArray = (array) => {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        };

        const shuffledItems = shuffleArray(availableItems);
        const shuffledLocations = shuffleArray(availableLocations);

        // Asignar
        unassignedParticipants.forEach((participant, index) => {
            participant.assignedItem = shuffledItems[index];
            participant.assignedLocation = shuffledLocations[index];
            participant.assigned = true;
            participant.assignedAt = new Date().toISOString();
        });

        await this.saveGame(game);
        return game;
    }

    static async getUserAssignment(userName) {
        const game = await this.getGame();
        if (!game) return null;
        return game.participants.find(p => p.userName === userName && p.assigned);
    }

    static async getGameStats() {
        const game = await this.getGame();
        if (!game) return null;

        const activeSessions = await SessionService.getAllActiveSessions();
        const assignedPlayers = game.participants.filter(p => p.assigned).length;

        return {
            totalPlayers: game.participants.length,
            joinedPlayers: activeSessions.length,
            assignedPlayers: assignedPlayers,
            availablePlayers: game.participants.length - activeSessions.length,
            state: game.state
        };
    }
}

export default GameService;