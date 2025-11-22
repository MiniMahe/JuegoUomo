// Instrucciones para configurar JSONBin.io:
// 1. Ve a https://jsonbin.io/ y crea una cuenta gratuita
// 2. Obtén tu API Key desde el dashboard
// 3. Crea un nuevo "bin" y copia el ID
// 4. Reemplaza los valores en el archivo .env

const JSONBIN_CONFIG = {
    // Reemplaza estos valores con los tuyos
    BIN_ID: process.env.REACT_APP_JSONBIN_BIN_ID || 'tu-bin-id-aqui',
    API_KEY: process.env.REACT_APP_JSONBIN_API_KEY || 'tu-api-key-aqui'
};

// Script para inicializar el bin por primera vez
export const initializeJsonBin = async () => {
    const initialData = {
        currentGame: null,
        activeSessions: {},
        lastUpdated: new Date().toISOString(),
        initialized: true
    };

    try {
        const response = await fetch('https://api.jsonbin.io/v3/b', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_CONFIG.API_KEY,
                'X-Bin-Name': 'Game Data Storage'
            },
            body: JSON.stringify(initialData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ JSONBin inicializado con ID:', result.metadata.id);
            return result.metadata.id;
        }
    } catch (error) {
        console.error('❌ Error inicializando JSONBin:', error);
    }

    return null;
};

export default JSONBIN_CONFIG;