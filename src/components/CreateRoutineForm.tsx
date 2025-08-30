// src/components/CreateRoutineForm.tsx

import { useState } from 'react';
import { db } from '../services/db';

interface CreateRoutineFormProps {
    onRoutineCreated: () => void; // Es una función que no devuelve nada
}

function CreateRoutineForm({ onRoutineCreated }: CreateRoutineFormProps) {
    // Aquí se introduce el primer hook: useState 
    const [routineName, setRoutineName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        // Prevenir que el formulario recargue la página
        e.preventDefault();

        if (!routineName.trim()) return;

        await db.addRoutine(routineName);

        onRoutineCreated();

        // Limpiar el input después de enviar
        setRoutineName('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Crear Nueva Rutina</h3>
            <input 
                type="text"
                placeholder='Ej: Rutina de 4 días de volumen'
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
            />
            <button type='submit'>Guardar Rutina</button>
        </form>
    );
}

export default CreateRoutineForm;