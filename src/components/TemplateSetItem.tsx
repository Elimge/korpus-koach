// src/components/TemplateSetItem.tsx

import { useState, useEffect } from 'react';
import type { WorkoutSet, SetType } from '../types';
import { setTypes } from '../types';

interface TemplateSetItemProps {
    set: WorkoutSet;
    onUpdate: (setId: string, updates: Partial<WorkoutSet>) => Promise<void>;
    onDelete: (setId: string) => void;
}

function TemplateSetItem({ set, onUpdate, onDelete }: TemplateSetItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedSet, setEditedSet] = useState(set);

    useEffect(() => {
        setEditedSet(set);
    }, [set]);

    // useEffect(() => {
    //     // Sincroniza el estado interno con las props externas.
    //     setEditedSet(set);
    // }, [set]); // El array de dependencias le dice a React que vigile 'set'.

    // Hacemos la función async
    const handleSave = async () => {
        // Esperamos a que la actualización y el re-fetch se completen
        await onUpdate(set.id, {
            type: editedSet.type,
            weight: editedSet.weight,
            reps: editedSet.reps,
        });
        // SOLO DESPUÉS de que todo termine, salimos del modo edición
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedSet(set);
    };

    if (isEditing) {
        // Modo edición 
        return (
            <li>
                <select 
                    value={editedSet.type}
                    onChange={e => setEditedSet({...editedSet, type: e.target.value as SetType})}
                >
                    {setTypes.map(t => <option key={t} value={t}>{t}</option>)}    
                </select>
                <input 
                    type='number'
                    value={editedSet.weight}
                    onChange={e => setEditedSet({...editedSet, weight: Number(e.target.value)})}
                /> kg x
                <input 
                    type='number'
                    value={editedSet.reps}
                    onChange={e => setEditedSet({...editedSet, reps: Number(e.target.value)})}
                /> reps
                <button onClick={handleSave}>Guardar</button>
                <button onClick={handleCancel}>Cancelar</button>
            </li>
        );
    }

    return (
        <li>
            <span>{set.type}: {set.weight} kg x {set.reps} reps</span>
            <div>
                <button onClick={() => setIsEditing(true)}>Editar</button>
                <button onClick={() => onDelete(set.id)}>Eliminar</button>
            </div>
        </li>
    )
}

export default TemplateSetItem;