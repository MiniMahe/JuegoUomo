import React, { useState } from 'react';
import JsonDatabaseService from '../services/jsonDatabaseService';

const JsonBinSetup = () => {
    const [binId, setBinId] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [message, setMessage] = useState('');

    const testConnection = async () => {
        if (!binId || !apiKey) {
            setMessage('❌ Por favor ingresa tanto el Bin ID como la API Key');
            return;
        }

        try {
            // Temporalmente actualizar la configuración
            JsonDatabaseService.BIN_ID = binId;
            JsonDatabaseService.API_KEY = apiKey;

            const connected = await JsonDatabaseService.testConnection();

            if (connected) {
                setIsConnected(true);
                setMessage('✅ ¡Conexión exitosa con JSONBin!');

                // Guardar en localStorage para futuras sesiones
                localStorage.setItem('jsonbin_config', JSON.stringify({ binId, apiKey }));
            } else {
                setIsConnected(false);
                setMessage('❌ No se pudo conectar con JSONBin. Verifica tus credenciales.');
            }
        } catch (error) {
            setIsConnected(false);
            setMessage('❌ Error de conexión: ' + error.message);
        }
    };

    const loadSavedConfig = () => {
        const saved = localStorage.getItem('jsonbin_config');
        if (saved) {
            const config = JSON.parse(saved);
            setBinId(config.binId);
            setApiKey(config.apiKey);
        }
    };

    // Cargar configuración guardada al montar el componente
    React.useEffect(() => {
        loadSavedConfig();
    }, []);

    return (
        <div className="jsonbin-setup">
            <h3>🔧 Configuración de JSONBin</h3>
            <p className="setup-info">
                JSONBin.io actúa como base de datos compartida para que todos los usuarios
                vean la misma partida en tiempo real.
            </p>

            <div className="setup-form">
                <div className="input-group">
                    <label>Bin ID:</label>
                    <input
                        type="text"
                        value={binId}
                        onChange={(e) => setBinId(e.target.value)}
                        placeholder="Ej: 1234567890abcdef"
                    />
                </div>

                <div className="input-group">
                    <label>API Key:</label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Ej: $2a$10$TuApiKey..."
                    />
                </div>

                <button onClick={testConnection} className="test-btn">
                    🔗 Probar Conexión
                </button>

                {message && (
                    <div className={`message ${isConnected ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                {isConnected && (
                    <div className="connection-info">
                        <h4>✅ Conectado a JSONBin</h4>
                        <p>Los datos del juego ahora se comparten entre todos los usuarios.</p>
                    </div>
                )}
            </div>

            <div className="instructions">
                <h4>📝 Instrucciones para configurar JSONBin:</h4>
                <ol>
                    <li>Ve a <a href="https://jsonbin.io" target="_blank" rel="noopener noreferrer">jsonbin.io</a></li>
                    <li>Crea una cuenta gratuita</li>
                    <li>Ve a "My Bins" y crea un nuevo bin</li>
                    <li>Copia el "Bin ID" y pégalo arriba</li>
                    <li>Ve a "API Keys" y crea una nueva key</li>
                    <li>Copia la "Secret Key" y pégalo arriba</li>
                    <li>Haz click en "Probar Conexión"</li>
                </ol>
            </div>
        </div>
    );
};

export default JsonBinSetup;