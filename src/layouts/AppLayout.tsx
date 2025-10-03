// src/layouts/AppLayout.tsx 

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './AppLayout.css';

function AppLayout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
            {/* La columna de estadísticas la añadiremos más tarde para simplificar */}
        </div>
    ); 
}

export default AppLayout;
