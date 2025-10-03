// src/layouts/StatsPanel.tsx

import WeeklyRoutineWidget from '../components/widgets/WeeklyRoutineWidget';

function StatsPanel() {
    return (
        <aside className="stats-panel">
            <WeeklyRoutineWidget />
            {/* Aquí podremos añadir más widgets como <LatestPRWidget /> en el futuro */}
        </aside>
    );
}

export default StatsPanel;