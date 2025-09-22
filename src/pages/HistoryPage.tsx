// src/pages/HistoryPage.tsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import type { WorkoutSession } from '../types';

function HistoryPage() {
    const [sessions, setSessions] = useState<WorkoutSession[]>([]);

    useEffect(() => {
        db.getAllSessions().then(setSessions);
    }, []); 
 
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
                <p>Aún no has completado ningún entrenamiento</p>
            )}
        </div>
    );
}

export default HistoryPage;