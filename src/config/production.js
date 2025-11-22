// Configuración para producción
const PRODUCTION_CONFIG = {
    JSONBIN_BIN_ID: process.env.REACT_APP_JSONBIN_BIN_ID,
    JSONBIN_API_KEY: process.env.REACT_APP_JSONBIN_API_KEY,

    // Validar que las variables existan
    validate: function () {
        if (!this.JSONBIN_BIN_ID || !this.JSONBIN_API_KEY) {
            console.warn('⚠️ Variables de entorno de JSONBin no configuradas');
            return false;
        }
        return true;
    },

    // Obtener configuración
    getConfig: function () {
        return {
            binId: this.JSONBIN_BIN_ID,
            apiKey: this.JSONBIN_API_KEY,
            isValid: this.validate()
        };
    }
};

export default PRODUCTION_CONFIG;