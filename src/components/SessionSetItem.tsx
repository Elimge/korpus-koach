// src/components/SessionSetItem.tsx

import { useState } from 'react';
import type { SessionSet } from '../types';

interface SessionSetItemProps {
    set: SessionSet;
    onUpdate: (updatedData: Partial<SessionSet>) => void;
}

function SessionSetItem({ set, onUpdate }: SessionSetItemProps) {
    // Estado local para los inputs, inicializando con los valores de la sesión 
    const [weight, setWeight] = useState(set.actualWeight ?? set.weight);
    const [reps, setReps] = useState(set.actualReps ?? set.reps);

    const handleMarkComplete = () => {
        onUpdate({
            actualWeight: weight,
            actualReps: reps,
            completed: true,
        });
    };

    return (
        <li className={`session.set ${set.completed ? 'completed': ''}`}>
            <span>{set.type}</span>
            <input 
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                disabled={set.completed} 
            />
            <span>kg x</span>
            <input 
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                disabled={set.completed} 
            />
            <span>reps</span>
            {!set.completed && (
                <button onClick={handleMarkComplete}>Marcar</button>
            )}
        </li>
    );
}

export default SessionSetItem;