import React, { useState, useEffect } from 'react';
import GameService from '../services/gameService';
import SessionService from '../services/sessionService';

const GameAdminPanel = ({ game, onGameUpdated, onForceLogoutAll }) => {
    const [gameStats, setGameStats] = useState(null);
    const [connectedPlayers, setConnectedPlayers] = useState([]);

    useEffect(() => {
        if (game) {
            loadGameData();
        }

        const interval = setInterval(() => {
            if (game) {
                loadGameData();
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [game]);

    const loadGameData = async () => {
        try {
            const stats = await GameService.getGameStats();
            setGameStats(stats);

            const players = await GameService.getConnectedPlayers();
            setConnectedPlayers(players);
        } catch (error) {
            console.error('Error loading game data:', error);
        }
    };

    const handleStartAssignments = async () => {
        if (!gameStats || gameStats.joinedPlayers === 0) {
            alert('No hay jugadores conectados para asignar');
            return;
        }

        try {
            GameService.beginAssignments();
            const updatedGame = GameService.performRandomAssignments();
            GameService.completeAssignments();
            onGameUpdated(updatedGame);
            alert('¡Asignaciones realizadas exitosamente!');
        } catch (error) {
            alert('Error al realizar asignaciones: ' + error.message);
        }
    };

    const handleResetGame = () => {
        if (window.confirm('¿Estás seguro de que quieres reiniciar el juego? Se perderán todos los datos.')) {
            GameService.resetGame();
            window.location.reload();
        }
    };

    if (!game || !gameStats) {
        return (
            <div className="loading-admin">
                <p>Cargando panel de administración...</p>
            </div>
        );
    }

    return (
        <div className="game-admin-panel">
            <div className="admin-header">
                <h2>🎮 CONTROL DE PARTIDA: {game.name}</h2>
                <div className="game-state">
                    Estado: <span className={`state-badge ${game.state}`}>
                        {game.state === 'ready' ? 'LISTO' :
                            game.state === 'in_progress' ? 'EN CURSO' :
                                game.state === 'assigned' ? 'ASIGNADO' : 'CONFIGURACIÓN'}
                    </span>
                </div>
            </div>

            <div className="admin-stats">
                <div className="stat-cards">
                    <div className="stat-card">
                        <div className="stat-number total">{gameStats.totalPlayers}</div>
                        <div className="stat-label">TOTAL JUGADORES</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number connected">{gameStats.joinedPlayers}</div>
                        <div className="stat-label">CONECTADOS</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number available">{gameStats.availablePlayers}</div>
                        <div className="stat-label">DISPONIBLES</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number assigned">{gameStats.assignedPlayers}</div>
                        <div className="stat-label">ASIGNADOS</div>
                    </div>
                </div>
            </div>

            <div className="admin-actions">
                <div className="action-section">
                    <h3>🎯 GESTIÓN DE ASIGNACIONES</h3>
                    <div className="action-buttons">
                        {game.state === 'ready' && (
                            <button onClick={handleStartAssignments} className="action-btn primary">
                                🎲 REALIZAR ASIGNACIONES ALEATORIAS
                            </button>
                        )}

                        {(game.state === 'in_progress' || game.state === 'assigned') && (
                            <button onClick={handleStartAssignments} className="action-btn secondary">
                                🔄 RE-ASIGNAR ALEATORIAMENTE
                            </button>
                        )}
                    </div>
                </div>

                <div className="players-section">
                    <h3>👥 JUGADORES CONECTADOS ({connectedPlayers.length})</h3>
                    <div className="session-info">
                        <p>💡 Cada jugador tiene una sesión independiente por pestaña/navegador</p>
                    </div>
                    <div className="players-list">
                        {connectedPlayers.length === 0 ? (
                            <div className="no-players">
                                <p>No hay jugadores conectados en este momento</p>
                            </div>
                        ) : (
                            connectedPlayers.map((player, index) => (
                                <div key={index} className="player-row">
                                    <span className="player-name">{player.playerName}</span>
                                    <span className="user-name">→ {player.userName}</span>
                                    <span className="connection-status">📱 Sesión activa</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="admin-controls">
                    <button onClick={onForceLogoutAll} className="action-btn warning">
                        🚫 DESCONECTAR A TODOS LOS JUGADORES
                    </button>
                    <button onClick={handleResetGame} className="action-btn danger">
                        🗑️ REINICIAR JUEGO COMPLETO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameAdminPanel;