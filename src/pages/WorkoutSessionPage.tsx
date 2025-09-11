// src/pages/WorkoutSessionPage.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { WorkoutSession, SessionSet, SessionExercise } from '../types';
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

    const handleSetUpdate = async (exerciseId: string, setId: string, updatedData: Partial<SessionSet>) => {
        // Guard
        if ((isTimerActive && updatedData.completed) || !session) return;

        let shouldStartTimer = false;
        let exerciseForTimer: SessionExercise | undefined;

        // Respuesta de UI instantánea 
        const updatedGroups = session.groups.map(group => ({
            ...group,
            exercises: group.exercises.map(ex => {
                if (ex.id === exerciseId) {
                    exerciseForTimer = ex; // Se guarda la referencia para el nombre y tiempo de descanso
                    const updatedSets = ex.sets.map(set => 
                        set.id === setId ? { ...set, ...updatedData } : set
                    );

                    // --- LÓGICA DE SUPERSERIE ---
                    if (updatedData.completed) {
                        const setIndex = ex.sets.findIndex(s =>s.id === setId);
                        const isSuperset = group.exercises.length > 1; 

                        if (!isSuperset) {
                            shouldStartTimer = true;
                        } else {
                            // Es una superserie. Verificamos si los otros ejercicios ya completaron esta ronda. 
                            const allOthersCompleted = group.exercises
                                .filter(otherEx => otherEx.id !== exerciseId)
                                .every(otherEx => otherEx.sets[setIndex]?.completed);
                            
                            if (allOthersCompleted) {
                                shouldStartTimer = true;
                            }
                        }
                    }
                    return { ...ex, sets:updatedSets };
                }
                return ex;
            }) 
        }));

        // Actualización optimista de la UI 
        setSession({ ...session, groups: updatedGroups });
    
        if (shouldStartTimer && exerciseForTimer) {
            setTimerExerciseName(exerciseForTimer.name);
            startTimer(exerciseForTimer.restTime);
        }

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
        // if (session && window.confirm('¿Seguro que quieres finalizar el entrenamiento?')) {
        //     await db.finishWorkoutSession(session.id); 
        //     toast.success('¡Entrenamiento finalizado! Buen trabajo.');
        //     navigate('/'); // Redirigir al usuario a la página de inicio 
        // }

    if (!session) {
        return <div>Cargando sesión...</div>
    }

    return (
        <div className='workout-session'>
            <h1>Modo Gimnasio</h1>
            <p>Iniciada: {new Date(session.startTime).toLocaleTimeString()}</p>


            {session.groups.map(group => (
                <div key={group.id} className='exercise.group'>
                    {group.exercises.map(exercise => (
                        <SessionExerciseItem
                            key={exercise.id}
                            exercise={exercise}
                            onSetUpdate={handleSetUpdate}
                            onAddSet={handleAddSet}
                            isTimerActive={isTimerActive}
                        />
                    ))}
                </div>
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