// src/components/RestTimer.tsx

interface RestTimerProps {
    remainingTime : number;
    exerciseName: string; // Para saber que ejercicio estamos descansando 
}

// Pequeña función de ayuda para formatear el tiempo 
const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

function RestTimer({ remainingTime, exerciseName }: RestTimerProps) {
    return (
        <div className='rest-timer-overlay'>
            <h3>Descansando de: {exerciseName}</h3>
            <div className='timer-display'>{formatTime(remainingTime)}</div>
        </div>
    );
}

export default RestTimer;