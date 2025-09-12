// src/pages/WorkoutDayPage.tsx 

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { ExerciseGroup, WorkoutDay } from '../types';
import { db } from '../services/db';
import CreateExerciseForm from '../components/CreateExerciseForm';
import ExerciseGroupItem from '../components/ExerciseGroupItem';
import toast from 'react-hot-toast';

function WorkoutDayPage() {
    // Para la URL Se esperan dos paramatros 
    const { routineId, dayId } = useParams<{ routineId: string, dayId: string }>();
    const [day, setDay] = useState<WorkoutDay | null>(null);
    const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
    const [editingExName, setEditingExName] = useState('');
    const [editingExRest, setEditingExRest] = useState(60);
    const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

    const fetchDay = async () => {
        if (routineId) {
            const routine = await db.getRoutineById(routineId);
            // Se busca el día específico dentro de la rutina 
            const currentDay = routine?.days.find(d => d.id === dayId);
            setDay(currentDay || null);
        }
    };

    useEffect(() => {
        fetchDay();
    }, [routineId, dayId]); // El efecto depende de ambos IDs

    const handleEditExerciseClick = (exercise: Exercise) => {
        setEditingExerciseId(exercise.id);
        setEditingExName(exercise.name);
        setEditingExRest(exercise.restTime);
    };

    const handleCancelEdit = () => {
        setEditingExerciseId(null);
    };

    const handleSaveExercise = async (exerciseId: string) => {
        if (!routineId || !dayId) return;
        await db.updateExercise(routineId, dayId, exerciseId, {
                name: editingExName,
                restTime: editingExRest,                
        });
        setEditingExerciseId(null);
        fetchDay();
    };

    const handleDeleteExercise = async (exerciseId: string) => {
        toast((t) => (
            <span>
                ¿Eliminar este ejercicio?
                <button
                    onClick={() => {
                        toast.dismiss(t.id); // Cierra esta notificación
                        // toast.promise para manejar la operación de borrado
                        toast.promise(
                           (async () => {
                                if (!routineId || !dayId) throw new Error('IDs no encontrados.')
                                await db.deleteExercise(routineId, dayId, exerciseId);
                                await fetchDay();
                            })(),  // La operación a ejecutar 
                            {
                                loading: 'Eliminando...', // Mensaje mientras la promesa está pendiente
                                success: 'Ejercicio eliminado.', // Mensaje si la promesa se resuelve
                                error: 'No se pudo eliminar',   // Mensaje si la promesa es rechazada
                            }
                        );
                    }}
                    style={{ marginLeft: '10px'}}
                >
                    Confirmar
                </button>
            </span>
        ));
    }

    const handleSelectExercise = (exerciseId: string) => {
        setSelectedExercises(prevSelected => {
            if (prevSelected.includes(exerciseId)) {
                // Si ya está seleccionado, se quita 
                return prevSelected.filter(id => id !== exerciseId);
            } else {
                // Si no está seleccionado, se añade 
                return [...prevSelected, exerciseId];
            }
        });
    };

    const handleGroupSuperset = async () => {
        if (!day || !routineId || !dayId) return;

        // Se recogen los ejercicios que no están seleccionados y se dejan en sus propios grupos..
        const nonSelectedGroups: ExerciseGroup[] = [];
        day.groups.forEach(group => {
            group.exercises.forEach(ex => {
                if (!selectedExercises.includes(ex.id)) {
                    nonSelectedGroups.push({ id: crypto.randomUUID(), exercises: [ex] });
                }
            });
        });

        const selectedExs: Exercise[] = [];
        day.groups.forEach(group => {
            group.exercises.forEach(ex => {
                if (selectedExercises.includes(ex.id)) {
                    selectedExs.push(ex);
                }
            });
        });

        const supersetGroup: ExerciseGroup = { id: crypto.randomUUID(), exercises: selectedExs};

        const newGroups = [...nonSelectedGroups, supersetGroup];

        await db.updateDayGroups(routineId, dayId, newGroups);
        setSelectedExercises([]); // Se limpia la selección 
        fetchDay();
    };        

    const handleUnGroupSuperset = async (groupIdToUnGroup: string) => {
        if (!day || !routineId || !dayId) return;

        const newGroups: ExerciseGroup[] = [];
        day.groups.forEach(group => {
            if (group.id === groupIdToUnGroup) {
                // Si es el grupo a desagrupar, se crea un grupo nuevo para cada ejercicio.
                group.exercises.forEach(ex => {
                    newGroups.push({ id: crypto.randomUUID(), exercises: [ex] });
                });
            } else {
                // Si no, se queda como está 
                newGroups.push(group); 
            }
        });

        await db.updateDayGroups(routineId, dayId, newGroups);
        fetchDay();
    }

    if (!day) {
        return <div>Día no encontrado o cargando...</div>
    }

    return (
        <div>
            <Link to={`/routine/${routineId}`}>&larr; Volver a la Rutina</Link>
            {selectedExercises.length > 1 && (
                <button onClick={handleGroupSuperset}>Agrupar {selectedExercises.length} en Superserie</button> )}
            
            <h2>{day.name}</h2>

            {(day.groups && day.groups.length > 0) ? (
                <div className='exercise-list'>
                    {day.groups.map(group => (
                        <ExerciseGroupItem
                            key={group.id}
                            group={group}
                            routineId={routineId!}
                            dayId={dayId!}
                            editingExerciseId={editingExerciseId}
                            editingExName={editingExName}
                            editingExRest={editingExRest}
                            onNameChange={setEditingExName}
                            onRestChange={setEditingExRest}
                            onEditClick={handleEditExerciseClick}
                            onSaveClick={handleSaveExercise}
                            onCancelClick={handleCancelEdit}
                            onDeleteClick={handleDeleteExercise}
                            onDataChanged={fetchDay}
                            selectedExercises={selectedExercises}
                            onSelectExercise={handleSelectExercise}
                            onUnGroup={handleUnGroupSuperset}
                        />
                    ))}
                </div>
            ) : (
                <p>Este día todavía no tiene ejercicios.</p>
            )}
            <hr /> 
            {routineId && dayId && (
                <CreateExerciseForm
                    routineId={routineId}
                    dayId={dayId}
                    onExerciseCreated={fetchDay}
                />
            )}
        </div>
    );
}

export default WorkoutDayPage;