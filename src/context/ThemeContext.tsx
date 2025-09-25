// src/context/ThemeContext.tsx 

import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'goku'; 

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined); 

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
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