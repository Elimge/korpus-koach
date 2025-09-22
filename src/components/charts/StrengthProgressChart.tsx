// src/components/charts/StrengthProgressChart.tsx

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { BodyWeightEntry, PersonalRecord } from '../../types';

interface StrengthProgressChartProps {
    prHistory: PersonalRecord[];
    bodyWeightHistory: BodyWeightEntry[];
}

// Tipo para los datos combinados 
type ChartDataPoint = {
    date: string;
    bodyWeight?: number;
    prWeight?: number;
};

function StrengthProgressChart({ prHistory, bodyWeightHistory }: StrengthProgressChartProps) {
    // --- Lógica de combinación de datos ---
    // Alinear los datos por fecha 
    const combinedData: ChartDataPoint[] = []; 
    const dataMap = new Map<string, ChartDataPoint>(); 

    // Añadiendo todos los puntos de peso corporal al mapa 
    bodyWeightHistory.forEach(entry => {
        const dateKey = new Date(entry.date).toLocaleDateString('es-ES');
        if (!dataMap.has(dateKey)) {
            dataMap.set(dateKey, { date: dateKey });
        }
        dataMap.get(dateKey)!.bodyWeight = entry.weight;
    });

    // Se añaden todos los puntos de PR al mapa 
    prHistory.forEach(pr => {
        const dateKey = new Date(pr.date).toLocaleDateString('es-ES');
        if (!dataMap.has(dateKey)) {
            dataMap.set(dateKey, { date: dateKey });
        }
        // Se asigna directamente el peso, ya que los datos vienen pre-filtrados
        dataMap.get(dateKey)!.prWeight = pr.weight;
    });

    // Se conviete el mapa a un array y se ordena por fecha 
    const sortedData = Array.from(dataMap.values()).sort((a, b) =>
        new Date(a.date.split('/').reverse().join('-')).getTime() -
        new Date(b.date.split('/').reverse().join('-')).getTime()
    );

    return (
        <ResponsiveContainer width='100%' height={400}>
            <LineChart data={sortedData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis yAxisId='left' stroke='#8884d8' />
                <YAxis yAxisId='right' orientation='right' stroke='#82ca9d' />
                <Tooltip /> 
                <Legend /> 
                <Line yAxisId='left' type='monotone' dataKey='prWeight' name={`PR(${prHistory[0]?.reps || ''} reps)`} stroke='#8884d8' />
                <Line yAxisId='right' type='monotone' dataKey='bodyWeight' name='Peso Corporal' stroke='#82ca9d' />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default StrengthProgressChart;