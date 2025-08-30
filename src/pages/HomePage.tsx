// src/pages/HomePage.tsx

// Importar el tipo de Routine desde el archivo de tipos
import { useState, useEffect } from 'react';
import type { Routine } from '../types';
import { db } from '../services/db';
import CreateRoutineForm from '../components/CreateRoutineForm';

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
    const fetchRoutines = async () => {
        const allRoutines = await db.getAllRoutines();
        setRoutines(allRoutines);
    };

    // useEffect para cargar los datos cuando el componente se monta
    useEffect(() => {
        fetchRoutines();
    }, []); // El array vacío es para ejecutar una sola vez 

    return (
        <div>
            <h2>Mis Rutinas</h2>

             {/* Si no hay rutinas, muestra un mensaje. Si hay, muéstralas */}
             {routines.length === 0 ? (
                <p>No tienes ninguna rutina creada. ¡Añade una!</p>
             ) : (
                <ul>
                    {routines.map(routine => (
                        <li key={routine.id}>{routine.name}</li>
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