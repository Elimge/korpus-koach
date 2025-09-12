// src/pages/WorkoutSessionPage.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { WorkoutSession, SessionSet, SessionExercise, SessionExerciseGroup } from '../types';
import { db } from '../services/db';
import SessionExerciseItem from '../components/SessionExerciseItem';
import RestTimer from '../components/RestTimer';
import { useTimer } from '../hooks/useTimer';
import toast from 'react-hot-toast';


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

    const getNextSetIndexForGroup = (group: SessionExerciseGroup): number => {
        if (!group || group.exercises.length === 0) return 0;

        // Se asume que todas las series tienen la misma longitud en una superserie 
        const numSets = group.exercises[0].sets.length;

        for (let i = 0; i < numSets; i++) {
            // Se busca el primer indice donde al menos un ejercicio no ha completado la serie.
            const isRoundIncomplete = group.exercises.some(ex => !ex.sets[i]?.completed);
            if (isRoundIncomplete) {
                return i; // Ronda activa 
            }
        }
        return numSets; // Todas las rondas están completas
    };

    const handleSetUpdate = async (exerciseId: string, setId: string, updatedData: Partial<SessionSet>) => {
        // Guard
        if ((isTimerActive && updatedData.completed) || !session) return;

        let shouldStartTimer = false;
        let exerciseForTimer: SessionExercise | undefined;

        const updatedSession = { ...session };

        // Se busca el grupo y el ejercicio afectados
        const group = updatedSession.groups.find(g => g.exercises.some(e => e.id === exerciseId));
        if (!group) return;

        // Se actualiza el estado de la serie específica
        group.exercises.forEach(ex => {
            if (ex.id === exerciseId) {
                const set = ex.sets.find(s => s.id === setId);
                if (set) Object.assign(set, updatedData);
                exerciseForTimer = ex;
            }
        });

        // --- TEMPORARIZADOR DE SUPERSERIES ---
        if (updatedData.completed) {
            const isSuperset = group.exercises.length > 1; 

            if (!isSuperset) {
                shouldStartTimer = true;
            } else {
                // Se busca el índice de la serie dentro del ejercicio que fue clickeado ('exerciseForTimer').
                const currentSetIndex = exerciseForTimer.sets.findIndex(s => s.id === setId);

                // si el índice es válido (no -1), se procede a comprobar la ronda.
                if (currentSetIndex !== -1) {
                    const isRoundComplete = group.exercises.every(ex => ex.sets[currentSetIndex]?.completed);
                    if (isRoundComplete) {
                        shouldStartTimer = true;
                    }
                }
                // // Se comprueba si todos los ejercicios de esta superserie han completado la ronda actual. 
                // const isRoundComplete = group.exercises.every(ex => ex.sets[currentSetIndex]?.completed);

                // if (isRoundComplete) {
                //     shouldStartTimer = true;
            }
        }

        // Actualización optimista de la UI 
        setSession(updatedSession);

        if (shouldStartTimer && exerciseForTimer) {
            setTimerExerciseName(exerciseForTimer.name);
            startTimer(exerciseForTimer.restTime);
        }

        // Persistencia en la BD
        await db.updateSessionSet(session.id, exerciseId, setId, updatedData);
    };

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
        toast((t) => (
            <span>
                ¿Seguro que quieres finalizar el entrenamiento?
                <button
                    onClick={() => {
                        toast.dismiss(t.id); // Cierra esta notificación
                        // 3. Usamos toast.promise para manejar la operación de borrado
                        toast.promise(
                            (async () => {
                                if (!session?.id) throw new Error('ID de sesión no encontrado.')
                                await db.finishWorkoutSession(session.id);
                                navigate('/');
                            })(),  // La operación a ejecutar 
                            {
                                loading: 'Finalizando sesión...', // Mensaje mientras la promesa está pendiente
                                success: '¡Entrenamiento finalizado! Buen trabajo.', // Mensaje si la promesa se resuelve
                                error: 'No se pudo finalizar.',   // Mensaje si la promesa es rechazada
                            }
                        );

                    }}
                    style={{ marginLeft: '10px' }}
                >
                    Confirmar
                </button>
            </span>
        ));
    };

    if (!session) {
        return <div>Cargando sesión...</div>
    }

    return (
        <div className='workout-session'>
            <h1>Modo Gimnasio</h1>
            <p>Iniciada: {new Date(session.startTime).toLocaleTimeString()}</p>


            {session.groups.map(group => {
                const nextSetIndex = getNextSetIndexForGroup(group);

                return (
                    <div key={group.id} className='exercise.group'>
                        {group.exercises.map(exercise => (
                            <SessionExerciseItem
                                key={exercise.id}
                                exercise={exercise}
                                onSetUpdate={handleSetUpdate}
                                onAddSet={handleAddSet}
                                isTimerActive={isTimerActive}
                                nextSetIndex={nextSetIndex}
                                isSuperset={group.exercises.length > 1}
                            />
                        ))}
                    </div>
                );
            })}
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