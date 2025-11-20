import React, { useState } from 'react';
import GameService from '../services/gameService';
import CrudPanel from './CrudPanel';

const GameSetup = ({ onGameCreated }) => {
    const [participants, setParticipants] = useState([]);
    const [items, setItems] = useState([]);
    const [locations, setLocations] = useState([]);
    const [gameName, setGameName] = useState('Partida ' + new Date().toLocaleDateString());
    const [step, setStep] = useState(1);

    const handleCreateGame = () => {
        if (participants.length === 0) {
            alert('Debes agregar al menos un participante');
            return;
        }

        if (items.length === 0) {
            alert('Debes agregar al menos un objeto');
            return;
        }

        if (locations.length === 0) {
            alert('Debes agregar al menos una ubicación');
            return;
        }

        // Formatear participantes
        const formattedParticipants = participants.map(name => ({
            name: name.trim().toUpperCase(),
            assigned: false,
            userName: null,
            joinedAt: null,
            assignedAt: null,
            assignedItem: null,
            assignedLocation: null
        }));

        const gameData = {
            name: gameName,
            participants: formattedParticipants,
            items: items.map(item => item.trim().toUpperCase()),
            locations: locations.map(location => location.trim().toUpperCase())
        };

        const game = GameService.createGame(gameData);
        GameService.startGame();

        onGameCreated(game);
    };

    const participantNames = participants.map(p => typeof p === 'string' ? p : p.name);

    return (
        <div className="game-setup">
            <div className="setup-header">
                <h2>CREAR NUEVA PARTIDA</h2>
                <div className="progress-steps">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Participantes</div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Objetos</div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Ubicaciones</div>
                    <div className={`step ${step >= 4 ? 'active' : ''}`}>4. Iniciar</div>
                </div>
            </div>

            <div className="setup-content">
                {step === 1 && (
                    <div className="setup-step">
                        <h3>PASO 1: AGREGAR PARTICIPANTES</h3>
                        <CrudPanel
                            title="LISTA DE PARTICIPANTES"
                            items={participantNames}
                            onItemsUpdate={setParticipants}
                            placeholder="Ingresa nombres de participantes separados por comas: JUAN, MARÍA, PEDRO..."
                        />
                        <div className="step-actions">
                            <button onClick={() => setStep(2)} disabled={participants.length === 0}>
                                CONTINUAR → OBJETOS
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="setup-step">
                        <h3>PASO 2: AGREGAR OBJETOS</h3>
                        <p className="step-info">
                            Agrega los objetos del juego. Debe haber al menos tantos objetos como participantes.
                        </p>
                        <CrudPanel
                            title="OBJETOS DEL JUEGO"
                            items={items}
                            onItemsUpdate={setItems}
                            placeholder="Ingresa objetos separados por comas: ESPADA, ESCUDO, POCIÓN, LLAVE..."
                        />
                        <div className="validation-info">
                            <p>Participantes: {participants.length} | Objetos: {items.length}</p>
                            {items.length < participants.length && (
                                <p className="warning">⚠️ Necesitas al menos {participants.length} objetos</p>
                            )}
                        </div>
                        <div className="step-actions">
                            <button onClick={() => setStep(1)}>← VOLVER</button>
                            <button onClick={() => setStep(3)} disabled={items.length < participants.length}>
                                CONTINUAR → UBICACIONES
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="setup-step">
                        <h3>PASO 3: AGREGAR UBICACIONES</h3>
                        <p className="step-info">
                            Agrega las ubicaciones del juego. Debe haber al menos tantas ubicaciones como participantes.
                        </p>
                        <CrudPanel
                            title="UBICACIONES DEL JUEGO"
                            items={locations}
                            onItemsUpdate={setLocations}
                            placeholder="Ingresa ubicaciones separadas por comas: BOSQUE, CASTILLO, MONTAÑA, CUEVA..."
                        />
                        <div className="validation-info">
                            <p>Participantes: {participants.length} | Ubicaciones: {locations.length}</p>
                            {locations.length < participants.length && (
                                <p className="warning">⚠️ Necesitas al menos {participants.length} ubicaciones</p>
                            )}
                        </div>
                        <div className="step-actions">
                            <button onClick={() => setStep(2)}>← VOLVER</button>
                            <button onClick={() => setStep(4)} disabled={locations.length < participants.length}>
                                CONTINUAR → REVISAR
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="setup-step">
                        <h3>PASO 4: REVISAR Y INICIAR PARTIDA</h3>

                        <div className="game-summary">
                            <div className="summary-section">
                                <h4>INFORMACIÓN DE LA PARTIDA</h4>
                                <div className="summary-item">
                                    <label>Nombre:</label>
                                    <input
                                        type="text"
                                        value={gameName}
                                        onChange={(e) => setGameName(e.target.value)}
                                        placeholder="Nombre de la partida"
                                    />
                                </div>
                            </div>

                            <div className="summary-section">
                                <h4>RESUMEN</h4>
                                <div className="stats-grid">
                                    <div className="stat">
                                        <span className="stat-number">{participants.length}</span>
                                        <span className="stat-label">PARTICIPANTES</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-number">{items.length}</span>
                                        <span className="stat-label">OBJETOS</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-number">{locations.length}</span>
                                        <span className="stat-label">UBICACIONES</span>
                                    </div>
                                </div>
                            </div>

                            <div className="summary-section">
                                <h4>PARTICIPANTES</h4>
                                <div className="participants-list">
                                    {participants.map((name, index) => (
                                        <span key={index} className="participant-tag">
                                            {typeof name === 'string' ? name : name.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="step-actions">
                            <button onClick={() => setStep(3)}>← VOLVER</button>
                            <button onClick={handleCreateGame} className="create-game-btn">
                                🎮 CREAR PARTIDA
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameSetup;