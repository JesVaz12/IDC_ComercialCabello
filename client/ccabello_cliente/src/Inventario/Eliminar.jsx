import { useState } from 'react'
import delIcon from '../assets/inventario/-.svg'
import './AltaProductos.css'
import EliminarModal from './EliminarModal';

function Eliminar() {
const [openModal, setOpenModal] = useState(false);
  return (
    <>
    <div style={{display:'flex', color:'black'}}>
        <img src={delIcon} id='altaProductos' onClick={()=>{
        setOpenModal(true);
        }}></img>
     {openModal && <EliminarModal closeModal={setOpenModal}/>}
    </div>
    </>
  )
}

export default Eliminar