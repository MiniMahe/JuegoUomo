import React, { useState } from 'react';

const ResultsView = ({ assignments, participants, items, locations }) => {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const assignedParticipants = assignments.filter(a => a.assigned);
    const unassignedParticipants = participants.filter(p =>
        !assignments.some(a => a.name === p.name && a.assigned)
    );

    const filteredAssignments = assignedParticipants.filter(assignment => {
        const matchesFilter = filter === 'all' ||
            (filter === 'assigned' && assignment.assigned) ||
            (filter === 'unassigned' && !assignment.assigned);

        const matchesSearch = assignment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.assignedItem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.assignedLocation?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const exportToCSV = () => {
        const headers = ['Participante', 'Objeto', 'Ubicación', 'Fecha de Asignación'];
        const csvData = assignedParticipants.map(assignment => [
            assignment.name,
            assignment.assignedItem,
            assignment.assignedLocation,
            new Date(assignment.assignmentDate).toLocaleString()
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `asignaciones-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="results-view">
            <div className="results-header">
                <h2 className="glitch-text" data-text="RESULTADOS DE ASIGNACIONES">
                    RESULTADOS DE ASIGNACIONES
                </h2>

                <div className="results-controls">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Buscar participante, objeto o ubicación..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">Todos ({participants.length})</option>
                        <option value="assigned">Asignados ({assignedParticipants.length})</option>
                        <option value="unassigned">No asignados ({unassignedParticipants.length})</option>
                    </select>

                    <button onClick={exportToCSV} className="export-btn">
                        📊 Exportar CSV
                    </button>
                </div>
            </div>

            <div className="results-stats">
                <div className="stat-card">
                    <h3>Total Participantes</h3>
                    <p className="stat-number">{participants.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Asignados</h3>
                    <p className="stat-number assigned">{assignedParticipants.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Pendientes</h3>
                    <p className="stat-number waiting">{unassignedParticipants.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Objetos Disponibles</h3>
                    <p className="stat-number">{items.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Ubicaciones Disponibles</h3>
                    <p className="stat-number">{locations.length}</p>
                </div>
            </div>

            <div className="assignments-table">
                <table>
                    <thead>
                        <tr>
                            <th>Participante</th>
                            <th>Objeto Asignado</th>
                            <th>Ubicación Asignada</th>
                            <th>Fecha/Hora</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssignments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="no-data">
                                    {searchTerm ? 'No se encontraron resultados' : 'No hay asignaciones para mostrar'}
                                </td>
                            </tr>
                        ) : (
                            filteredAssignments.map((assignment, index) => (
                                <tr key={index}>
                                    <td className="participant-name">{assignment.name}</td>
                                    <td className="item-assigned">{assignment.assignedItem}</td>
                                    <td className="location-assigned">{assignment.assignedLocation}</td>
                                    <td className="assignment-date">
                                        {new Date(assignment.assignmentDate).toLocaleString()}
                                    </td>
                                    <td>
                                        <span className="status-badge assigned">✅ Asignado</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {unassignedParticipants.length > 0 && (
                <div className="unassigned-section">
                    <h3>Participantes Pendientes de Asignación</h3>
                    <div className="unassigned-list">
                        {unassignedParticipants.map((participant, index) => (
                            <span key={index} className="unassigned-tag">
                                {participant.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsView;