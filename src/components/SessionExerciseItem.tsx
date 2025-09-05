// src/components/SessionExerciseItem.tsx

import type { SessionExercise, SessionSet } from '../types';
import SessionSetItem from './SessionSetItem';

interface SessionExerciseItemProps {
    exercise: SessionExercise;
    onSetUpdate: (exerciseId: string, setId: string, updatedData: Partial<SessionSet>) => void;
    onAddSet: (exerciseId: string) => void;
    isTimerActive: boolean;
}

function SessionExerciseItem({ exercise, onSetUpdate, onAddSet, isTimerActive }: SessionExerciseItemProps) {
    return (
        <details className='session-exercise' open>
            <summary>{exercise.name}</summary>
            <ul>
                {exercise.sets.map(set => (
                    <SessionSetItem
                        key={set.id}
                        set={set}
                        onUpdate={(updatedData) => onSetUpdate(exercise.id, set.id, updatedData)}
                        isTimerActive={isTimerActive}
                    />
                ))}
            </ul>
            <button className="add-set-button" onClick={() => onAddSet(exercise.id)}>
                + Añadir Serie
            </button>
        </details>
    );
}

export default SessionExerciseItem;