import React, { useState } from 'react';

const ParticipantView = ({ assignments }) => {
    const [participantName, setParticipantName] = useState('');
    const [assignment, setAssignment] = useState(null);

    const handleSearch = () => {
        if (!participantName.trim()) return;

        const foundAssignment = assignments.find(
            assign => assign.name.toLowerCase() === participantName.toLowerCase()
        );

        if (foundAssignment) {
            setAssignment(foundAssignment);
        } else {
            setAssignment(null);
            alert('Participante no encontrado o no tiene asignaciones');
        }
    };

    return (
        <div className="participant-view">
            <h3>Vista del Participante</h3>

            <div className="search-section">
                <input
                    type="text"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Ingresa tu nombre"
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                <button onClick={handleSearch}>Ver Mis Asignaciones</button>
            </div>

            {assignment && (
                <div className="assignment-result" style={{ marginTop: '20px', padding: '15px', border: '2px solid #4CAF50', borderRadius: '5px' }}>
                    <h4>¡Hola {assignment.name}!</h4>
                    <p><strong>Tu objeto asignado:</strong> {assignment.assignedItem}</p>
                    <p><strong>Tu ubicación asignada:</strong> {assignment.assignedLocation}</p>
                </div>
            )}
        </div>
    );
};

export default ParticipantView;