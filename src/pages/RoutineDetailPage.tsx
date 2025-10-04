// src/pages/RoutineDetailPage.tsx

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Routine, WorkoutDay } from '../types';
import { db } from '../services/db';
import CreateWorkoutDayForm from '../components/CreateWorkoutDayForm';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { FaPen, FaTrash } from 'react-icons/fa';

function RoutineDetailPage() {
    // Se usa useParams para obtener el objeto de parámetros.
    const { routineId } = useParams<{ routineId: string }>();
    const [routine, setRoutine] = useState<Routine | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingDayId, setEditingDayId] = useState<string | null>(null);
    const [editingDayName, setEditingDayName] = useState('');
    const navigate = useNavigate();

    const fetchRoutine = async () => {
        try {
            if (routineId) {
                const fetchedRoutine = await db.getRoutineById(routineId);
                setRoutine(fetchedRoutine || null);
            }
        } catch (error) {
            console.error('Error al cargar la rutina', error);
            toast.error('No se pudieron cargar las rutinas.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutine();
    }, [routineId]);

    const handleStartWorkout = async (dayId: string) => {
        if (routineId) {
            try {
                // Se llama al servicio para crear la sesión 
                const newSessionId = await db.startWorkoutSession(routineId, dayId);
                // Se usa navigate para redirigir al usuario a la nueva página 
                navigate(`/session/${newSessionId}`);
            } catch (error) {
                console.error('No se pudo iniciar la sesión: ', error);
                alert('Error al iniciar la sesión.');
            }
        }
    };

    const handleDeleteDay = async (dayId: string) => {
        toast((t) => (
            <span>
                ¿Eliminar este día de entrenamiento y sus ejercicios?
                <button
                    onClick={() => {
                        toast.dismiss(t.id); // Cierra esta notificación
                        // toast.promise para manejar la operación de borrado
                        toast.promise(
                            (async () => {
                                if (!routineId) throw new Error("ID de rutina no encontrado.")
                                await db.deleteWorkoutDay(routineId, dayId);
                                await fetchRoutine();
                            })(),  // La operación a ejecutar 
                            {
                                loading: 'Eliminando...', // Mensaje mientras la promesa está pendiente
                                success: 'Día de entrenamiento eliminado.', // Mensaje si la promesa se resuelve
                                error: 'No se pudo eliminar',   // Mensaje si la promesa es rechazada
                            }
                        );
                    }}
                    style={{ marginLeft: '10px' }}
                >
                    Confirmar
                </button>
            </span>
        ));
        // if (routineId && window.confirm('¿Seguro que quieres eliminar este día de entrenamiento?')) {
        //     await db.deleteWorkoutDay(routineId, dayId);
        //     fetchRoutine();
        // }
    };

    const handleEditDayClick = (day: WorkoutDay) => {
        setEditingDayId(day.id);
        setEditingDayName(day.name);
    };

    const handleSaveDayClick = async (dayId: string) => {
        if (routineId) {
            await db.updateWorkoutDayName(routineId, dayId, editingDayName);
            setEditingDayId(null);
            fetchRoutine();
        }
    };

    if (isLoading) {
        return <Spinner />;
    }

    if (!routine) {
        return (
            <div>
                <h3>Rutina no encontrada</h3>
                <p>Es posible que haya sido eliminado o el enlace sea incorrecto.</p>
                <Link to="/">Volver a mis rutinas</Link>
            </div>
        );
    }

    return (
        <div>
            {/* Añadimos un enlace para volver a la página principal */}
            <Link to="/routines">&larr; Volver a Mis Rutinas</Link>

            <h2>{routine.name}</h2>

            {routine.days.length > 0 ? (
                <div className="days-list">
                    {routine.days.map(day => (
                        <div key={day.id} className="card">
                            {editingDayId === day.id ? (
                                // --- MODO EDICIÓN ---
                                <div className="card-header">
                                    <input
                                        type='text'
                                        value={editingDayName}
                                        onChange={(e) => setEditingDayName(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="card-actions">
                                        <button onClick={() => handleSaveDayClick(day.id)}>Guardar</button>
                                        <button onClick={() => setEditingDayId(null)}>Cancelar</button>
                                    </div>
                                </div>
                            ) : (
                                // --- MODO VISUALIZACIÓN ---
                                <div className="card-header">
                                    <h3>{day.name}</h3>
                                    <div className="card-actions">
                                        <button onClick={() => handleStartWorkout(day.id)}>Empezar</button>
                                        <button onClick={() => handleEditDayClick(day)} className="icon-button">
                                            <FaPen />
                                        </button>
                                        <button onClick={() => handleDeleteDay(day.id)} className="icon-button delete">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            )}
                            <Link to={`/routine/${routine.id}/day/${day.id}`}>Gestionar Ejercicios &rarr;</Link>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    title='Añade Días a tu Rutina'
                    message='Una rutina se compone de días de entrenamiento. Añade uno para empezar a planificar tus ejercicios.'
                />
            )}

            <hr />

            {routineId && (
                <CreateWorkoutDayForm
                    routineId={routineId}
                    onDayCreated={fetchRoutine}
                />
            )}
        </div>
    );
}

export default RoutineDetailPage;