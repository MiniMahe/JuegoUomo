class AssignmentService {
    static assignItems(participants, items, locations) {
        console.log('🔧 Iniciando asignación...', {
            participantes: participants.length,
            objetos: items.length,
            ubicaciones: locations.length
        });

        // Validaciones mejoradas
        if (!participants || participants.length === 0) {
            throw new Error('No hay participantes para asignar');
        }

        if (items.length < participants.length) {
            throw new Error(`No hay suficientes objetos. Necesitas al menos ${participants.length} objetos (tienes ${items.length})`);
        }

        if (locations.length < participants.length) {
            throw new Error(`No hay suficientes ubicaciones. Necesitas al menos ${participants.length} ubicaciones (tienes ${locations.length})`);
        }

        // Filtrar solo participantes no asignados
        const unassignedParticipants = participants.filter(p => !p.assigned);
        console.log('Participantes no asignados:', unassignedParticipants.length);

        if (unassignedParticipants.length === 0) {
            throw new Error('Todos los participantes ya tienen asignaciones');
        }

        // Crear copias de los arrays disponibles
        let availableItems = [...items];
        let availableLocations = [...locations];

        console.log('Recursos disponibles:', {
            items: availableItems.length,
            locations: availableLocations.length
        });

        // Mezclar arrays de forma más efectiva
        const shuffleArray = (array) => {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        };

        availableItems = shuffleArray(availableItems);
        availableLocations = shuffleArray(availableLocations);

        // Realizar asignaciones
        const newAssignments = unassignedParticipants.map((participant, index) => {
            if (index >= availableItems.length) {
                throw new Error(`No hay suficientes objetos para el participante ${participant.name}`);
            }
            if (index >= availableLocations.length) {
                throw new Error(`No hay suficientes ubicaciones para el participante ${participant.name}`);
            }

            const assignment = {
                ...participant,
                assignedItem: availableItems[index],
                assignedLocation: availableLocations[index],
                assigned: true,
                assignmentDate: new Date().toISOString(),
                assignmentId: `assign_${Date.now()}_${index}`
            };

            console.log(`Asignado: ${participant.name} -> ${availableItems[index]} / ${availableLocations[index]}`);
            return assignment;
        });

        console.log('✅ Asignaciones completadas:', newAssignments.length);

        // Validar que no hay duplicados
        this.validateNoDuplicates(newAssignments);

        return newAssignments;
    }

    static validateNoDuplicates(assignments) {
        const items = assignments.map(a => a.assignedItem);
        const locations = assignments.map(a => a.assignedLocation);

        const uniqueItems = new Set(items);
        const uniqueLocations = new Set(locations);

        if (uniqueItems.size !== items.length) {
            const duplicates = items.filter((item, index) => items.indexOf(item) !== index);
            throw new Error(`Objetos duplicados detectados: ${duplicates.join(', ')}`);
        }

        if (uniqueLocations.size !== locations.length) {
            const duplicates = locations.filter((loc, index) => locations.indexOf(loc) !== index);
            throw new Error(`Ubicaciones duplicadas detectadas: ${duplicates.join(', ')}`);
        }

        console.log('✅ Validación de duplicados: OK');
    }

    static getParticipantAssignment(participantName, assignments) {
        return assignments.find(
            assignment => assignment.name.toLowerCase() === participantName.toLowerCase() && assignment.assigned
        );
    }

    static clearAllAssignments(participants) {
        return participants.map(participant => ({
            ...participant,
            assigned: false,
            assignedItem: null,
            assignedLocation: null,
            assignmentDate: null,
            assignmentId: null
        }));
    }

    // Nueva función para asignaciones parciales
    static assignToUnassignedOnly(participants, items, locations) {
        const unassigned = participants.filter(p => !p.assigned);
        const assigned = participants.filter(p => p.assigned);

        if (unassigned.length === 0) {
            throw new Error('No hay participantes sin asignar');
        }

        const newAssignments = this.assignItems(unassigned, items, locations);

        // Combinar con los ya asignados
        return [...assigned, ...newAssignments];
    }
}

export default AssignmentService;