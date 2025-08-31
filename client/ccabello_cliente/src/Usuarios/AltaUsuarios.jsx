import { useState } from 'react'
import AltaUsuariosModal from './AltaUsuariosModal';
import alta from '../assets/inventario/altaproductos.svg'
import './AltaUsuarios.css'

function AltaUsuarios() {
const [openModal, setOpenModal] = useState(false);
  return (
    <>
    <div style={{display:'flex', color:'black'}}>
        <img src={alta} id='altaUsuarios' onClick={()=>{
        setOpenModal(true);
        }}></img>
    <p id='label'>Alta de Usuarios</p>
     {openModal && <AltaUsuariosModal closeModal={setOpenModal}/>}
    </div>
    </>
  )
}

export default AltaUsuarios