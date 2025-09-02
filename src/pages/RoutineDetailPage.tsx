// src/pages/RoutineDetailPage.tsx

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Routine } from '../types';
import { db } from '../services/db';
import CreateWorkoutDayForm from '../components/CreateWorkoutDayForm';

function RoutineDetailPage() {
    // Se usa useParams para obtener el objeto de parámetros.
    const { routineId } = useParams<{ routineId: string }>();
    const [routine, setRoutine] = useState<Routine | null>(null);
    const navigate = useNavigate();

    const fetchRoutine = async () => {
        if (routineId) {
            const fetchedRoutine = await db.getRoutineById(routineId);
            setRoutine(fetchedRoutine || null);
        }
    };

    useEffect(() => {
        fetchRoutine();
    }, [routineId]);

    const handleStartWorkout = async (dayId: string) => {
        if (routineId) {
            try {
                // Se llama al servicio para crear la sesión 
                const newSessionId = await db.startWorkoutSession(routineId, dayId);
                // Se usa navigate para redirigir al usuario a la nueva página 
                navigate(`/session/${newSessionId}`);
            } catch (error) {
                console.error('No se pudo iniciar la sesión: ', error); 
                alert('Error al iniciar la sesión.');
            }
        }
    };

    if (!routine) {
        return <div>Rutina no encontrada o cargando...</div>;
    }

    return (
        <div>
            {/* Añadimos un enlace para volver a la página principal */}
            <Link to="/">&larr; Volver a Mis Rutinas</Link>

            <h2>{routine.name}</h2>

            {routine.days.length > 0 ? (
                <ul>
                    {routine.days.map(day => (
                        <li key={day.id}>
                            <Link to={`/routine/${routine.id}/day/${day.id}`}>
                                {day.name}
                            </Link>
                            <button onClick={() => handleStartWorkout(day.id)}>
                                ¡Empezar Entrenamiento!
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Esta rutina todavía no tiene días de entrenamiento.</p>
            )}

            <hr /> 

            {routineId && (
                <CreateWorkoutDayForm
                    routineId={routineId}
                    onDayCreated={fetchRoutine}
                />
            )}
        </div>
    );
}

export default RoutineDetailPage;