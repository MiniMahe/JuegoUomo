import React, { useState, useEffect } from 'react';
import GameService from '../services/gameService';
import SessionService from '../services/sessionService';

const CharacterSelection = ({ onCharacterSelected }) => {
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [userName, setUserName] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [error, setError] = useState('');
    const [connectedPlayers, setConnectedPlayers] = useState([]);
    const [gameStats, setGameStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGameData();

        // Configurar intervalo para actualizar datos cada 3 segundos
        const interval = setInterval(() => {
            loadGameData();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const loadGameData = async () => {
        try {
            setLoading(true);

            // Cargar jugadores disponibles
            const players = await GameService.getAvailableParticipants();
            setAvailablePlayers(players);

            // Cargar jugadores conectados
            const connected = await GameService.getConnectedPlayers();
            setConnectedPlayers(connected);

            // Cargar estadísticas del juego
            const stats = await GameService.getGameStats();
            setGameStats(stats);

        } catch (error) {
            console.error('Error cargando datos del juego:', error);
            setError('Error al cargar los datos del juego. Intenta recargar la página.');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGame = async () => {
        setError('');

        // Validaciones
        if (!userName.trim()) {
            setError('Por favor ingresa tu nombre de usuario');
            return;
        }

        if (!selectedPlayer) {
            setError('Por favor selecciona un personaje');
            return;
        }

        if (userName.trim().length < 2) {
            setError('El nombre de usuario debe tener al menos 2 caracteres');
            return;
        }

        if (userName.trim().length > 20) {
            setError('El nombre de usuario no puede tener más de 20 caracteres');
            return;
        }

        try {
            // Asignar usuario al personaje
            const participant = await GameService.assignPlayerToUser(selectedPlayer, userName.trim());

            // Notificar éxito
            onCharacterSelected(participant);

        } catch (error) {
            setError(error.message);
            // Recargar lista si hay error (posiblemente alguien más tomó el personaje)
            await loadGameData();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleJoinGame();
        }
    };

    const isFormValid = userName.trim() &&
        selectedPlayer &&
        userName.trim().length >= 2 &&
        userName.trim().length <= 20;

    if (loading) {
        return (
            <div className="character-selection">
                <div className="loading-container">
                    <div className="loading-spinner">🎮</div>
                    <p>Cargando personajes disponibles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="character-selection">
            <div className="selection-container">
                <div className="selection-header">
                    <h2>🎯 UNIRSE A LA PARTIDA</h2>
                    <p className="subtitle">Elige tu personaje y crea tu nombre de usuario único</p>
                </div>

                <div className="selection-form">
                    {/* Campo de nombre de usuario */}
                    <div className="form-group">
                        <label htmlFor="username-input">TU NOMBRE DE USUARIO (ÚNICO):</label>
                        <input
                            id="username-input"
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ingresa cómo quieres que te llamen en el juego (2-20 caracteres)"
                            className="username-input"
                            maxLength={20}
                            autoFocus
                        />
                        <div className="input-feedback">
                            {userName.trim().length > 0 && userName.trim().length < 2 && (
                                <span className="warning">⚠️ El nombre debe tener al menos 2 caracteres</span>
                            )}
                            {userName.trim().length >= 2 && (
                                <span className="success">✅ Nombre válido</span>
                            )}
                            <span className="char-count">{userName.length}/20</span>
                        </div>
                    </div>

                    {/* Selección de personaje */}
                    <div className="form-group">
                        <label>SELECCIONA TU PERSONAJE:</label>
                        <div className="players-info">
                            <span className="available-count">
                                {availablePlayers.length} de {gameStats?.totalPlayers || 0} disponibles
                            </span>
                        </div>

                        <div className="players-grid">
                            {availablePlayers.length === 0 ? (
                                <div className="no-players">
                                    <div className="no-players-icon">🚫</div>
                                    <h4>¡Todos los personajes han sido seleccionados!</h4>
                                    <p>Espera a que el administrador inicie una nueva partida.</p>
                                    <button onClick={loadGameData} className="refresh-btn">
                                        🔄 Actualizar Lista
                                    </button>
                                </div>
                            ) : (
                                availablePlayers.map((player, index) => (
                                    <div
                                        key={index}
                                        className={`player-card ${selectedPlayer === player.name ? 'selected' : ''} ${player.assigned ? 'assigned' : 'available'
                                            }`}
                                        onClick={() => !player.assigned && setSelectedPlayer(player.name)}
                                    >
                                        <div className="player-avatar">
                                            {player.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="player-info">
                                            <span className="player-name">{player.name}</span>
                                            <span className="player-status">
                                                {player.assigned ? (
                                                    <>
                                                        <span className="assigned-to">✅ Asignado a: {player.userName}</span>
                                                    </>
                                                ) : (
                                                    <span className="available-text">🎯 Disponible</span>
                                                )}
                                            </span>
                                        </div>
                                        {!player.assigned && (
                                            <div className="selection-indicator">
                                                {selectedPlayer === player.name ? '✓' : '+'}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Mensaje de error */}
                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    {/* Botón de unirse */}
                    <button
                        onClick={handleJoinGame}
                        disabled={!isFormValid}
                        className={`join-btn ${isFormValid ? 'enabled' : 'disabled'}`}
                    >
                        {isFormValid ? '🎮 CONFIRMAR Y UNIRME' : 'SELECCIONA PERSONAJE Y NOMBRE'}
                    </button>
                </div>

                {/* Información del juego */}
                <div className="game-info">
                    <div className="info-section">
                        <h4>👥 JUGADORES CONECTADOS ({connectedPlayers.length})</h4>
                        <div className="connected-players">
                            {connectedPlayers.length === 0 ? (
                                <p className="no-connections">No hay jugadores conectados aún</p>
                            ) : (
                                <div className="connected-list">
                                    {connectedPlayers.map((player, index) => (
                                        <div key={index} className="connected-player">
                                            <span className="player-badge">{player.playerName}</span>
                                            <span className="user-name">como "{player.userName}"</span>
                                            <span className="connection-time">
                                                {new Date(player.joinedAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="info-section">
                        <h4>📊 ESTADO DE LA PARTIDA</h4>
                        {gameStats && (
                            <div className="game-stats">
                                <div className="stat-item">
                                    <span>Total de jugadores:</span>
                                    <strong>{gameStats.totalPlayers}</strong>
                                </div>
                                <div className="stat-item">
                                    <span>Conectados ahora:</span>
                                    <strong className="connected-count">{gameStats.joinedPlayers}</strong>
                                </div>
                                <div className="stat-item">
                                    <span>Disponibles:</span>
                                    <strong className="available-count">{gameStats.availablePlayers}</strong>
                                </div>
                                <div className="stat-item">
                                    <span>Asignados:</span>
                                    <strong className="assigned-count">{gameStats.assignedPlayers}</strong>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${gameStats.totalPlayers > 0 ? (gameStats.joinedPlayers / gameStats.totalPlayers) * 100 : 0}%`
                                        }}
                                    ></div>
                                </div>
                                <p className="progress-text">
                                    {gameStats.joinedPlayers} de {gameStats.totalPlayers} jugadores conectados
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="info-section">
                        <h4>💡 INSTRUCCIONES</h4>
                        <ul className="instructions">
                            <li>✅ <strong>Elige un nombre único</strong> - Sé creativo pero respetuoso</li>
                            <li>✅ <strong>Selecciona un personaje disponible</strong> - No puedes cambiar después</li>
                            <li>✅ <strong>Confirma tu selección</strong> - Tu personaje se bloqueará para otros</li>
                            <li>🎯 <strong>Espera las asignaciones</strong> - El admin asignará objetos y ubicaciones</li>
                            <li>🔄 <strong>Mantén la ventana abierta</strong> - Las actualizaciones son automáticas</li>
                        </ul>
                    </div>
                </div>

                {/* Botón de actualización manual */}
                <div className="refresh-section">
                    <button onClick={loadGameData} className="refresh-btn secondary">
                        🔄 Actualizar Lista de Jugadores
                    </button>
                    <span className="last-update">
                        Última actualización: {new Date().toLocaleTimeString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CharacterSelection;