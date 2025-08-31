// src/pages/RoutineDetailPage.tsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Routine } from '../types';
import { db } from '../services/db';
import CreateWorkoutDayForm from '../components/CreateWorkoutDayForm';

function RoutineDetailPage() {
    // Se usa useParams para obtener el objeto de parámetros.
    const { routineId } = useParams<{ routineId: string }>();
    const [routine, setRoutine] = useState<Routine | null>(null);

    const fetchRoutine = async () => {
        if (routineId) {
            const fetchedRoutine = await db.getRoutineById(routineId);
            setRoutine(fetchedRoutine || null);
        }
    };

    useEffect(() => {
        fetchRoutine();
    }, [routineId]);

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
                        <li key={day.id}>{day.name}</li>
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