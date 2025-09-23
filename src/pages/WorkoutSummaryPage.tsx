// src/pages/WorkoutSummaryPage.tsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import type { WorkoutSession } from '../types';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

function WorkoutSummaryPage() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [session, setSession] = useState<WorkoutSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            if (!sessionId) {
                setIsLoading(false);
                return;
            }
            try {
                const sessionData = await db.getWorkoutSessionById(sessionId);
                setSession(sessionData || null);
            } catch (error) {
                console.error("Error al cargar el resumen:", error);
                toast.error("No se pudo cargar el resumen de la sesión.");
            } finally {
                setIsLoading(false); // 3. Desactiva el loading
            }
        };
        fetchSession();
    }, [sessionId]);

    if (isLoading) {
        return <Spinner />;
    }

    if (!session) {
        return <div>Resumen de sesión no encontrado.</div>;
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
