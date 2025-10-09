import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login/Login.jsx';
import RegisterUser from './RegisterUser.jsx';
import Inventario from './Inventario/Inventario.jsx';
import Pventa from './Punto_de_venta/pventa.jsx'; // <--- RUTA CORREGIDA
import Faltantes from './Inventario/Faltantes.jsx';
import Usuarios from './Usuarios/admin_usuarios.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/RegisterUser' element={<RegisterUser />} />
        <Route path='/inventario' element={<Inventario />} />
        <Route path='/punto_de_venta' element={<Pventa />} />
        <Route path='/faltantes' element={<Faltantes />} />
        <Route path='/usuarios' element={<Usuarios />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;