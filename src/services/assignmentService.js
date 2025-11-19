export class AssignmentService {
    static assignItems(participants, items, locations) {
        if (participants.length > items.length || participants.length > locations.length) {
            throw new Error('No hay suficientes objetos o ubicaciones para todos los participantes');
        }

        const shuffledItems = [...items].sort(() => Math.random() - 0.5);
        const shuffledLocations = [...locations].sort(() => Math.random() - 0.5);

        return participants.map((participant, index) => ({
            ...participant,
            assignedItem: shuffledItems[index],
            assignedLocation: shuffledLocations[index]
        }));
    }

    static validateAssignments(assignments) {
        const items = assignments.map(a => a.assignedItem);
        const locations = assignments.map(a => a.assignedLocation);

        const hasDuplicateItems = new Set(items).size !== items.length;
        const hasDuplicateLocations = new Set(locations).size !== locations.length;

        return !hasDuplicateItems && !hasDuplicateLocations;
    }
}