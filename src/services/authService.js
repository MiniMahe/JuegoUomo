class AuthService {
    static generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    static createUserSession(userName, playerName) {
        const sessionId = this.generateSessionId();
        const session = {
            id: sessionId,
            userName: userName,
            playerName: playerName,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };

        // Guardar sesión en localStorage
        const sessions = this.getAllSessions();
        sessions[sessionId] = session;
        localStorage.setItem('userSessions', JSON.stringify(sessions));

        // Sesión actual
        localStorage.setItem('currentSession', sessionId);

        return session;
    }

    static getCurrentSession() {
        const sessionId = localStorage.getItem('currentSession');
        if (!sessionId) return null;

        const sessions = this.getAllSessions();
        return sessions[sessionId] || null;
    }

    static getAllSessions() {
        return JSON.parse(localStorage.getItem('userSessions') || '{}');
    }

    static updateSessionActivity() {
        const session = this.getCurrentSession();
        if (session) {
            session.lastActivity = new Date().toISOString();
            const sessions = this.getAllSessions();
            sessions[session.id] = session;
            localStorage.setItem('userSessions', JSON.stringify(sessions));
        }
    }

    static logout() {
        localStorage.removeItem('currentSession');
    }

    static cleanupExpiredSessions() {
        const sessions = this.getAllSessions();
        const now = new Date();
        const expired = 24 * 60 * 60 * 1000; // 24 horas

        Object.keys(sessions).forEach(sessionId => {
            const session = sessions[sessionId];
            const lastActivity = new Date(session.lastActivity);
            if (now - lastActivity > expired) {
                delete sessions[sessionId];
            }
        });

        localStorage.setItem('userSessions', JSON.stringify(sessions));
    }
}

export default AuthService;