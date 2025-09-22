// src/pages/DataPage.tsx
import { useEffect, useState } from 'react';
import { db } from '../services/db';
import type { BodyWeightEntry, PersonalRecord } from '../types';
import AddBodyWeightForm from '../components/AddBodyWeightForm';
import BodyWeightChart  from '../components/charts/BodyWeightChart';
import StrengthProgressChart from '../components/charts/StrengthProgressChart';

function DataPage() {
    const [history, setHistory] = useState<BodyWeightEntry[]>([]);
    const [prs, setPrs] = useState<PersonalRecord[]>([]);
    const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
    const [selectedPrHistory, setSelectedPrHistory] = useState<PersonalRecord[]>([]);
    const [selectedRepRange, setSelectedRepRange] = useState<number | null>(null);

    const fetchData = async () => {
        const weightData = await db.getBodyWeightHistory();
        const prData = await db.getAllPRs();
        setHistory(weightData);
        setPrs(prData);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Efecto que se ejecuta cuando el usuario selecciona una ejercicio 
    useEffect(() => {
        if (selectedExerciseId) {
            db.getPRsForExercise(selectedExerciseId).then(setSelectedPrHistory);
        }
    }, [selectedExerciseId]);

    // Se obtiene una lista de ejercicios únicos que tienen PRs 
    const exerciseWithPRs = [...new Map(prs.map(pr => [pr.exerciseId, pr])).values()];

    const availableRepRanges = selectedPrHistory
        .map(pr => pr.reps) // Solo las reps 
        .filter((value, index, self) => self.indexOf(value) === index) // Filtra para tener valores únicos
        .sort((a, b) => a - b); // Ordena numéricamente

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
            <hr /> 

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
            <hr /> 

            <h3>Progreso de Fuerza vs. Peso Corporal</h3>
            {exerciseWithPRs.length > 0 ? (
                <div>
                    <select onChange={(e) => {
                        setSelectedExerciseId(e.target.value);
                        setSelectedRepRange(null); 
                        }} 
                        value={selectedExerciseId || ''}
                    >
                        <option value=''>Selecciona un ejercicio...</option>
                        {exerciseWithPRs.map(pr => (
                            <option key={pr.exerciseId} value={pr.exerciseId}>
                                {pr.exerciseName}
                            </option>
                        ))}
                    </select>

                    <select 
                        onChange={(e) => setSelectedRepRange(Number(e.target.value))}
                        value={selectedRepRange || ''}
                    >
                        <option value=''>Selecciona repeticiones...</option>
                        {availableRepRanges.map(reps => (
                            <option key={reps} value={reps}>
                                {reps} repeticiones
                            </option>
                        ))}
                    </select>

                    {selectedExerciseId && selectedRepRange && (
                        <StrengthProgressChart 
                            prHistory={selectedPrHistory.filter(pr => pr.reps === selectedRepRange)}
                            bodyWeightHistory={history} 
                        />
                    )}
                </div>
            ) : (
                <p>Registra algunos PRs para ver tu progreso.</p>
            )}
        </div>
    );
}

export default DataPage;