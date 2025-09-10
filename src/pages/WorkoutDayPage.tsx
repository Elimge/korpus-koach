// src/pages/WorkoutDayPage.tsx 

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { WorkoutDay } from '../types';
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
        
        // if (!routineId || !dayId || !window.confirm('¿Seguro que quieres eliminar este ejercicio?')) return;
        // await db.deleteExercise(routineId, dayId, exerciseId);
        // fetchDay();
    }

    if (!day) {
        return <div>Día no encontrado o cargando...</div>
    }

    return (
        <div>
            <Link to={`/routine/${routineId}`}>&larr; Volver a la Rutina</Link>
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