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
        localStorage.setItem('adminData', JSON.stringify(adminData));
        return adminData;
    }

    static getAdminData() {
        const data = JSON.parse(localStorage.getItem('adminData') || '{}');
        return {
            participants: data.participants || [],
            items: data.items || [],
            locations: data.locations || [],
            assignments: data.assignments || [],
            lastUpdated: data.lastUpdated || null
        };
    }

    static clearAdminData() {
        localStorage.removeItem('adminData');
    }

    // Datos de usuario (solo lectura)
    static getUserData() {
        const adminData = this.getAdminData();
        return {
            participants: adminData.participants || [],
            assignments: adminData.assignments || []
        };
    }

    // Verificar si hay datos de admin
    static hasAdminData() {
        const data = this.getAdminData();
        return data.participants.length > 0 || data.items.length > 0 || data.locations.length > 0;
    }
}

export default DataService;