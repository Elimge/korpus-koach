// src/components/ExerciseItem.tsx

import type { ExerciseGroup } from '../types';
import CreateSetForm from './CreateSetForm';

interface ExerciseGroupItemProps {
    group: ExerciseGroup;
    routineId: string;
    dayId: string;
    onDataChanged: () => void;
}

function ExerciseGroupItem({ group, routineId, dayId, onDataChanged }: ExerciseGroupItemProps) {
    const isSuperSet = group.exercises.length > 1;
    
    return (
        <div className={`exercise-group-item ${isSuperSet ? "superset" : ""}`}>
            {isSuperSet && <h4 className='superset-title'>Superserie</h4>}
            {group.exercises.map(exercise => (          
                <details key={exercise.id} className='exercise-item' open>
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
            ))}  
        </div>
    );
}

export default ExerciseGroupItem;
