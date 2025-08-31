import { useState } from 'react'
import delIcon from '../assets/inventario/-.svg'
import './AltaProductos.css'
import CobrarModal from './CobrarModal';

function Cobrar() {
const [openModal, setOpenModal] = useState(false);
  return (
    <>
    <div style={{display:'flex', color:'black'}}>
        <img src={delIcon} id='cobrar' onClick={()=>{
        setOpenModal(true);
        }}></img>
     {openModal && <CobrarModal closeModal={setOpenModal}/>}
    </div>
    </>
  )
}

export default Cobrar