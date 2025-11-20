import React, { useState, useEffect } from 'react';
import GameService from '../services/gameService';
import SessionService from '../services/sessionService';

const UserDashboard = ({ user, game, onLogout }) => {
    const [userAssignment, setUserAssignment] = useState(null);
    const [gameStats, setGameStats] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    useEffect(() => {
        // Actualizar actividad de la sesión
        SessionService.updateSessionActivity();

        loadUserData();

        // Configurar intervalo para actualizar datos
        const interval = setInterval(() => {
            loadUserData();
            SessionService.updateSessionActivity();
        }, 3000);

        return () => clearInterval(interval);
    }, [user.userName]);

    const loadUserData = async () => {
        try {
            const assignment = await GameService.getUserAssignment(user.userName);
            setUserAssignment(assignment);

            const stats = await GameService.getGameStats();
            setGameStats(stats);

            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await SessionService.logout();
            onLogout();
        } catch (error) {
            console.error('Error during logout:', error);
            onLogout(); // Forzar logout aunque haya error
        }
    };

    if (!userAssignment) {
        return (
            <div className="user-dashboard">
                <div className="user-header">
                    <div className="user-info">
                        <h3>¡BIENVENIDO, {user.userName}!</h3>
                        <p>Personaje: <strong>{user.name}</strong></p>
                        <small>Sesión activa - Actualizado: {lastUpdate.toLocaleTimeString()}</small>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        🚪 SALIR
                    </button>
                </div>

                <div className="waiting-assignment">
                    <div className="loading-animation">
                        <div className="spinner"></div>
                        <div className="pulse"></div>
                    </div>
                    <h4>ESPERANDO ASIGNACIONES</h4>
                    <p>El administrador asignará los objetos y ubicaciones pronto.</p>

                    {gameStats && (
                        <div className="game-progress">
                            <div className="progress-info">
                                <div className="progress-item">
                                    <span>Jugadores conectados:</span>
                                    <strong>{gameStats.joinedPlayers} / {gameStats.totalPlayers}</strong>
                                </div>
                                <div className="progress-item">
                                    <span>Estado del juego:</span>
                                    <strong className={`game-state ${gameStats.state}`}>
                                        {gameStats.state === 'ready' ? 'ESPERANDO ASIGNACIONES' :
                                            gameStats.state === 'in_progress' ? 'ASIGNANDO...' :
                                                gameStats.state === 'assigned' ? 'ASIGNACIONES LISTAS' : 'CONFIGURACIÓN'}
                                    </strong>
                                </div>
                            </div>

                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${gameStats.totalPlayers > 0 ? (gameStats.joinedPlayers / gameStats.totalPlayers) * 100 : 0}%` }}
                                ></div>
                            </div>
                            <p>{gameStats.joinedPlayers} de {gameStats.totalPlayers} jugadores conectados</p>
                        </div>
                    )}

                    <div className="waiting-tips">
                        <h5>¿Qué pasa ahora?</h5>
                        <ul>
                            <li>El administrador realizará asignaciones aleatorias</li>
                            <li>Recibirás un objeto y una ubicación única</li>
                            <li>Las asignaciones aparecerán automáticamente aquí</li>
                            <li>¡Mantén esta ventana abierta!</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="user-dashboard">
            <div className="user-header">
                <div className="user-info">
                    <h3>¡HOLA, {user.userName}!</h3>
                    <p>Personaje: <strong>{user.name}</strong></p>
                    <small>Última actualización: {lastUpdate.toLocaleTimeString()}</small>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    🚪 SALIR
                </button>
            </div>

            <div className="assignment-reveal">
                <div className="success-message">
                    <div className="success-header">
                        <h4>🎉 ¡TUS ASIGNACIONES ESTÁN LISTAS!</h4>
                        <div className="assignment-time">
                            Asignado el: {new Date(userAssignment.assignedAt).toLocaleString()}
                        </div>
                    </div>

                    <div className="assignment-details">
                        <div className="assignment-item highlight">
                            <div className="assignment-icon">🎭</div>
                            <div className="assignment-content">
                                <strong>PERSONAJE:</strong>
                                <span>{user.name}</span>
                            </div>
                        </div>
                        <div className="assignment-item">
                            <div className="assignment-icon">🎁</div>
                            <div className="assignment-content">
                                <strong>OBJETO ASIGNADO:</strong>
                                <span className="item-value">{userAssignment.assignedItem}</span>
                            </div>
                        </div>
                        <div className="assignment-item">
                            <div className="assignment-icon">📍</div>
                            <div className="assignment-content">
                                <strong>UBICACIÓN ASIGNADA:</strong>
                                <span className="location-value">{userAssignment.assignedLocation}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {gameStats && (
                <div className="game-status">
                    <h4>ESTADO GENERAL DE LA PARTIDA</h4>
                    <div className="status-cards">
                        <div className="status-card">
                            <span className="status-number total">{gameStats.totalPlayers}</span>
                            <span className="status-label">TOTAL JUGADORES</span>
                        </div>
                        <div className="status-card">
                            <span className="status-number connected">{gameStats.joinedPlayers}</span>
                            <span className="status-label">CONECTADOS</span>
                        </div>
                        <div className="status-card">
                            <span className="status-number assigned">{gameStats.assignedPlayers}</span>
                            <span className="status-label">ASIGNADOS</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="session-info">
                <p><strong>💡 Información:</strong> Puedes cerrar esta pestaña y volver más tarde. Tu sesión permanecerá activa por 2 horas.</p>
            </div>
        </div>
    );
};

export default UserDashboard;