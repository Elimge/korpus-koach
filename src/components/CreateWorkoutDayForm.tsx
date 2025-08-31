// src/components/CreateWorkoutDayForm.tsx

import { useState } from 'react';
import { db } from '../services/db';

interface CreateWorkoutDayFormProps {
  routineId: string;
  onDayCreated: () => void;
}

function CreateWorkoutDayForm({ routineId, onDayCreated }: CreateWorkoutDayFormProps) {
    const [dayName, setDayName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dayName.trim()) return; 

        // Nuevo método del servicio con ID de la rutina y nombre del nuevo día 
        await db.addWorkoutDayToRoutine(routineId, dayName);

        // Notificar al componenten padre que fue creado para que pueda refrescarse. 
        onDayCreated();

        setDayName('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <h4>Añadir Día de Entrenamiento</h4>
            <input
                type='text'
                placeholder='Ej: Lunes: Pecho y Tríceps'
                value={dayName}
                onChange={(e) => setDayName(e.target.value)}
            />
            <button type='submit'>Añadir Día</button>
        </form>
    );
}

export default CreateWorkoutDayForm; 