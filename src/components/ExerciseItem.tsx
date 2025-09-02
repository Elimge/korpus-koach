// src/components/ExerciseItem.tsx

import type { Exercise } from '../types';
import CreateSetForm from './CreateSetForm';

interface ExerciseItemProps {
    exercise: Exercise;
    routineId: string;
    dayId: string;
    onDataChanged: () => void;
}

function ExerciseItem({ exercise, routineId, dayId, onDataChanged }: ExerciseItemProps) {
    return (
        <details className='exercise-item'>
            <summary>{exercise.name}</summary>
            <div className='exercise-details'>
                {exercise.sets.length > 0 ? (
                    <ul>
                        {exercise.sets.map(set => (
                            <li key={set.id}>
                                {set.type}: {set.weight} kg x {set.reps} reps
                            </li>
                        ))}
                    </ul>
                ): (
                    <p>No hay series definidas para este ejercicio.</p>
                )}
                <CreateSetForm
                    routineId={routineId}
                    dayId={dayId}
                    exerciseId={exercise.id}
                    onSetCreated={onDataChanged}
                />
            </div>
        </details>
    );
}

export default ExerciseItem;
