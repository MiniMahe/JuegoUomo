import SessionService from './sessionService';

class GameService {
    static GAME_STATES = {
        SETUP: 'setup',
        READY: 'ready',
        IN_PROGRESS: 'in_progress',
        ASSIGNED: 'assigned',
        COMPLETED: 'completed'
    };

    static createGame(adminData) {
        const game = {
            id: 'game_' + Date.now(),
            state: this.GAME_STATES.SETUP,
            createdAt: new Date().toISOString(),
            participants: [],
            items: [],
            locations: [],
            assignments: [],
            settings: {
                maxPlayers: 50,
                allowDuplicateNames: false
            },
            ...adminData
        };

        this.saveGame(game);
        return game;
    }

    static getGame() {
        try {
            const game = JSON.parse(localStorage.getItem('currentGame') || 'null');
            return game;
        } catch (error) {
            console.error('Error loading game:', error);
            return null;
        }
    }

    static saveGame(game) {
        localStorage.setItem('currentGame', JSON.stringify(game));
        localStorage.setItem('gameVersion', Date.now().toString());
    }

    static updateGameState(newState) {
        const game = this.getGame();
        if (game) {
            game.state = newState;
            game.lastStateChange = new Date().toISOString();
            this.saveGame(game);
        }
        return game;
    }

    static startGame() {
        return this.updateGameState(this.GAME_STATES.READY);
    }

    static beginAssignments() {
        return this.updateGameState(this.GAME_STATES.IN_PROGRESS);
    }

    static completeAssignments() {
        return this.updateGameState(this.GAME_STATES.ASSIGNED);
    }

    static resetGame() {
        localStorage.removeItem('currentGame');
        localStorage.removeItem('gameVersion');
        // SessionService.cleanupExpiredSessions(); // Comentado temporalmente
    }

    static canUserJoin() {
        const game = this.getGame();
        return game && game.state === this.GAME_STATES.READY;
    }

    static isGameInProgress() {
        const game = this.getGame();
        return game && (
            game.state === this.GAME_STATES.IN_PROGRESS ||
            game.state === this.GAME_STATES.ASSIGNED
        );
    }

    static async getAvailableParticipants() {
        const game = this.getGame();
        if (!game) return [];

        try {
            const activeSessions = await SessionService.getAllActiveSessions();
            const takenPlayers = new Set(activeSessions.map(session => session.playerName));

            return game.participants.filter(p => !takenPlayers.has(p.name));
        } catch (error) {
            console.error('Error getting available participants:', error);
            return game.participants.filter(p => !p.userName);
        }
    }

    static async assignPlayerToUser(playerName, userName) {
        const game = this.getGame();
        if (!game) throw new Error('No hay juego activo');

        // Verificar si el jugador ya está tomado
        const isTaken = await SessionService.isPlayerTaken(playerName);
        if (isTaken) {
            throw new Error('Este personaje ya fue seleccionado por otro jugador');
        }

        const participant = game.participants.find(p => p.name === playerName);
        if (!participant) throw new Error('Jugador no encontrado');

        if (participant.assigned) throw new Error('Este jugador ya tiene asignaciones');

        // Asignar usuario al participante en el juego
        participant.userName = userName;
        participant.joinedAt = new Date().toISOString();

        // Crear sesión (esto usa sessionStorage - única por pestaña)
        await SessionService.createSession(userName, playerName);

        this.saveGame(game);
        return participant;
    }

    static performRandomAssignments() {
        const game = this.getGame();
        if (!game) throw new Error('No hay juego activo');

        const unassignedParticipants = game.participants.filter(p => p.userName && !p.assigned);
        const availableItems = [...game.items];
        const availableLocations = [...game.locations];

        if (unassignedParticipants.length === 0) {
            throw new Error('No hay participantes para asignar');
        }

        if (unassignedParticipants.length > availableItems.length) {
            throw new Error(`No hay suficientes objetos. Necesitas ${unassignedParticipants.length}, tienes ${availableItems.length}`);
        }

        if (unassignedParticipants.length > availableLocations.length) {
            throw new Error(`No hay suficientes ubicaciones. Necesitas ${unassignedParticipants.length}, tienes ${availableLocations.length}`);
        }

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

        // Realizar asignaciones
        unassignedParticipants.forEach((participant, index) => {
            participant.assignedItem = shuffledItems[index];
            participant.assignedLocation = shuffledLocations[index];
            participant.assigned = true;
            participant.assignedAt = new Date().toISOString();
        });

        game.assignments = game.participants.filter(p => p.assigned);
        this.saveGame(game);

        return game;
    }

    static async getUserAssignment(userName) {
        const game = this.getGame();
        if (!game) return null;

        return game.participants.find(p => p.userName === userName && p.assigned);
    }

    static async getGameStats() {
        const game = this.getGame();
        if (!game) return null;

        try {
            const activeSessions = await SessionService.getAllActiveSessions();
            const joinedPlayers = activeSessions.length;
            const assignedPlayers = game.participants.filter(p => p.assigned).length;

            return {
                totalPlayers: game.participants.length,
                joinedPlayers: joinedPlayers,
                assignedPlayers: assignedPlayers,
                availablePlayers: game.participants.length - joinedPlayers,
                state: game.state
            };
        } catch (error) {
            console.error('Error getting game stats:', error);
            // Fallback básico
            const joinedPlayers = game.participants.filter(p => p.userName).length;
            const assignedPlayers = game.participants.filter(p => p.assigned).length;

            return {
                totalPlayers: game.participants.length,
                joinedPlayers: joinedPlayers,
                assignedPlayers: assignedPlayers,
                availablePlayers: game.participants.length - joinedPlayers,
                state: game.state
            };
        }
    }

    static async getConnectedPlayers() {
        const game = this.getGame();
        if (!game) return [];

        try {
            const activeSessions = await SessionService.getAllActiveSessions();
            return activeSessions.map(session => ({
                playerName: session.playerName,
                userName: session.userName, // Esto ya está enmascarado por SessionService
                joinedAt: session.joinedAt
            }));
        } catch (error) {
            console.error('Error getting connected players:', error);
            return [];
        }
    }

    // Métodos simplificados para admin (sin IndexedDB)
    static maskUserName(userName) {
        if (!userName || userName.length < 3) return '***';

        const firstChar = userName.charAt(0);
        const lastChar = userName.charAt(userName.length - 1);
        const maskedLength = userName.length - 2;
        const mask = '*'.repeat(maskedLength);

        return firstChar + mask + lastChar;
    }

    static async canAccessAdmin() {
        try {
            if (typeof SessionService.getCurrentSession === 'function') {
                const session = await SessionService.getCurrentSession();
                return !session;
            }
            return true; // Si no hay SessionService, permitir acceso
        } catch (error) {
            console.error('Error checking admin access:', error);
            return true;
        }
    }
}

export default GameService;