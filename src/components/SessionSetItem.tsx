// src/components/SessionSetItem.tsx

import { useState } from 'react';
import type { SessionSet } from '../types';

interface SessionSetItemProps {
    set: SessionSet;
    onUpdate: (updatedData: Partial<SessionSet>) => void;
    isTimerActive: boolean;
    isSuperset: boolean;
    setIndex: number;
    nextSetIndex: number;
}

function SessionSetItem({ set, onUpdate, isTimerActive, isSuperset, setIndex, nextSetIndex }: SessionSetItemProps) {
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

    const isDisabled = 
        set.completed || // Si ya está completada 
        isTimerActive || // Si el temporizador global está activo
        (isSuperset && setIndex !== nextSetIndex); // Si es una superserie y esta no es la ronda activa

    return (
        <li className={`session.set ${set.completed ? 'completed': ''}`}>
            <span>{set.type}</span>
            <input 
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                disabled={isDisabled} 
            />
            <span>kg x</span>
            <input 
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                disabled={isDisabled} 
            />
            <span>reps</span>
            {!set.completed && (
                <button 
                    onClick={handleMarkComplete}
                    disabled={isDisabled}
                >
                    Marcar
                </button>
            )}
        </li>
    );
}

export default SessionSetItem;