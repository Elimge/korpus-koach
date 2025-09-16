// src/pages/WorkoutSummaryPage.tsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import type { WorkoutSession } from '../types';

function WorkoutSummaryPage() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [session, setSession] = useState<WorkoutSession | null>(null);

    useEffect(() => {
        const fetchSession = async () => {
            if (sessionId) {
                const sessionData = await db.getWorkoutSessionById(sessionId);
                setSession(sessionData || null);
            }
        };
        fetchSession();
    }, [sessionId]);

    if (!session) {
        return <div>Cargando resumen...</div>;
    }

    const durationInMinutes = session.endTime
        ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
        : 0;

    return (
        <div>
            <h2>¡Buen Trabajo!</h2>
            <h3>Resumen del Entrenamiento</h3>

            <p><strong>Duración:</strong> {durationInMinutes} minutos</p>
            <p><strong>Tonelaje Total:</strong> {session.totalTonnage?.toFixed(2)} kg</p>

            {/*Estadisticas */}

            <Link to='/'>Volver al Inicio</Link>
        </div>
    );
}

export default WorkoutSummaryPage;
