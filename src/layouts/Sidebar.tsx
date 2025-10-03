// src/layouts/Sidebar.tsx 

import { NavLink } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher';

function Sidebar() {
    // Ej de dato de usuario
    const userName = 'Jeffrey';

    return (
        <aside className='sidebar'>
            <div className='sidebar-header'>
                <h2>Korpus Koach</h2>
            </div>
            <div className='user-profile'>
                <div className='avatar'>{userName.charAt(0)}</div>
                <h3>Hola, {userName}</h3>
            </div>
            <nav className='sidebar-nav'>
                <NavLink to='/'>Calendario</NavLink>
                <NavLink to="/routines">Mis Rutinas</NavLink> 
                <NavLink to='/progress'>Mi Progreso</NavLink>
                <NavLink to='/history'>Historial</NavLink>
            </nav>
            <div className='sidebar-footer'>
                <ThemeSwitcher />
            </div>
        </aside>
    )
}

export default Sidebar;