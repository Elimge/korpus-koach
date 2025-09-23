// src/pages/HistoryPage.tsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import type { WorkoutSession } from '../types';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

function HistoryPage() {
    const [sessions, setSessions] = useState<WorkoutSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const allSessions = await db.getAllSessions();
                setSessions(allSessions);
            } catch (error) {
                console.error('Error al cargar el historial:', error);
                toast.error('No se pudo cargar el historial.');
            } finally {
                setIsLoading(false); // 3. Desactiva el loading
            }
        };
        fetchSessions();
    }, []); 

    if (isLoading) {
        return <Spinner />;
    }
 
    return (
        <div>
            <h2>Historial de Entrenamiento</h2>
            {sessions.length > 0 ? ( 
                <ul>
                    {sessions.map(session => (
                        <li key={session.id}>
                            <span>
                                {new Date(session.startTime).toLocaleDateString('es-ES', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </span>
                            <Link to={`/session/${session.id}/summary`}>Ver Resumen</Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <EmptyState
                    title='Tu Historial de Entrenamientos'
                    message='Cuando completes tu primera sesión de entrenamiento, aparecerá aquí.'
                />
            )}
        </div>
    );
}

export default HistoryPage;