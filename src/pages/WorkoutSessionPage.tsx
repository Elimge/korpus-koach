// src/pages/WorkoutSessionPage.tsx

import { useParams } from 'react-router-dom';

function WorkoutSessionPage() {
    const { sessionId } = useParams();
    
    return (
        <div>
            <h1>Modo Gimnasio</h1>
            <p>Sesión ID: {sessionId}</p>
        </div>
    );
}

export default WorkoutSessionPage;