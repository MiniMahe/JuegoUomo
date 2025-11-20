class SessionService {
    // Usar sessionStorage para sesiones (no se comparte entre pestañas)
    static createSession(userName, playerName) {
        const session = {
            id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            userName: userName.trim(),
            playerName: playerName,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            isActive: true
        };

        // Guardar en sessionStorage (no se comparte entre pestañas)
        sessionStorage.setItem('currentSession', JSON.stringify(session));

        // También guardar en localStorage para que el admin pueda ver las conexiones
        // pero sin información sensible
        this.updateActiveSessions(session);

        return Promise.resolve(session);
    }

    static getCurrentSession() {
        try {
            const sessionData = sessionStorage.getItem('currentSession');
            if (!sessionData) return Promise.resolve(null);

            const session = JSON.parse(sessionData);

            // Verificar si la sesión sigue activa
            if (session && session.isActive) {
                // Actualizar última actividad
                session.lastActivity = new Date().toISOString();
                sessionStorage.setItem('currentSession', JSON.stringify(session));
                this.updateActiveSessions(session);

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

    static updateActiveSessions(session) {
        try {
            const activeSessions = this.getAllActiveSessionsFromStorage();

            // Actualizar o agregar la sesión actual
            activeSessions[session.id] = {
                id: session.id,
                playerName: session.playerName,
                userName: this.maskUserName(session.userName), // Información enmascarada
                joinedAt: session.createdAt,
                lastActivity: session.lastActivity,
                isActive: session.isActive
            };

            // Limpiar sesiones expiradas
            this.cleanupExpiredSessionsFromStorage(activeSessions);

            // Guardar en localStorage (solo para el admin)
            localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
        } catch (error) {
            console.error('Error updating active sessions:', error);
        }
    }

    static getAllActiveSessionsFromStorage() {
        try {
            return JSON.parse(localStorage.getItem('activeSessions') || '{}');
        } catch (error) {
            console.error('Error getting active sessions:', error);
            return {};
        }
    }

    static cleanupExpiredSessionsFromStorage(sessions) {
        const now = new Date();
        const expiredTime = 2 * 60 * 60 * 1000; // 2 horas

        Object.keys(sessions).forEach(sessionId => {
            const session = sessions[sessionId];
            const lastActivity = new Date(session.lastActivity);
            if (now - lastActivity > expiredTime) {
                delete sessions[sessionId];
            }
        });
    }

    static getAllActiveSessions() {
        try {
            const sessions = this.getAllActiveSessionsFromStorage();
            const activeSessions = Object.values(sessions).filter(session => session.isActive);
            return Promise.resolve(activeSessions);
        } catch (error) {
            console.error('Error getting all active sessions:', error);
            return Promise.resolve([]);
        }
    }

    static isPlayerTaken(playerName) {
        return this.getAllActiveSessions().then(sessions => {
            return sessions.some(session => session.playerName === playerName);
        });
    }

    static updateSessionActivity() {
        return this.getCurrentSession().then(session => {
            if (session) {
                session.lastActivity = new Date().toISOString();
                sessionStorage.setItem('currentSession', JSON.stringify(session));
                this.updateActiveSessions(session);
            }
            return session;
        });
    }

    static logout() {
        return this.getCurrentSession().then(session => {
            if (session) {
                // Marcar como inactiva en sessionStorage
                session.isActive = false;
                sessionStorage.setItem('currentSession', JSON.stringify(session));

                // También remover de las sesiones activas en localStorage
                const activeSessions = this.getAllActiveSessionsFromStorage();
                delete activeSessions[session.id];
                localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
            }

            // Limpiar sessionStorage
            sessionStorage.removeItem('currentSession');

            return Promise.resolve();
        });
    }

    static maskUserName(userName) {
        if (!userName || userName.length < 3) return '***';

        const firstChar = userName.charAt(0);
        const lastChar = userName.charAt(userName.length - 1);
        const maskedLength = userName.length - 2;
        const mask = '*'.repeat(maskedLength);

        return firstChar + mask + lastChar;
    }

    // Limpieza general de sesiones expiradas
    static cleanupExpiredSessions() {
        try {
            const sessions = this.getAllActiveSessionsFromStorage();
            this.cleanupExpiredSessionsFromStorage(sessions);
            localStorage.setItem('activeSessions', JSON.stringify(sessions));
            return Promise.resolve();
        } catch (error) {
            console.error('Error cleaning expired sessions:', error);
            return Promise.resolve();
        }
    }

    // Forzar logout de todos los usuarios (solo admin)
    static forceLogoutAllUsers() {
        try {
            // Limpiar todas las sesiones activas
            localStorage.removeItem('activeSessions');

            // Nota: No podemos limpiar sessionStorage de otras pestañas
            // Los usuarios se darán cuenta cuando intenten actualizar

            return Promise.resolve();
        } catch (error) {
            console.error('Error forcing logout all users:', error);
            return Promise.resolve();
        }
    }
}

export default SessionService;