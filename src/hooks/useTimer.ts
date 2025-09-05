// src/hooks/useTimer.ts

import { useState, useEffect, useRef } from 'react';

const TIMER_END_TIME_KEY = 'korpusKoach_timerEndTime';

export function useTimer() {
    const [endTime, setEndTime] = useState<number | null>(null);
    const [remainingTime, setRemainingTime] = useState(0);
    //const [duration, setDuration] = useState(0);
    //const [isActive, setIsActive] = useState(false);

    // useRef para guardar el ID del intervalo
    // que un nuevo render no reinicia la referencia al intervalo 
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        // El efecto se activa solo cuando el temporizador está inactivo.
        if (endTime === null) return; 
        
        intervalRef.current = window.setInterval(() => {
            const timeLeft = Math.round((endTime - Date.now()) / 1000);
            if (timeLeft >= 0) {
                setRemainingTime(timeLeft);
            } else {
                setRemainingTime(0);
                setEndTime(null);
                localStorage.removeItem(TIMER_END_TIME_KEY);
                clearInterval(intervalRef.current!);
                alert('¡Descanso terminado!')
            }
        }, 500);

        return () => clearInterval(intervalRef.current!);

    }, [endTime]);

    const startTimer = (seconds:number) => {
        const newEndTime = Date.now() + seconds * 1000;
        localStorage.setItem(TIMER_END_TIME_KEY, String(newEndTime));
        setEndTime(newEndTime);
        setRemainingTime(seconds);
    };

    const initializeTimer = () => {
        const savedEndTime = localStorage.getItem(TIMER_END_TIME_KEY);
        if (savedEndTime) {
            const endTimeMs = Number(savedEndTime);
            const timeLeft = Math.round((endTimeMs - Date.now()) / 1000);
            if (timeLeft > 0) {
                setEndTime(endTimeMs);
                setRemainingTime(timeLeft);
            } else {
                localStorage.removeItem(TIMER_END_TIME_KEY);
            }
        }
    }

    const isTimerActive = endTime !== null; 

    return { remainingTime, isTimerActive, startTimer, initializeTimer };
}