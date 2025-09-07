// src/components/charts/BodyWeightChart.tsx

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { BodyWeightEntry } from '../../types';

interface BodyWeightChartProps {
    data: BodyWeightEntry[];
}

function BodyWeightChart({ data }: BodyWeightChartProps) {
    // Transformación de datos a formato de Recharts
    const chartData = data.map(entry => ({
        // Formateo de fecha para que sea legible en el eje X 
        date: new Date(entry.date).toLocaleDateString('es-ES', {month: 'short', day: 'numeric'}),
        peso: entry.weight, // Eje Y 
    }));

    return (
        <ResponsiveContainer width='100%' height={300}>
            <LineChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type='monotone' dataKey='peso' stroke='#8884d8' activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default BodyWeightChart;