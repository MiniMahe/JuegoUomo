class DataService {
    // Datos del administrador (solo se guardan una vez)
    static saveAdminData(participants, items, locations, assignments) {
        const adminData = {
            participants: participants || [],
            items: items || [],
            locations: locations || [],
            assignments: assignments || [],
            lastUpdated: new Date().toISOString()
        };

        console.log('💾 Guardando datos de admin:', adminData);
        localStorage.setItem('adminData', JSON.stringify(adminData));

        // También actualizar el timestamp para forzar actualización en usuarios
        localStorage.setItem('dataVersion', Date.now().toString());

        return adminData;
    }

    static getAdminData() {
        try {
            const data = JSON.parse(localStorage.getItem('adminData') || '{}');
            console.log('📂 Cargando datos de admin:', data);
            return {
                participants: data.participants || [],
                items: data.items || [],
                locations: data.locations || [],
                assignments: data.assignments || [],
                lastUpdated: data.lastUpdated || null
            };
        } catch (error) {
            console.error('Error cargando datos de admin:', error);
            return {
                participants: [],
                items: [],
                locations: [],
                assignments: [],
                lastUpdated: null
            };
        }
    }

    static clearAdminData() {
        localStorage.removeItem('adminData');
        localStorage.removeItem('dataVersion');
        console.log('🗑️ Datos de admin limpiados');
    }

    // Datos de usuario (solo lectura)
    static getUserData() {
        const adminData = this.getAdminData();
        const userData = {
            participants: adminData.participants || [],
            assignments: adminData.assignments || []
        };
        console.log('👤 Datos de usuario cargados:', userData);
        return userData;
    }

    // Verificar si hay datos de admin
    static hasAdminData() {
        const data = this.getAdminData();
        const hasData = data.participants.length > 0 || data.items.length > 0 || data.locations.length > 0;
        console.log('📊 ¿Hay datos de admin?', hasData);
        return hasData;
    }

    // Obtener versión de datos para sincronización
    static getDataVersion() {
        return localStorage.getItem('dataVersion') || '0';
    }
}

export default DataService;