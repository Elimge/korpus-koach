// src/pages/DataPage.tsx
import { useEffect, useState } from 'react';
import { db } from '../services/db';
import type { BodyWeightEntry } from '../types';
import AddBodyWeightForm from '../components/AddBodyWeightForm';

function DataPage() {
    const [history, setHistory] = useState<BodyWeightEntry[]>([]);

    const fetchData = async () => {
        const data = await db.getBodyWeightHistory();
        setHistory(data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <h2>Mi Progreso</h2>

            <AddBodyWeightForm onWeightAdded={fetchData} />

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
        </div>
    );
}

export default DataPage;