// src/pages/WorkoutDayPage.tsx 

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { WorkoutDay } from '../types';
import { db } from '../services/db';
import CreateExerciseForm from '../components/CreateExerciseForm';
import ExerciseGroupItem from '../components/ExerciseGroupItem';

function WorkoutDayPage() {
    // Para la URL Se esperan dos paramatros 
    const { routineId, dayId } = useParams<{ routineId: string, dayId: string }>();
    const [day, setDay] = useState<WorkoutDay | null>(null);

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

    if (!day) {
        return <div>Día no encontrado o cargando...</div>
    }

    return (
        <div>
            <Link to={`/routine/${routineId}`}>&larr; Volver a la Rutina</Link>
            <h2>{day.name}</h2>

            {day.groups.length > 0 ? (
                <div className='exercise-list'>
                    {day.groups.map(group => (
                        <ExerciseGroupItem
                            key={group.id}
                            group={group}
                            routineId={routineId!}
                            dayId={dayId!}
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