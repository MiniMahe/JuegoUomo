import React, { useState, useEffect } from 'react';

const UserRegistration = ({ participants, onParticipantAdd, assignments }) => {
    const [userName, setUserName] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [userAssignment, setUserAssignment] = useState(null);
    const [waitingUsers, setWaitingUsers] = useState([]);
    const [glitchEffect, setGlitchEffect] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            setUserName(savedUser);
            setIsRegistered(true);
            checkAssignment(savedUser);
        }

        const waiting = participants.filter(p =>
            !assignments.some(a => a.name === p.name && a.assigned)
        );
        setWaitingUsers(waiting);

        // Efecto glitch aleatorio
        const glitchInterval = setInterval(() => {
            setGlitchEffect(true);
            setTimeout(() => setGlitchEffect(false), 100);
        }, 3000);

        return () => clearInterval(glitchInterval);
    }, [participants, assignments]);

    const checkAssignment = (name) => {
        const assignment = assignments.find(a =>
            a.name.toLowerCase() === name.toLowerCase() && a.assigned
        );
        setUserAssignment(assignment || null);
    };

    const handleRegister = () => {
        if (!userName.trim()) {
            alert('ERROR: NOMBRE REQUERIDO');
            return;
        }

        if (participants.some(p => p.name.toLowerCase() === userName.toLowerCase())) {
            alert('ERROR: NOMBRE YA REGISTRADO');
            return;
        }

        const newParticipant = {
            name: userName.trim().toUpperCase(),
            registeredAt: new Date().toISOString(),
            assigned: false
        };

        onParticipantAdd(newParticipant);
        setIsRegistered(true);
        localStorage.setItem('currentUser', userName.trim().toUpperCase());
    };

    const handleLogout = () => {
        setUserName('');
        setIsRegistered(false);
        setUserAssignment(null);
        localStorage.removeItem('currentUser');
    };

    const totalAssigned = assignments.filter(a => a.assigned).length;
    const totalWaiting = participants.length - totalAssigned;

    return (
        <div className={`user-registration ${glitchEffect ? 'glitch-effect' : ''}`}>
            <h2 className="glitch-text" data-text="REGISTRO DE PARTICIPANTE">
                REGISTRO DE PARTICIPANTE
            </h2>

            {!isRegistered ? (
                <div className="registration-form">
                    <div className="input-group">
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value.toUpperCase())}
                            placeholder="INGRESA TU NOMBRE EN MAYÚSCULAS"
                            onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                            className="terminal-cursor"
                        />
                        <button onClick={handleRegister}>REGISTRAR</button>
                    </div>

                    <div className="stats">
                        <p>👥 PARTICIPANTES: {participants.length}</p>
                        <p>⏳ PENDIENTES: {totalWaiting}</p>
                        <p>✅ ASIGNADOS: {totalAssigned}</p>
                    </div>
                </div>
            ) : (
                <div className="user-dashboard">
                    <div className="user-header">
                        <h3 className="terminal-cursor">USUARIO: {userName}</h3>
                        <button onClick={handleLogout} className="logout-btn">
                            CERRAR SESIÓN
                        </button>
                    </div>

                    {userAssignment ? (
                        <div className="assignment-reveal">
                            <div className="success-message">
                                <h4 className="glitch-text" data-text="¡ASIGNACIONES CONFIRMADAS!">
                                    ¡ASIGNACIONES CONFIRMADAS!
                                </h4>
                                <div className="assignment-details">
                                    <div className="assignment-item">
                                        <strong>🎁 OBJETO ASIGNADO:</strong>
                                        <span>{userAssignment.assignedItem.toUpperCase()}</span>
                                    </div>
                                    <div className="assignment-item">
                                        <strong>📍 UBICACIÓN ASIGNADA:</strong>
                                        <span>{userAssignment.assignedLocation.toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="waiting-message">
                            <div className="loading-spinner">⚠️</div>
                            <h4>ESPERANDO ASIGNACIONES</h4>
                            <p>EL ADMINISTRADOR PROCEDERÁ CON LAS ASIGNACIONES</p>
                            <div className="waiting-info">
                                <p>POSICIÓN EN COLA: {waitingUsers.findIndex(u => u.name === userName) + 1}</p>
                                <p>ESTADO: REGISTRADO ✅</p>
                            </div>
                        </div>
                    )}

                    <div className="participants-list">
                        <h4>LISTA DE PARTICIPANTES</h4>
                        <div className="participants-grid">
                            {participants.map((participant, index) => {
                                const isAssigned = assignments.some(a =>
                                    a.name === participant.name && a.assigned
                                );
                                return (
                                    <div
                                        key={index}
                                        className={`participant-card ${participant.name === userName ? 'current-user' : ''} ${isAssigned ? 'assigned' : 'waiting'}`}
                                    >
                                        <span className="participant-name">{participant.name}</span>
                                        <span className={`status ${isAssigned ? 'assigned' : 'waiting'}`}>
                                            {isAssigned ? 'ASIGNADO' : 'PENDIENTE'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserRegistration;