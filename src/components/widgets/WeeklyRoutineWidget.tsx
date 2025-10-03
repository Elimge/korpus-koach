// src/components/widgets/WeeklyRoutineWidget.ts

import { useState, useEffect } from 'react';
import { db } from '../../services/db';
import type { Routine } from '../../types';
import './Widgets.css';

function WeeklyRoutineWidget() {
    const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);

    useEffect(() => {
        db.getActiveRoutine().then(routine => {
            if (routine) setActiveRoutine(routine);
        });
    }, []);

    if (!activeRoutine) {
        return (
            <div className="widget">
                <h4>Rutina Semanal</h4>
                <p>No tienes ninguna rutina activa.</p>
            </div>
        );
    }

    return (
        <div className="widget">
            <h4>{activeRoutine.name}</h4>
            <ul className="weekly-routine-list">
                {activeRoutine.days.map(day => (
                    <li key={day.id}>{day.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default WeeklyRoutineWidget;