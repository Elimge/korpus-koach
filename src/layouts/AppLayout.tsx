// src/layouts/AppLayout.tsx 

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import StatsPanel from './StatsPanel';
import { Toaster } from 'react-hot-toast';
import './AppLayout.css';

function AppLayout() {
    return (
        <div className="app-layout">
            <Toaster position="bottom-center" />
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
            <StatsPanel /> 
        </div>
    ); 
}

export default AppLayout;
