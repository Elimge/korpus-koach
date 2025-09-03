// src/hooks/useTimer.ts

import { useState, useEffect, useRef } from 'react';

export function useTimer() {
    const [duration, setDuration] = useState(0);
    const [isActive, setIsActive] = useState(false);

    // useRef para guardar el ID del intervalo
    // que un nuevo render no reinicia la referencia al intervalo 
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        // El efecto se activa solo cuando el temporizador está inactivo.
        if (isActive) {
            // Guardamos la hora de finalización 
            const endTime = Date.now() + duration * 1000;

            intervalRef.current = window.setInterval(() => {
                const timeLeft = Math.round((endTime - Date.now()) / 1000);
                if (timeLeft >= 0) {
                    setDuration(timeLeft);
                } else {
                    // El tiempo ha terminado 
                    setIsActive(false);
                    // Aquí podríamos añadir un sonido o vibración en el futuro 
                    alert('¡Descanso terminado!');
                }
            }, 1000);
        }

        // --- FUNCIÓN DE LIMPIEZA --- 
        // Crucial, se ejecuta cuando el componente se desmonta o antes de que el efecto se ejecute de nuevo.
        // Previene fugas de memoria y que múltiples intervalos se ejecuten a la vez. 
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive]); // El efecto depende solo de si el temporizador está activo o ni 

    const startTimer = (seconds: number) => {
        setDuration(seconds);
        setIsActive(true);
    };

    return { remainingTime: duration, isTimerActive: isActive, startTimer };
}