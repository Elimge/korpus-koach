// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.tsx';
import HomePage from './pages/HomePage.tsx';
import RoutineDetailPage from './pages/RoutineDetailPage.tsx';
import WorkoutDayPage from './pages/WorkoutDayPage.tsx';
import './index.css';
import './layouts/AppLayout.css';
import './components/components.css';
import './components/widgets/Widgets.css';
import WorkoutSessionPage from './pages/WorkoutSessionPage.tsx';
import DataPage from './pages/DataPage.tsx';
import WorkoutSummaryPage from './pages/WorkoutSummaryPage.tsx';
import HistoryPage from './pages/HistoryPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';

// Crear el enrutador
const router = createBrowserRouter([
  {
    path: "/", // La ruta raíz 
    element: <App />, // El comoponente que renderizará en esta ruta 
    // Aquí estarán las rutas hijas (nested routes)
    children: [
      {
        index: true, // Esto la hace ruta por defecto del padre
        element: <DashboardPage /> 
      },
      {
        path: "routines", 
        element: <HomePage />
      },
      {
        path: "routine/:routineId", 
        element: <RoutineDetailPage />
      },
      {
        path: "routine/:routineId/day/:dayId",
        element: <WorkoutDayPage />
      },
      {
        path: "session/:sessionId",
        element: <WorkoutSessionPage />
      },
      {
        path: "progress",
        element: <DataPage />
      },
      {
        path: "session/:sessionId/summary",
        element: <WorkoutSummaryPage />
      },
      {
        path: "/history",
        element: <HistoryPage /> 
      }
      // otra pagina por ejemplo
      // { path: "settings", element: <SettingsPage /> }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode> 
    {/* En lugar de renderizar <App /> directamente, le pasamos nuestro enrutador */}
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)