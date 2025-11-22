import JsonDatabaseService from './jsonDatabaseService';

class SessionService {
    static createSession(userName, playerName) {
        const session = {
            id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            userName: userName.trim(),
            playerName: playerName,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            isActive: true
        };

        // Guardar en sessionStorage para esta pestaña
        sessionStorage.setItem('currentSession', JSON.stringify(session));

        // Guardar en base de datos JSON compartida
        JsonDatabaseService.updateSession(session);

        return Promise.resolve(session);
    }

    static getCurrentSession() {
        try {
            const sessionData = sessionStorage.getItem('currentSession');
            if (!sessionData) return Promise.resolve(null);

            const session = JSON.parse(sessionData);

            if (session && session.isActive) {
                // Actualizar última actividad
                session.lastActivity = new Date().toISOString();
                sessionStorage.setItem('currentSession', JSON.stringify(session));

                // Actualizar en base de datos JSON
                JsonDatabaseService.updateSession(session);

                return Promise.resolve(session);
            } else {
                sessionStorage.removeItem('currentSession');
                return Promise.resolve(null);
            }
        } catch (error) {
            console.error('Error getting session:', error);
            sessionStorage.removeItem('currentSession');
            return Promise.resolve(null);
        }
    }

    static async getAllActiveSessions() {
        try {
            const sessions = await JsonDatabaseService.getActiveSessions();
            const activeSessions = Object.values(sessions).filter(session => session.isActive);
            return activeSessions;
        } catch (error) {
            console.error('Error getting all active sessions:', error);
            return [];
        }
    }

    static async isPlayerTaken(playerName) {
        const sessions = await this.getAllActiveSessions();
        return sessions.some(session => session.playerName === playerName);
    }

    static updateSessionActivity() {
        return this.getCurrentSession().then(session => {
            if (session) {
                session.lastActivity = new Date().toISOString();
                sessionStorage.setItem('currentSession', JSON.stringify(session));
                JsonDatabaseService.updateSession(session);
            }
            return session;
        });
    }

    static async logout() {
        const session = await this.getCurrentSession();
        if (session) {
            // Marcar como inactiva
            session.isActive = false;
            sessionStorage.setItem('currentSession', JSON.stringify(session));

            // Actualizar en base de datos JSON
            await JsonDatabaseService.updateSession(session);
        }

        // Limpiar sessionStorage
        sessionStorage.removeItem('currentSession');

        return Promise.resolve();
    }

    static maskUserName(userName) {
        if (!userName || userName.length < 3) return '***';

        const firstChar = userName.charAt(0);
        const lastChar = userName.charAt(userName.length - 1);
        const maskedLength = userName.length - 2;
        const mask = '*'.repeat(maskedLength);

        return firstChar + mask + lastChar;
    }

    static cleanupExpiredSessions() {
        return JsonDatabaseService.cleanupExpiredSessions();
    }

    static async forceLogoutAllUsers() {
        try {
            const sessions = await JsonDatabaseService.getActiveSessions();

            // Marcar todas como inactivas
            Object.keys(sessions).forEach(sessionId => {
                sessions[sessionId].isActive = false;
            });

            await JsonDatabaseService.saveActiveSessions(sessions);
            return Promise.resolve();
        } catch (error) {
            console.error('Error forcing logout all users:', error);
            return Promise.resolve();
        }
    }
}

export default SessionService;