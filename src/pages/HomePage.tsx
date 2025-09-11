// src/pages/HomePage.tsx

// Importar el tipo de Routine desde el archivo de tipos
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Routine } from '../types';
import { db } from '../services/db';
import CreateRoutineForm from '../components/CreateRoutineForm';
import toast from 'react-hot-toast'; 

// Dato de prueba (mock data)
// const mockActiveRoutine: Routine = {
//     id: 'routine-1',
//     name: 'Mi rutina de 4 días',
//     isActive: true,
//     days: [
//         {
//             id: 'day-1',
//             name: 'Lunes: Pecho y Tríceps',
//             exercises: [
//                 { id: 'ex-1', name: 'Press de banca', sets: [], restTime: 90 },
//                 { id: 'ex-2', name: 'Fondos en paralela', sets: [], restTime: 75 },
//             ]
//         },
//         {
//             id: 'day-2',
//             name: 'Martes: Espalda y Bíceps',
//             exercises: [
//                 { id: 'ex-3', name: 'Dominadas', sets: [], restTime: 90 },
//                 { id: 'ex-4', name: 'Curl de Bíceps', sets: [], restTime: 60 },
//             ]
//         }
//     ]
// };

// Este es un componente funcional de React.
// Es una función que devuelve JSX (el "HTML" que ves).
// La extensión .tsx es necesaria para que TypeScript entienda JSX.
function HomePage() {
    // Estado para guardar la lista de rutinas que vienen de la BD 
    const [routines, setRoutines] = useState<Routine[]>([]);
     const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
     const [editingName, setEditingName] = useState('');

    const fetchRoutines = async () => {
        const allRoutines = await db.getAllRoutines();
        setRoutines(allRoutines);
    };

    // useEffect para cargar los datos cuando el componente se monta
    useEffect(() => {
        fetchRoutines();
    }, []); // El array vacío es para ejecutar una sola vez 

    const handleDeleteRoutine = async (id: string) => {
        toast((t) => (
            <span>
                ¿Eliminar esta rutina y su historial?
                <button
                    onClick={() => {
                        toast.dismiss(t.id); // Cierra esta notificación
                        // toast.promise para manejar la operación de borrado
                        toast.promise(
                           (async () => {
                                if (!id) throw new Error('ID de rutina no encontrado.')
                                await db.deleteRoutine(id);
                                await fetchRoutines();
                            })(),  // La operación a ejecutar 
                            {
                                loading: 'Eliminando...', // Mensaje mientras la promesa está pendiente
                                success: 'Rutina eliminada.', // Mensaje si la promesa se resuelve
                                error: 'No se pudo eliminar.',   // Mensaje si la promesa es rechazada
                            }
                        );
                    
                    }}
                    style={{ marginLeft: '10px'}}
                >
                    Confirmar
                </button>
            </span>
        ));
        
        // if (window.confirm('¿Seguro que quieres eliminar esta rutina y todo su historial? Esta acción es irreversible.')) {
        //     await db.deleteRoutine(id);
        //     fetchRoutines(); // Refresca la lista
        // }
    };

    const handleEditClick = (routine: Routine) => {
        setEditingRoutineId(routine.id);
        setEditingName(routine.name);
    };

    const handleSaveClick = async (id: string) => {
        await db.updateRoutineName(id, editingName);
        setEditingRoutineId(null); // Salir del modo edición 
        fetchRoutines(); 
    }

    return (
        <div>
            <h2>Mis Rutinas</h2>

             {/* Si no hay rutinas, muestra un mensaje. Si hay, muéstralas */}
             {routines.length === 0 ? (
                <p>No tienes ninguna rutina creada. ¡Añade una!</p>
             ) : (
                <ul>
                    {routines.map(routine => (
                        <li key={routine.id}>
                            {editingRoutineId === routine.id ? (
                                <>
                                    <input 
                                        type='text'
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        autoFocus
                                    />
                                    <button onClick={() => handleSaveClick(routine.id)}>Guardar</button>
                                    <button onClick={() => setEditingRoutineId(null)}>Cancelar</button>
                                </>
                            ) : (
                                <>
                                    <Link to={`/routine/${routine.id}`}>{routine.name}</Link>
                                    <button onClick={() => handleEditClick(routine)}>Editar</button>
                                    <button onClick={() => handleDeleteRoutine(routine.id)} className='delete-btn'>Eliminar</button>
                                </>
                            )}
                            {/* <Link to={`/routine/${routine.id}`}>
                                {routine.name}
                            </Link> */}
                        </li>
                    ))}
                </ul>
             )}

             <hr />

             <CreateRoutineForm onRoutineCreated={fetchRoutines} />

            {/* <p>Días de entrenamiento: </p>
            <ul>
                {
                     Las llaves se usan para poder escribir en javascript 
                    el atributo "key" es crucial en React para identificar 
                    cada elemento de la lista de forma única y optimizar el renderizado 
                }
                {mockActiveRoutine.days.map(day => (
                    <li key={day.id}>{day.name}</li>
                ))}
            </ul> */}
        </div>
    );
}

export default HomePage;