// src/components/ExerciseGroupItem.tsx

import type { ExerciseGroup, Exercise, WorkoutSet } from '../types';
import CreateSetForm from './CreateSetForm';
import TemplateSetItem from './TemplateSetItem';
import { db } from '../services/db';
import toast from 'react-hot-toast';

interface ExerciseGroupItemProps {
    group: ExerciseGroup;
    routineId: string;
    dayId: string;
    // Props para el estado de edición 
    editingExerciseId: string | null;
    editingExName: string;
    editingExRest: number;
    // Props para los manejadores de eventos
    onNameChange: (name: string) => void;
    onRestChange: (rest: number) => void;
    onEditClick: (exercise: Exercise) => void;
    onSaveClick: (exerciseId: string) => void;
    onCancelClick: () => void;
    onDeleteClick: (exerciseId: string) => void;
    // Prop para refrescar los datos cuando se añade una serie
    onDataChanged: () => Promise<void>;
}

function ExerciseGroupItem({
    group, routineId, dayId,
    editingExerciseId, editingExName, editingExRest,
    onNameChange, onRestChange, onEditClick, onSaveClick, onCancelClick, onDeleteClick,
    onDataChanged
}: ExerciseGroupItemProps) {
    const isSuperSet = group.exercises.length > 1;

    return (
        <div className={`exercise-group-item ${isSuperSet ? "superset" : ""}`}>
            {isSuperSet && <h4 className='superset-title'>Superserie</h4>}

            {group.exercises.map(exercise => {
                const handleUpdateSet = async (setId: string, updates: Partial<WorkoutSet>) => {
                    await db.updateSetInTemplate(routineId, dayId, exercise.id, setId, updates);
                    await onDataChanged();
                };

                const handleDeleteSet = async (setId: string) => {
                    toast((t) => (
                        <span>
                            ¿Eliminar este set?
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id); // Cierra esta notificación
                                    // toast.promise para manejar la operación de borrado
                                    toast.promise(
                                        db.deleteSetInTemplate(routineId, dayId, exercise.id, setId).then(() => onDataChanged()), // La operación a ejecutar 
                                        {
                                            loading: 'Eliminando...', // Mensaje mientras la promesa está pendiente
                                            success: 'Set eliminado.', // Mensaje si la promesa se resuelve
                                            error: 'No se pudo eliminar',   // Mensaje si la promesa es rechazada
                                        }
                                    );
                                }}
                                style={{ marginLeft: '10px' }}
                            >
                                Confirmar
                            </button>
                        </span>
                    ));
                    // if (window.confirm("¿Seguro que quieres eliminar esta serie?")) {
                    //     await db.deleteSetInTemplate(routineId, dayId, exercise.id, setId);
                    //     await onDataChanged();
                    // }
                };

                return (
                    <div key={exercise.id} className='exercise-container'>
                        {editingExerciseId === exercise.id ? (
                            <div className='exercise-edit-mode'>
                                <input
                                    type='text'
                                    value={editingExName}
                                    onChange={(e) => onNameChange(e.target.value)}
                                />
                                <input
                                    type='number'
                                    value={editingExRest}
                                    onChange={(e) => onRestChange(Number(e.target.value))}
                                />
                                <span>seg. descanso</span>
                                <button onClick={() => onSaveClick(exercise.id)}>Guardar</button>
                                <button onClick={onCancelClick}>Cancelar</button>
                            </div>
                        ) : (
                            <details className='exercise-item'>
                                <summary>
                                    <div className='exercise-summary-content'>
                                        <span>{exercise.name} ({exercise.restTime}s)</span>
                                        <div>
                                            <button onClick={() => onEditClick(exercise)}>Editar</button>
                                            <button onClick={() => onDeleteClick(exercise.id)}>Eliminar</button>
                                        </div>
                                    </div>
                                </summary>

                                <div className='exercise-details'>
                                    {exercise.sets.length > 0 ? (
                                        <ul>
                                            {exercise.sets.map(set => (
                                                <TemplateSetItem
                                                    key={set.id}
                                                    set={set}
                                                    onUpdate={handleUpdateSet}
                                                    onDelete={handleDeleteSet}
                                                />
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No hay series definidas para este ejercicio.</p>)}
                                    <CreateSetForm
                                        routineId={routineId}
                                        dayId={dayId}
                                        exerciseId={exercise.id}
                                        onSetCreated={onDataChanged}
                                    />
                                </div>
                            </details>
                        )}
                    </div>
                );
            })}
        </div>
    );
}


export default ExerciseGroupItem;
