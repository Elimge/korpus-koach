// src/layouts/AppLayout.tsx 

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import StatsPanel from './StatsPanel';
import './AppLayout.css';

function AppLayout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
            <StatsPanel /> 
        </div>
    ); 
}

export default AppLayout;
