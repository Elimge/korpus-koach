// src/components/AddBodyWeightForm.tsx

import { useState } from 'react';
import { db } from '../services/db';

interface AddBodyWeightFormProps {
    onWeightAdded: () => void;
}

function AddBodyWeightForm({ onWeightAdded }: AddBodyWeightFormProps) {
    const [weight, setWeight] = useState<number | ''>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (weight === '' || weight <= 0) {
            alert('Por favor, introduce un peso válido');
            return;
        }
        await db.addBodyWeight(weight);
        onWeightAdded();
        setWeight('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <h4>Registrar Peso Corporal Actual</h4>
            <input 
                type='number'
                step='0.1'
                placeholder='Ej: 75.5'
                value={weight}
                onChange={e => setWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
            />
            <span>kg</span>
            <button type='submit'>Guardar</button>
        </form>
    );
}

export default AddBodyWeightForm;