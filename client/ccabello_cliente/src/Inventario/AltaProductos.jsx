import { useState } from 'react'
import AltaProductosModal from './AltaProductosModal';
import alta from '../assets/inventario/altaproductos.svg'
import './AltaProductos.css'

function AltaProductos() {
const [openModal, setOpenModal] = useState(false);
  return (
    <>
    <div style={{display:'flex', color:'black'}}>
        <img src={alta} id='altaProductos' onClick={()=>{
        setOpenModal(true);
        }}></img>
    <p id='label'>Alta de Productos</p>
     {openModal && <AltaProductosModal closeModal={setOpenModal}/>}
    </div>
    </>
  )
}

export default AltaProductos