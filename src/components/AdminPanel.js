import React, { useState } from 'react';
import CrudPanel from './CrudPanel';
import AssignmentPanel from './AssignmentPanel';

const AdminPanel = ({
    participants,
    onParticipantsUpdate,
    items,
    onItemsUpdate,
    locations,
    onLocationsUpdate,
    assignments,
    onAssignmentsUpdate
}) => {
    const [activeSection, setActiveSection] = useState('participants');

    // Convertir participantes a formato simple para CrudPanel
    const participantNames = participants.map(p => p.name);

    const handleParticipantsUpdate = (names) => {
        const updatedParticipants = names.map(name => {
            const existing = participants.find(p => p.name === name);
            return existing || { name, registeredAt: new Date().toISOString(), assigned: false };
        });
        onParticipantsUpdate(updatedParticipants);
    };

    const clearAllParticipants = () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar todos los participantes?')) {
            onParticipantsUpdate([]);
            localStorage.removeItem('currentUser'); // Limpiar usuarios locales
        }
    };

    return (
        <div className="admin-panel">
            <h2 className="glitch-text" data-text="PANEL DE ADMINISTRACIÓN">
                PANEL DE ADMINISTRACIÓN
            </h2>

            <nav className="admin-nav">
                <button
                    onClick={() => setActiveSection('participants')}
                    className={activeSection === 'participants' ? 'active' : ''}
                >
                    👥 Participantes
                </button>
                <button
                    onClick={() => setActiveSection('items')}
                    className={activeSection === 'items' ? 'active' : ''}
                >
                    🎁 Objetos
                </button>
                <button
                    onClick={() => setActiveSection('locations')}
                    className={activeSection === 'locations' ? 'active' : ''}
                >
                    📍 Ubicaciones
                </button>
                <button
                    onClick={() => setActiveSection('assignment')}
                    className={activeSection === 'assignment' ? 'active' : ''}
                >
                    🎯 Asignaciones
                </button>
            </nav>

            <div className="admin-content">
                {activeSection === 'participants' && (
                    <div className="participants-section">
                        <CrudPanel
                            title="Participantes Registrados"
                            items={participantNames}
                            onItemsUpdate={handleParticipantsUpdate}
                            placeholder="Ingresa nombres separados por comas: Juan, María, Pedro..."
                        />

                        <div className="participants-stats">
                            <h4>Estadísticas:</h4>
                            <p>Total registrados: {participants.length}</p>
                            <p>Esperando asignación: {participants.filter(p => !p.assigned).length}</p>
                            <p>Asignados: {participants.filter(p => p.assigned).length}</p>

                            <button
                                onClick={clearAllParticipants}
                                className="danger-button"
                                disabled={participants.length === 0}
                            >
                                🗑️ Eliminar Todos los Participantes
                            </button>
                        </div>

                        <div className="participants-list-admin">
                            <h4>Lista Detallada:</h4>
                            {participants.length === 0 ? (
                                <p>No hay participantes registrados</p>
                            ) : (
                                <div className="participants-grid-admin">
                                    {participants.map((participant, index) => (
                                        <div key={index} className="participant-detail-card">
                                            <div className="participant-info">
                                                <strong>{participant.name}</strong>
                                                <span className={`status ${participant.assigned ? 'assigned' : 'waiting'}`}>
                                                    {participant.assigned ? '✅ Asignado' : '⏳ Esperando'}
                                                </span>
                                            </div>
                                            <div className="participant-meta">
                                                <small>Registrado: {new Date(participant.registeredAt).toLocaleString()}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeSection === 'items' && (
                    <CrudPanel
                        title="Objetos del Juego"
                        items={items}
                        onItemsUpdate={onItemsUpdate}
                        placeholder="Ingresa objetos separados por comas: Espada, Escudo, Poción, Llave, Mapa..."
                    />
                )}

                {activeSection === 'locations' && (
                    <CrudPanel
                        title="Ubicaciones del Juego"
                        items={locations}
                        onItemsUpdate={onLocationsUpdate}
                        placeholder="Ingresa ubicaciones separadas por comas: Bosque, Castillo, Montaña, Cueva, Pueblo..."
                    />
                )}

                {activeSection === 'assignment' && (
                    <AssignmentPanel
                        participants={participants}
                        items={items}
                        locations={locations}
                        assignments={assignments}
                        onAssignmentsUpdate={onAssignmentsUpdate}
                    />
                )}
            </div>
        </div>
    );
};

export default AdminPanel;