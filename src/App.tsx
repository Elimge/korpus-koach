// src/App.tsx

import { Outlet, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div>
      {/* Aquí podríamos poner elementos que se repiten en todas las páginas,
          como una barra de navegación o un encabezado */}
        <Toaster position='bottom-center' /> 
        
        <header>
          <h1>Korpus Koach</h1>
          {/* Aquí iría un componente de Navegación en el futuro */}
        </header>

        <nav>
            <NavLink to="/">Mis Rutinas</NavLink>
            <NavLink to="/progress">Mi Progreso</NavLink>
        </nav>

        <main>
          {/* Outlet es el marcador de posición. React Router reemplazará
            este componente por el que corresponda a la ruta actual.
            Si estamos en '/', renderizará <HomePage />. */}
          <Outlet />
        </main>

        {/* <footer>
          <p>Pie de pagina de la app.</p>
        </footer> */}
    </div>
  )
}

export default App
