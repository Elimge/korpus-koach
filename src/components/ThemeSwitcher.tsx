// src/components/ThemeSwitcher.tsx

import { useTheme } from '../context/ThemeContext';

function ThemeSwitcher() {
    const {theme, setTheme } = useTheme();

    return (
        <div className='theme-switcher'>
            <span>Tema: </span>
            <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
                <option value='light'>Claro</option>
                <option value='dark'>Oscuro</option>
                <option value='goku'>Goku</option>
            </select>
        </div>
    );
}

export default ThemeSwitcher;
