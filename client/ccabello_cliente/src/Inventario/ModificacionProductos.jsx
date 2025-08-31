import { useState } from 'react'
import modIcon from '../assets/inventario/modIcon.svg'
import './AltaProductos.css'
import ModificacionProductosModal from './ModificacionProductosModal';

function ModificacionProductos() {
const [openModal, setOpenModal] = useState(false);
  return (
    <>
    <div style={{display:'flex', color:'black'}}>
        <img src={modIcon} id='altaProductos' onClick={()=>{
        setOpenModal(true);
        }}></img>
    <p id='label'>Alta de Productos</p>
     {openModal && <ModificacionProductosModal closeModal={setOpenModal}/>}
    </div>
    </>
  )
}

export default ModificacionProductos