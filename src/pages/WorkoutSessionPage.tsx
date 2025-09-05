// src/pages/WorkoutSessionPage.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { WorkoutSession, SessionSet } from '../types';
import { db } from '../services/db';
import SessionExerciseItem from '../components/SessionExerciseItem';
import ExerciseItem from '../components/ExerciseItem';
import RestTimer from '../components/RestTimer';
import { useTimer } from '../hooks/useTimer';


function WorkoutSessionPage() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [session, setSession] = useState<WorkoutSession | null>(null);
    const { remainingTime, isTimerActive, startTimer, initializeTimer } = useTimer();
    const [timerExerciseName, setTimerExerciseName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSession = async () => {
            if (sessionId) {
                const currentSession = await db.getWorkoutSessionById(sessionId);
                setSession(currentSession || null);
            }
        };
        fetchSession();
        initializeTimer(); 
    }, [sessionId]);

    const handleSetUpdate = async (exerciseId: string, setId: string, updatedData: Partial<SessionSet>) => {
        // Guard
        if (isTimerActive && updatedData.completed) return;

        if(!session) return;

        let exerciseForTimer: SessionExercise | undefined;

        // Respuesta de UI instantánea 
        const updatedExercises = session.exercises.map(ex => {
            if (ex.id === exerciseId) {
                exerciseForTimer = ex;
                return {
                    ...ex,
                    sets: ex.sets.map(set => 
                        set.id === setId ? { ...set, ...updatedData } : set
                    ),
                };
            }
            return ex; 
        });
        // Actualización optimista de la UI 
        setSession({ ...session, exercises: updatedExercises });
    
        if (updatedData.completed && exerciseForTimer) {
            setTimerExerciseName(exerciseForTimer.name);
            startTimer(exerciseForTimer.restTime);
        }

        await db.updateSessionSet(session.id, exerciseId, setId, updatedData);
    }

    const handleAddSet = async (exerciseId: string) => {
        if (!session) return;

        // Persistir en la BD primero
        await db.addSetToSessionExercise(session.id, exerciseId);

        // Se vuelven a cargar los datos para obtener la nueva serie con su ID 
        // Simple en lugar de adivinar el nuevo estado (actualización no optimista)
        const updatedSession = await db.getWorkoutSessionById(session.id);
        setSession(updatedSession || null);
    };

    const handleFinishWorkout = async () => {
        if (session && window.confirm('¿Seguro que quieres finalizar el entrenamiento?')) {
            await db.finishWorkoutSession(session.id); 
            alert('¡Entrenamiento finalizado! Buen trabajo.');
            navigate('/'); // Redirigir al usuario a la página de inicio 
        }
    };

    if (!session) {
        return <div>Cargando sesión...</div>
    }

    return (
        <div className='workout-session'>
            <h1>Modo Gimnasio</h1>
            <p>Iniciada: {new Date(session.startTime).toLocaleTimeString()}</p>

            {session.exercises.map(exercise => (
                <SessionExerciseItem
                    key={exercise.id}
                    exercise={exercise}
                    onSetUpdate={handleSetUpdate}
                    onAddSet={handleAddSet}
                    isTimerActive={isTimerActive}
                />
            ))}

            {isTimerActive && (
                <RestTimer remainingTime={remainingTime} exerciseName={timerExerciseName} />
            )}

            <button className='finish-workout' onClick={handleFinishWorkout}>
                Finalizar Entrenamiento
            </button>
        </div>
    );
}

export default WorkoutSessionPage;