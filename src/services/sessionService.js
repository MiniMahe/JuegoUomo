import JsonDatabaseService from './jsonDatabaseService';

class SessionService {
    // Crear sesión
    static async createSession(userName, playerName) {
        const session = {
            id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            userName: userName.trim(),
            playerName: playerName,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            isActive: true
        };

        // Guardar en sessionStorage
        sessionStorage.setItem('currentSession', JSON.stringify(session));

        // Guardar en base de datos
        await JsonDatabaseService.updateSession(session);

        return session;
    }

    // Obtener sesión actual
    static async getCurrentSession() {
        try {
            const sessionData = sessionStorage.getItem('currentSession');
            if (!sessionData) return null;

            const session = JSON.parse(sessionData);

            if (session && session.isActive) {
                // Actualizar actividad
                session.lastActivity = new Date().toISOString();
                sessionStorage.setItem('currentSession', JSON.stringify(session));

                // Actualizar en base de datos
                await JsonDatabaseService.updateSession(session);

                return session;
            }

            sessionStorage.removeItem('currentSession');
            return null;

        } catch (error) {
            console.error('Error obteniendo sesión:', error);
            sessionStorage.removeItem('currentSession');
            return null;
        }
    }

    // Obtener todas las sesiones activas
    static async getAllActiveSessions() {
        try {
            const sessions = await JsonDatabaseService.getActiveSessions();
            return Object.values(sessions).filter(session => session.isActive);
        } catch (error) {
            console.error('Error obteniendo sesiones activas:', error);
            return [];
        }
    }

    // Verificar si un jugador está tomado
    static async isPlayerTaken(playerName) {
        try {
            const sessions = await this.getAllActiveSessions();
            return sessions.some(session => session.playerName === playerName);
        } catch (error) {
            console.error('Error verificando jugador:', error);
            return false;
        }
    }

    // Actualizar actividad de sesión
    static async updateSessionActivity() {
        const session = await this.getCurrentSession();
        if (session) {
            session.lastActivity = new Date().toISOString();
            sessionStorage.setItem('currentSession', JSON.stringify(session));
            await JsonDatabaseService.updateSession(session);
        }
        return session;
    }

    // Cerrar sesión
    static async logout() {
        try {
            const session = await this.getCurrentSession();
            if (session) {
                session.isActive = false;
                sessionStorage.setItem('currentSession', JSON.stringify(session));
                await JsonDatabaseService.updateSession(session);
            }

            sessionStorage.removeItem('currentSession');
        } catch (error) {
            console.error('Error cerrando sesión:', error);
            sessionStorage.removeItem('currentSession');
        }
    }

    // Enmascarar nombre de usuario
    static maskUserName(userName) {
        if (!userName || userName.length < 3) return '***';
        const firstChar = userName.charAt(0);
        const lastChar = userName.charAt(userName.length - 1);
        const maskedLength = userName.length - 2;
        const mask = '*'.repeat(maskedLength);
        return firstChar + mask + lastChar;
    }

    // Limpiar sesiones expiradas
    static async cleanupExpiredSessions() {
        await JsonDatabaseService.cleanupExpiredSessions();
    }

    // Forzar logout de todos
    static async forceLogoutAllUsers() {
        try {
            const sessions = await JsonDatabaseService.getActiveSessions();
            Object.keys(sessions).forEach(sessionId => {
                sessions[sessionId].isActive = false;
            });
            await JsonDatabaseService.saveActiveSessions(sessions);
        } catch (error) {
            console.error('Error forzando logout:', error);
        }
    }
}

export default SessionService;