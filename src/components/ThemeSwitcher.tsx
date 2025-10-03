// src/components/ThemeSwitcher.tsx

import { useTheme } from '../context/ThemeContext';

function ThemeSwitcher() {
    const { theme, setTheme, accent, setAccent } = useTheme();

    return (
        <div className="theme-switcher">
            <div className="theme-select">
                <label htmlFor="theme-select">Tema: </label>
                <select id="theme-select" value={theme} onChange={(e) => setTheme(e.target.value as any)}>
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                </select>
            </div>
            <div className="accent-select">
                <label htmlFor="accent-select">Acento: </label>
                <select id="accent-select" value={accent} onChange={(e) => setAccent(e.target.value as any)}>
                    <option value="default">Por Defecto</option>
                    <option value="goku">Goku</option>
                </select>
            </div>
        </div>
    );
}

export default ThemeSwitcher;
