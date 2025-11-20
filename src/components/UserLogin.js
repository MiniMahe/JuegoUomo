import React, { useState, useEffect } from 'react';
import AuthService from '../services/authService';
import DataService from '../services/dataService';

const UserLogin = ({ onLoginSuccess }) => {
    const [userName, setUserName] = useState('');
    const [error, setError] = useState('');
    const [existingUsers, setExistingUsers] = useState([]);

    useEffect(() => {
        // Limpiar sesiones expiradas
        AuthService.cleanupExpiredSessions();

        // Cargar usuarios existentes de los datos del admin
        loadExistingUsers();

        // Verificar si ya hay una sesión activa
        const currentSession = AuthService.getCurrentSession();
        if (currentSession) {
            onLoginSuccess(currentSession.userName);
        }
    }, [onLoginSuccess]);

    const loadExistingUsers = () => {
        const userData = DataService.getUserData();
        console.log('Datos de usuario cargados:', userData);
        setExistingUsers(userData.participants || []);
    };

    const handleLogin = () => {
        setError('');

        if (!userName.trim()) {
            setError('Por favor ingresa tu nombre');
            return;
        }

        const normalizedName = userName.trim().toUpperCase();
        console.log('Intentando login para:', normalizedName);
        console.log('Usuarios existentes:', existingUsers);

        // Verificar si el usuario existe en los datos del admin
        const userExists = existingUsers.some(user =>
            user.name.toUpperCase() === normalizedName
        );

        console.log('Usuario existe:', userExists);

        if (!userExists) {
            setError('Nombre no registrado. Contacta al administrador.');
            return;
        }

        // Crear sesión
        const session = AuthService.createUserSession(normalizedName);
        console.log('Sesión creada:', session);
        onLoginSuccess(normalizedName);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="user-login">
            <div className="login-container">
                <h2>ACCESO PARTICIPANTE</h2>

                <div className="login-form">
                    <div className="input-group">
                        <input
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="INGRESA TU NOMBRE REGISTRADO"
                            className="login-input"
                        />
                        <button onClick={handleLogin} className="login-btn">
                            INGRESAR
                        </button>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                </div>

                <div className="login-info">
                    <h4>PARTICIPANTES REGISTRADOS ({existingUsers.length}):</h4>
                    <div className="users-list">
                        {existingUsers.length === 0 ? (
                            <p>No hay participantes registrados aún. El administrador debe agregarlos primero.</p>
                        ) : (
                            existingUsers.map((user, index) => (
                                <span key={index} className="user-tag">
                                    {user.name}
                                </span>
                            ))
                        )}
                    </div>
                </div>

                <div className="debug-info" style={{ marginTop: '20px', padding: '10px', background: '#264653', borderRadius: '5px', fontSize: '12px' }}>
                    <strong>Debug Info:</strong><br />
                    Usuarios cargados: {existingUsers.length}<br />
                    Última actualización: {new Date().toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};

export default UserLogin;