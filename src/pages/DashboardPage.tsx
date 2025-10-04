// src/pages/DashboardPage.tsx

import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { db } from '../services/db';
import Spinner from '../components/Spinner';
import 'react-calendar/dist/Calendar.css'; 
import './Dashboard.css'; 

function DashboardPage() {
    const [completedDates, setCompletedDates] = useState<Date[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        db.getCompletedSessionDates()
            .then(dates => {
                setCompletedDates(dates);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    // Función para añadir contenido custom a cada día del calendario
    const renderTileContent = ({ date, view }: { date: Date, view: string }) => {
        if (view === 'month') {
        // Compara si la fecha del calendario está en el array de fechas completadas
        // Compara con toLocaleDateString para ignorar la hora del día. 
            const isCompleted = completedDates.some(
                completedDate => new Date(completedDate).toLocaleDateString() === date.toLocaleDateString()
            );

            if (isCompleted) {
                return <span className='workout-check'>✅</span>
            }
        }
        return null;
    };

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div className='dashboard'>
            <h2>Tu Actividad</h2>
            <Calendar
                tileContent={renderTileContent}
            />
        </div>
    );
}

export default DashboardPage;


