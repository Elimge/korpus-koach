// src/context/ThemeContext.tsx 

import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Accent = 'default' | 'goku';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    accent: Accent;
    setAccent: (accent: Accent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');
    const [accent, setAccent] = useState<Accent>('default');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.setAttribute('data-accent', accent);
    }, [accent]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Custom Hook para usar el contexto fácilmente 
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
    }
    return context;
}