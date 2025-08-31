// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.tsx';
import HomePage from './pages/HomePage.tsx';
import RoutineDetailPage from './pages/RoutineDetailPage.tsx';
import WorkoutDayPage from './pages/WorkoutDayPage.tsx';
import './index.css';

// Crear el enrutador
const router = createBrowserRouter([
  {
    path: "/", // La ruta raíz 
    element: <App />, // El comoponente que renderizará en esta ruta 
    // Aquí estarán las rutas hijas (nested routes)
    children: [
      {
        index: true, // Esto la hace ruta por defecto del padre
        element: <HomePage /> 
      },
      {
        path: "routine/:routineId", 
        element: <RoutineDetailPage />
      },
      {
        path: "routine/:routineId/day/:dayId",
        element: <WorkoutDayPage />
      }
      // otra pagina por ejemplo
      // { path: "settings", element: <SettingsPage /> }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode> 
    {/* En lugar de renderizar <App /> directamente, le pasamos nuestro enrutador */}
    <RouterProvider router={router} />
  </React.StrictMode>,
)