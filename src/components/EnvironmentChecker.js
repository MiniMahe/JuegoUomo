import React, { useState, useEffect } from 'react';
import JsonDatabaseService from '../services/jsonDatabaseService';

const EnvironmentChecker = () => {
    const [envStatus, setEnvStatus] = useState('checking');
    const [jsonBinStatus, setJsonBinStatus] = useState('checking');

    useEffect(() => {
        checkEnvironment();
    }, []);

    const checkEnvironment = async () => {
        // Verificar si estamos en producción
        const isProduction = process.env.NODE_ENV === 'production';

        // Verificar variables de entorno
        const hasEnvVars =
            process.env.REACT_APP_JSONBIN_BIN_ID &&
            process.env.REACT_APP_JSONBIN_API_KEY;

        setEnvStatus(hasEnvVars ? 'configured' : 'missing');

        // Verificar conexión con JSONBin
        try {
            const connected = await JsonDatabaseService.testConnection();
            setJsonBinStatus(connected ? 'connected' : 'disconnected');
        } catch (error) {
            setJsonBinStatus('error');
        }
    };

    if (envStatus === 'checking' || jsonBinStatus === 'checking') {
        return null; // O un loading spinner
    }

    // Solo mostrar advertencias en producción
    if (process.env.NODE_ENV === 'production') {
        return (
            <div className="environment-checker">
                {(envStatus === 'missing' || jsonBinStatus !== 'connected') && (
                    <div className="environment-warning">
                        <h4>⚠️ Configuración Requerida</h4>

                        {envStatus === 'missing' && (
                            <p>
                                Las variables de entorno para JSONBin no están configuradas.
                                Los datos no se guardarán correctamente.
                            </p>
                        )}

                        {jsonBinStatus !== 'connected' && (
                            <p>
                                No se pudo conectar con JSONBin. Algunas funciones pueden no estar disponibles.
                            </p>
                        )}

                        <div className="setup-steps">
                            <h5>Para configurar:</h5>
                            <ol>
                                <li>Configura las variables de entorno en tu plataforma de hosting</li>
                                <li>REACT_APP_JSONBIN_BIN_ID: Tu Bin ID de JSONBin</li>
                                <li>REACT_APP_JSONBIN_API_KEY: Tu API Key de JSONBin</li>
                                <li>Re-despliega la aplicación</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default EnvironmentChecker;