import SessionService from './sessionService';
import JsonDatabaseService from './jsonDatabaseService';

class GameService {
    // Crear juego
    static async createGame(adminData) {
        const game = {
            id: 'game_' + Date.now(),
            state: 'ready',
            createdAt: new Date().toISOString(),
            participants: adminData.participants.map(name => ({
                name: typeof name === 'string' ? name : name.name,
                assigned: false,
                userName: null,
                joinedAt: null,
                assignedItem: null,
                assignedLocation: null,
                assignedAt: null
            })),
            items: adminData.items || [],
            locations: adminData.locations || [],
            assignments: [],
            name: adminData.name || 'Partida ' + new Date().toLocaleDateString()
        };

        await JsonDatabaseService.saveCurrentGame(game);
        return game;
    }

    // Obtener juego actual
    static async getGame() {
        return await JsonDatabaseService.getCurrentGame();
    }

    // Guardar juego
    static async saveGame(game) {
        await JsonDatabaseService.saveCurrentGame(game);
    }

    // Reiniciar juego
    static async resetGame() {
        await JsonDatabaseService.saveCurrentGame(null);
    }

    // Verificar si usuarios pueden unirse
    static async canUserJoin() {
        const game = await this.getGame();
        return game && game.state === 'ready';
    }

    // Obtener participantes disponibles
    static async getAvailableParticipants() {
        try {
            const game = await this.getGame();
            if (!game) return [];

            const activeSessions = await SessionService.getAllActiveSessions();
            const takenPlayers = new Set(activeSessions.map(session => session.playerName));

            return game.participants.filter(p => !takenPlayers.has(p.name));
        } catch (error) {
            console.error('Error obteniendo participantes:', error);
            return [];
        }
    }

    // Asignar jugador a usuario
    static async assignPlayerToUser(playerName, userName) {
        const game = await this.getGame();
        if (!game) throw new Error('No hay juego activo');

        const isTaken = await SessionService.isPlayerTaken(playerName);
        if (isTaken) throw new Error('Este personaje ya fue seleccionado');

        const participant = game.participants.find(p => p.name === playerName);
        if (!participant) throw new Error('Jugador no encontrado');

        // Actualizar participante
        participant.userName = userName;
        participant.joinedAt = new Date().toISOString();

        // Crear sesión
        await SessionService.createSession(userName, playerName);

        // Guardar cambios
        await this.saveGame(game);

        return participant;
    }

    // Realizar asignaciones aleatorias
    static async performRandomAssignments() {
        const game = await this.getGame();
        if (!game) throw new Error('No hay juego activo');

        const unassignedParticipants = game.participants.filter(p => p.userName && !p.assigned);
        const availableItems = [...game.items];
        const availableLocations = [...game.locations];

        // Validaciones
        if (unassignedParticipants.length === 0) throw new Error('No hay participantes para asignar');
        if (unassignedParticipants.length > availableItems.length) throw new Error('No hay suficientes objetos');
        if (unassignedParticipants.length > availableLocations.length) throw new Error('No hay suficientes ubicaciones');

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

    // Obtener asignación de usuario
    static async getUserAssignment(userName) {
        const game = await this.getGame();
        if (!game) return null;
        return game.participants.find(p => p.userName === userName && p.assigned);
    }

    // Obtener estadísticas del juego
    static async getGameStats() {
        try {
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
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return null;
        }
    }

    // NUEVO: Obtener jugadores conectados
    static async getConnectedPlayers() {
        try {
            const activeSessions = await SessionService.getAllActiveSessions();
            return activeSessions.map(session => ({
                playerName: session.playerName,
                userName: SessionService.maskUserName(session.userName),
                joinedAt: session.createdAt
            }));
        } catch (error) {
            console.error('Error obteniendo jugadores conectados:', error);
            return [];
        }
    }

    // NUEVO: Verificar acceso de admin
    static async canAccessAdmin() {
        try {
            const session = await SessionService.getCurrentSession();
            return !session;
        } catch (error) {
            console.error('Error verificando acceso admin:', error);
            return true;
        }
    }
}

export default GameService;