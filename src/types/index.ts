// src/types/index.ts 

// Opciones en lugar de usar strings directamente
export type SetType = 'Warm-up' | 'Normal' | 'Drop Set' | 'Failure'; 

export const setTypes: SetType[] = ['Warm-up', 'Normal', 'Drop Set', 'Failure'];

// Interface para describir la forma de un objeto 
// Es como un plano paa los objetos de "series"
export interface WorkoutSet {
    id: string; // ID único, como un UUID
    type: SetType;
    reps: number; //Repeticiones objetivo 
    weight: number; // Peso objetivo 
    completed: boolean; // Para saber si ya se hizo esta serie 
}

export interface Exercise {
    id: string;
    name: string;
    sets: WorkoutSet[];
    restTime: number; // Tiempo de descanso en segundos 
}

export interface WorkoutDay {
    id: string;
    name: string;
    exercises: Exercise[];
}

export interface Routine {
    id: string; 
    name: string;
    days: WorkoutDay[];
    isActive: boolean; 
}

