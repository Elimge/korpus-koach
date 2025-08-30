// src/pages/RoutineDetailPage.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Routine } from "../types";
import { db } from "../services/db";

function RoutineDetailPage() {
    // Se usa useParams para obtener el objeto de parámetros.
    const { routineId } = useParams<{ routineId: string }>();
    const [routine, setRoutine] = useState<Routine | null>(null);

    useEffect(() => {
        // Si el ID en ña url cambia, este código se volverá a ejecutar
        const fetchRoutine = async () => {
            if (routineId) {
                const fetchedRoutine = await db.getRoutineById(routineId);
                setRoutine(fetchedRoutine || null);
            }
        };

        fetchRoutine();
    }, [routineId]);

    if (!routine) {
        return <div>Rutina no encontrada o cargando...</div>;
    }

    return (
        <div>
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
            {/* Botón para añadir días en el futuro */ }
        </div>
    );
}

export default RoutineDetailPage;