// src/pages/DataPage.tsx
import { useEffect, useState } from 'react';
import { db } from '../services/db';
import type { BodyWeightEntry, PersonalRecord } from '../types';
import AddBodyWeightForm from '../components/AddBodyWeightForm';
import BodyWeightChart  from '../components/charts/BodyWeightChart';

function DataPage() {
    const [history, setHistory] = useState<BodyWeightEntry[]>([]);
    const [prs, setPrs] = useState<PersonalRecord[]>([]);

    const fetchData = async () => {
        const weightData = await db.getBodyWeightHistory();
        const prData = await db.getAllPRs();
        setHistory(weightData);
        setPrs(prData);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Se agrupan los PRs por ejercicio 
    const prsByExercise = prs.reduce((acc, pr) => {
        if (!acc[pr.exerciseName]) {
            acc[pr.exerciseName] = [];
        }
        acc[pr.exerciseName].push(pr);
        return acc;
    }, {} as Record<string, PersonalRecord[]>);

    return (
        <div>
            <h2>Mi Progreso</h2>

            <AddBodyWeightForm onWeightAdded={fetchData} />

            <hr />

            {history.length > 1 ? (
                <>
                    <h3>Evolución del Peso Corporal</h3>
                    <BodyWeightChart data={history} /> 
                </>
            ) : (
                <p>Necesitas al menos dos registros para ver un gráfico de evolución.</p>
            )}

            <h3>Historial de Peso Corporal</h3>
            {history.length > 0 ? (
                <ul>
                    {history.map(entry => (
                        <li key={entry.id}>
                            {new Date(entry.date).toLocaleDateString()}: <strong>{entry.weight} kg</strong>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay registros de peso corporal</p>
            )}

            <h3>Récords Personales (PRs)</h3>
            {Object.keys(prsByExercise).length > 0 ? (
                Object.entries(prsByExercise).map(([exerciseName, records]) => (
                    <div key={exerciseName}>
                        <h4>{exerciseName}</h4>
                        <ul>
                            {records.sort((a, b) => a.reps - b.reps).map(pr => (
                                <li key={pr.id}>
                                    <strong>{pr.weight} kg</strong> x {pr.reps} reps 
                                    <em> (el {new Date(pr.date).toLocaleDateString()})</em>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>¡Completa algunas series para empezar a registrar tus récords!</p>
            )}
        </div>
    );
}

export default DataPage;