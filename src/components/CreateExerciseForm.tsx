// src/components/CreateExerciseForm.tsx

import { useState } from 'react';
import { db } from '../services/db';

interface CreateExerciseFormProps {
    routineId: string; 
    dayId: string;
    onExerciseCreated: () => void;
}

function CreateExerciseForm({ routineId, dayId, onExerciseCreated }: CreateExerciseFormProps) {
    const [exerciseName, setExerciseName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!exerciseName.trim()) return;

        await db.addExerciseToDay(routineId, dayId, exerciseName);
        onExerciseCreated();
        setExerciseName('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <h4>Añadir Ejercicio</h4>
            <input 
                type="text" 
                placeholder="Ej: Press de Banca" 
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)} 
            />
            <button type='submit'>Añadir Ejercicio</button>
        </form>
    );
}

export default CreateExerciseForm;