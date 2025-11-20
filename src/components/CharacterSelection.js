import React, { useState, useEffect } from 'react';
import GameService from '../services/gameService';
import SessionService from '../services/sessionService';

const CharacterSelection = ({ onCharacterSelected }) => {
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [userName, setUserName] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [error, setError] = useState('');
    const [connectedPlayers, setConnectedPlayers] = useState([]);

    useEffect(() => {
        loadAvailablePlayers();
        loadConnectedPlayers();

        // Actualizar cada 2 segundos
        const interval = setInterval(() => {
            loadAvailablePlayers();
            loadConnectedPlayers();
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const loadAvailablePlayers = async () => {
        try {
            const players = await GameService.getAvailableParticipants();
            setAvailablePlayers(players);
        } catch (error) {
            console.error('Error loading players:', error);
        }
    };

    const loadConnectedPlayers = async () => {
        try {
            const players = await GameService.getConnectedPlayers();
            setConnectedPlayers(players);
        } catch (error) {
            console.error('Error loading connected players:', error);
        }
    };

    const handleJoinGame = async () => {
        setError('');

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

        try {
            // Asignar usuario al personaje
            const participant = await GameService.assignPlayerToUser(selectedPlayer, userName.trim());
            onCharacterSelected(participant);
        } catch (error) {
            setError(error.message);
            // Recargar lista si hay error (posiblemente alguien más tomó el personaje)
            loadAvailablePlayers();
        }
    };

    const isFormValid = userName.trim() && selectedPlayer && userName.trim().length >= 2;

    return (
        <div className="character-selection">
            <div className="selection-container">
                <h2>UNIRSE A LA PARTIDA</h2>
                <p className="subtitle">Elige tu personaje y crea tu nombre de usuario único</p>

                <div className="selection-form">
                    <div className="form-group">
                        <label>TU NOMBRE DE USUARIO (ÚNICO):</label>
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Ingresa cómo quieres que te llamen en el juego (mínimo 2 caracteres)"
                            className="username-input"
                            maxLength={20}
                        />
                        {userName.trim().length > 0 && userName.trim().length < 2 && (
                            <p className="input-warning">El nombre debe tener al menos 2 caracteres</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>SELECCIONA TU PERSONAJE ({availablePlayers.length} disponibles):</label>
                        <div className="players-grid">
                            {availablePlayers.length === 0 ? (
                                <div className="no-players">
                                    <p>¡Todos los personajes han sido seleccionados!</p>
                                    <p>Espera a que el administrador inicie una nueva partida.</p>
                                </div>
                            ) : (
                                availablePlayers.map((player, index) => (
                                    <div
                                        key={index}
                                        className={`player-card ${selectedPlayer === player.name ? 'selected' : ''}`}
                                        onClick={() => setSelectedPlayer(player.name)}
                                    >
                                        <div className="player-avatar">
                                            {player.name.charAt(0)}
                                        </div>
                                        <div className="player-info">
                                            <span className="player-name">{player.name}</span>
                                            <span className="player-status">✅ Disponible</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        onClick={handleJoinGame}
                        disabled={!isFormValid}
                        className={`join-btn ${isFormValid ? 'enabled' : 'disabled'}`}
                    >
                        🎯 CONFIRMAR Y UNIRME
                    </button>
                </div>

                <div className="game-info">
                    <div className="info-section">
                        <h4>JUGADORES CONECTADOS ({connectedPlayers.length})</h4>
                        <div className="connected-players">
                            {connectedPlayers.length === 0 ? (
                                <p>No hay jugadores conectados aún</p>
                            ) : (
                                connectedPlayers.map((player, index) => (
                                    <div key={index} className="connected-player">
                                        <span className="player-badge">{player.playerName}</span>
                                        <span className="user-name">como "{player.userName}"</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="info-section">
                        <h4>INSTRUCCIONES</h4>
                        <ul className="instructions">
                            <li>✅ Elige un nombre de usuario único</li>
                            <li>✅ Selecciona un personaje disponible</li>
                            <li>✅ Confirma tu selección</li>
                            <li>🎯 Espera las asignaciones del administrador</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterSelection;