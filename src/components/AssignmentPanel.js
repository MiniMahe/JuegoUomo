import React from 'react';
import { AssignmentService } from '../services/assignmentService';

const AssignmentPanel = ({ participants, items, locations, assignments, onAssignmentsUpdate }) => {
    const handleAssign = () => {
        try {
            const assignedParticipants = AssignmentService.assignItems(
                participants.map(name => ({ name })),
                items,
                locations
            );

            onAssignmentsUpdate(assignedParticipants);
            alert('Asignaciones realizadas exitosamente!');
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleClearAssignments = () => {
        onAssignmentsUpdate([]);
    };

    const isValidForAssignment =
        participants.length > 0 &&
        items.length >= participants.length &&
        locations.length >= participants.length;

    return (
        <div className="assignment-panel">
            <h3>Asignación de Objetos y Ubicaciones</h3>

            <div className="assignment-controls">
                <button
                    onClick={handleAssign}
                    disabled={!isValidForAssignment}
                >
                    Realizar Asignaciones Aleatorias
                </button>

                <button
                    onClick={handleClearAssignments}
                    style={{ marginLeft: '10px', backgroundColor: '#ff4444' }}
                >
                    Limpiar Asignaciones
                </button>
            </div>

            {!isValidForAssignment && (
                <p style={{ color: '#ff4444', marginTop: '10px' }}>
                    {participants.length === 0
                        ? 'Agrega participantes primero'
                        : `Necesitas al menos ${participants.length} objetos y ${participants.length} ubicaciones`}
                </p>
            )}

            <div className="assignments-list">
                <h4>Asignaciones Actuales:</h4>
                {assignments.length === 0 ? (
                    <p>No hay asignaciones realizadas</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Participante</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Objeto</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Ubicación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map((assignment, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{assignment.name}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{assignment.assignedItem}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{assignment.assignedLocation}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AssignmentPanel;