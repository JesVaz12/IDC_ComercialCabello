import { Link } from 'react-router-dom';
import lista from '../assets/inventario/faltantes.svg'
import './AltaProductos.css'

function ListaDeFaltantes() {
  return (
    <>
    <Link to="/faltantes">
      <div style={{display:'flex', color:'black'}} >
        <img src={lista} id='altaProductos'></img>
        <p id='label'>Lista de Faltantes</p>
      </div>
    </Link>

    </>
  )
}

export default ListaDeFaltantes;