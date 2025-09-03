// src/components/SessionExerciseItem.tsx

import type { SessionExercise, SessionSet } from '../types';
import SessionSetItem from './SessionSetItem';

interface SessionExerciseItemProps {
    exercise: SessionExercise;
    onSetUpdate: (exerciseId: string, setId: string, updatedData: Partial<SessionSet>) => void; 
}

function SessionExerciseItem({ exercise, onSetUpdate }: SessionExerciseItemProps) {
    return (
        <details className='session-exercise' open>
            <summary>{exercise.name}</summary>
            <ul>
                {exercise.sets.map(set => (
                    <SessionSetItem
                        key={set.id}
                        set={set}
                        onUpdate={(updatedData) => onSetUpdate(exercise.id, set.id, updatedData)}
                    />
                ))}
            </ul>
        </details>
    );
}

export default SessionExerciseItem;