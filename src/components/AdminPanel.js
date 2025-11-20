import React, { useState, useEffect } from 'react';
import CrudPanel from './CrudPanel';
import AssignmentPanel from './AssignmentPanel';
import DataService from '../services/dataService';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
    const [participants, setParticipants] = useState([]);
    const [items, setItems] = useState([]);
    const [locations, setLocations] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [adminCode, setAdminCode] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Cargar datos al iniciar
    useEffect(() => {
        const adminData = DataService.getAdminData();
        console.log('📂 Datos de admin cargados:', adminData);

        setParticipants(adminData.participants || []);
        setItems(adminData.items || []);
        setLocations(adminData.locations || []);
        setAssignments(adminData.assignments || []);

        // Verificar si ya está autenticado
        const savedAuth = localStorage.getItem('adminAuthenticated');
        if (savedAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    // Guardar datos cuando cambien
    useEffect(() => {
        if (isAuthenticated) {
            console.log('💾 Guardando datos de admin...', { participants, items, locations, assignments });
            DataService.saveAdminData(participants, items, locations, assignments);
        }
    }, [participants, items, locations, assignments, isAuthenticated]);

    const handleAdminLogin = () => {
        // Código simple de administrador
        if (adminCode === 'ADMIN2024' || adminCode === 'admin' || adminCode === '1234') {
            setIsAuthenticated(true);
            localStorage.setItem('adminAuthenticated', 'true');
            setAdminCode('');
        } else {
            alert('Código de administrador incorrecto. Prueba con: ADMIN2024, admin o 1234');
        }
    };

    const handleAdminLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('adminAuthenticated');
        setAdminCode('');
    };

    const handleParticipantsUpdate = (names) => {
        console.log('🔄 Actualizando participantes:', names);

        const updatedParticipants = names.map(name => {
            const existing = participants.find(p => p.name === name);
            if (existing) {
                console.log(`Participante existente: ${name}`);
                return existing;
            }
            const newParticipant = {
                name,
                registeredAt: new Date().toISOString(),
                assigned: false
            };
            console.log(`Nuevo participante: ${name}`, newParticipant);
            return newParticipant;
        });

        setParticipants(updatedParticipants);
    };

    const handleAssignmentsUpdate = (newAssignments) => {
        console.log('🎯 Actualizando asignaciones:', newAssignments);

        // Actualizar participantes con sus nuevas asignaciones
        const updatedParticipants = participants.map(participant => {
            const assignment = newAssignments.find(a => a.name === participant.name);
            if (assignment) {
                console.log(`Actualizando asignación para: ${participant.name}`);
                return assignment;
            }
            return participant;
        });

        setParticipants(updatedParticipants);
        setAssignments(newAssignments);
    };

    const clearAllData = () => {
        if (window.confirm('¿ESTÁS SEGURO DE QUE QUIERES ELIMINAR TODOS LOS DATOS? Esta acción no se puede deshacer.')) {
            setParticipants([]);
            setItems([]);
            setLocations([]);
            setAssignments([]);
            DataService.clearAdminData();
            localStorage.removeItem('adminAuthenticated');
            setIsAuthenticated(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-login">
                <div className="login-box">
                    <h2>ACCESO ADMINISTRADOR</h2>
                    <p>Ingresa el código de administrador para continuar</p>
                    <p><small>Prueba con: ADMIN2024, admin o 1234</small></p>
                    <div className="admin-input-group">
                        <input
                            type="password"
                            value={adminCode}
                            onChange={(e) => setAdminCode(e.target.value)}
                            placeholder="Código de administrador"
                            onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                        />
                        <button onClick={handleAdminLogin}>ACCEDER</button>
                    </div>
                    <div className="debug-info" style={{ marginTop: '20px', padding: '10px', background: '#264653', borderRadius: '5px', fontSize: '12px' }}>
                        <strong>Debug Info:</strong><br />
                        Participantes: {participants.length}<br />
                        Objetos: {items.length}<br />
                        Ubicaciones: {locations.length}<br />
                        Asignaciones: {assignments.length}
                    </div>
                </div>
            </div>
        );
    }

    const participantNames = participants.map(p => p.name);
    const assignedCount = participants.filter(p => p.assigned).length;
    const unassignedCount = participants.length - assignedCount;

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h2>PANEL DE ADMINISTRACIÓN</h2>
                <div className="admin-stats">
                    <span>👥 {participants.length} | 🎁 {items.length} | 📍 {locations.length}</span>
                    <button onClick={handleAdminLogout} className="logout-admin-btn">
                        CERRAR SESIÓN ADMIN
                    </button>
                </div>
            </div>

            <nav className="admin-nav">
                <button
                    onClick={() => setActiveSection('dashboard')}
                    className={activeSection === 'dashboard' ? 'active' : ''}
                >
                    📊 DASHBOARD
                </button>
                <button
                    onClick={() => setActiveSection('participants')}
                    className={activeSection === 'participants' ? 'active' : ''}
                >
                    👥 PARTICIPANTES
                </button>
                <button
                    onClick={() => setActiveSection('items')}
                    className={activeSection === 'items' ? 'active' : ''}
                >
                    🎁 OBJETOS
                </button>
                <button
                    onClick={() => setActiveSection('locations')}
                    className={activeSection === 'locations' ? 'active' : ''}
                >
                    📍 UBICACIONES
                </button>
                <button
                    onClick={() => setActiveSection('assignment')}
                    className={activeSection === 'assignment' ? 'active' : ''}
                >
                    🎯 ASIGNACIONES
                </button>
                <button
                    onClick={() => setActiveSection('results')}
                    className={activeSection === 'results' ? 'active' : ''}
                >
                    📊 RESULTADOS
                </button>
            </nav>

            <div className="admin-content">
                {activeSection === 'dashboard' && (
                    <div className="dashboard-section">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>PARTICIPANTES</h3>
                                <div className="stat-number">{participants.length}</div>
                                <div className="stat-detail">
                                    {unassignedCount} pendientes, {assignedCount} asignados
                                </div>
                            </div>
                            <div className="stat-card">
                                <h3>OBJETOS</h3>
                                <div className="stat-number">{items.length}</div>
                                <div className="stat-detail">
                                    {Math.max(0, participants.length - items.length)} faltan
                                </div>
                            </div>
                            <div className="stat-card">
                                <h3>UBICACIONES</h3>
                                <div className="stat-number">{locations.length}</div>
                                <div className="stat-detail">
                                    {Math.max(0, participants.length - locations.length)} faltan
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <h3>ACCIONES RÁPIDAS</h3>
                            <div className="action-buttons">
                                <button
                                    onClick={() => setActiveSection('participants')}
                                    className="action-btn"
                                >
                                    AGREGAR PARTICIPANTES
                                </button>
                                <button
                                    onClick={() => setActiveSection('assignment')}
                                    className="action-btn"
                                >
                                    REALIZAR ASIGNACIONES
                                </button>
                                <button
                                    onClick={clearAllData}
                                    className="danger-button"
                                >
                                    🗑️ LIMPIAR TODOS LOS DATOS
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'participants' && (
                    <div className="participants-section">
                        <CrudPanel
                            title="GESTIÓN DE PARTICIPANTES"
                            items={participantNames}
                            onItemsUpdate={handleParticipantsUpdate}
                            placeholder="Ingresa nombres separados por comas: JUAN, MARÍA, PEDRO..."
                        />
                        <div className="section-info">
                            <p><strong>💡 Información:</strong> Los participantes agregados aquí podrán acceder al sistema.</p>
                            <p>Total de participantes registrados: <strong>{participants.length}</strong></p>
                        </div>
                    </div>
                )}

                {activeSection === 'items' && (
                    <CrudPanel
                        title="GESTIÓN DE OBJETOS"
                        items={items}
                        onItemsUpdate={setItems}
                        placeholder="Ingresa objetos separados por comas: ESPADA, ESCUDO, POCIÓN..."
                    />
                )}

                {activeSection === 'locations' && (
                    <CrudPanel
                        title="GESTIÓN DE UBICACIONES"
                        items={locations}
                        onItemsUpdate={setLocations}
                        placeholder="Ingresa ubicaciones separadas por comas: BOSQUE, CASTILLO, MONTAÑA..."
                    />
                )}

                {activeSection === 'assignment' && (
                    <AssignmentPanel
                        participants={participants}
                        items={items}
                        locations={locations}
                        assignments={assignments}
                        onAssignmentsUpdate={handleAssignmentsUpdate}
                    />
                )}

                {activeSection === 'results' && (
                    <div className="results-preview">
                        <h3>VISTA PREVIA DE RESULTADOS</h3>
                        <div className="assignments-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>PARTICIPANTE</th>
                                        <th>OBJETO</th>
                                        <th>UBICACIÓN</th>
                                        <th>ESTADO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="no-data">
                                                No hay participantes registrados
                                            </td>
                                        </tr>
                                    ) : (
                                        participants.map((participant, index) => (
                                            <tr key={index}>
                                                <td className="participant-name">{participant.name}</td>
                                                <td className="item-assigned">{participant.assignedItem || '-'}</td>
                                                <td className="location-assigned">{participant.assignedLocation || '-'}</td>
                                                <td>
                                                    <span className={`status-badge ${participant.assigned ? 'assigned' : 'waiting'}`}>
                                                        {participant.assigned ? '✅ ASIGNADO' : '⏳ PENDIENTE'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;