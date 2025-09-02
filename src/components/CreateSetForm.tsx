// src/components/CreateSetForm.tsx

import { useState } from 'react';
import { db } from '../services/db';
import { setTypes, type SetType } from '../types';

interface CreateSetFormProps {
    routineId: string;
    dayId: string;
    exerciseId: string;
    onSetCreated: () => void;
}

function CreateSetForm({ routineId, dayId, exerciseId, onSetCreated }: CreateSetFormProps) {
    const [reps, setReps] = useState(8); // Valor por defecto 
    const [type, setType] = useState<SetType>('Normal');
    const [weight, setWeight] = useState(0); // Peso objetivo 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await db.addSetToExercise(routineId, dayId, exerciseId, {
            type,
            reps,
            weight // Se pasa el peso
        });
        onSetCreated(); 
        // No se resetean los valores para añadir series similares
    }; 

    return (
        <form onSubmit={handleSubmit} className='create-set-form'>
            <select value={type} onChange={e => setType(e.target.value as SetType)}>
                {setTypes.map(setType => (
                    <option key={setType} value={setType}>{setType}</option>
                ))}
            </select>
            <input 
                type='number'
                value={weight}
                onChange={e => setWeight(Number(e.target.value))}
                placeholder='Peso' 
            />
            <span>x</span>
            <input 
                type='number'
                value={reps}
                onChange={e => setReps(Number(e.target.value))}
                placeholder='Reps' 
            />
            <button type='submit'>Añadir Serie</button>
        </form>
    );
}

export default CreateSetForm; 