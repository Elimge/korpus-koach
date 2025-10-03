// src/App.tsx

import { ThemeProvider } from "./context/ThemeContext";
import AppLayout from "./layouts/AppLayout";

function App() {
  return (
    <ThemeProvider>
      <AppLayout />
    </ThemeProvider>
  );
}

export default App;

// import { Outlet, NavLink } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import ThemeSwitcher from './components/ThemeSwitcher';

// function App() {
//   return (
//     <div>
//       {/* Aquí podríamos poner elementos que se repiten en todas las páginas,
//           como una barra de navegación o un encabezado */}
//         <Toaster position='bottom-center' /> 
        
//         <header>
//           <h1>Korpus Koach</h1>
//           <ThemeSwitcher /> 
//           {/* Aquí iría un componente de Navegación en el futuro */}
//         </header>

//         <nav>
//             <NavLink to="/">Mis Rutinas</NavLink>
//             <NavLink to="/progress">Mi Progreso</NavLink>
//             <NavLink to="/history">Historial</NavLink>
//         </nav>

//         <main>
//           {/* Outlet es el marcador de posición. React Router reemplazará
//             este componente por el que corresponda a la ruta actual.
//             Si estamos en '/', renderizará <HomePage />. */}
//           <Outlet />
//         </main>

//         {/* <footer>
//           <p>Pie de pagina de la app.</p>
//         </footer> */}
//     </div>
//   )
// }

// export default App
