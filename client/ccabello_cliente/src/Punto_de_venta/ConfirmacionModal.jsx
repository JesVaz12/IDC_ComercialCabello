import './Modal.css'
import PropTypes from 'prop-types';
import axios from 'axios'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';

// eslint-disable-next-line no-unused-vars
function ConfirmacionModal({ closeModal}) {
    const [value, setValue] = useState({
        cantidad: ''});

    return (
        <>
            <div><Toaster /></div>
            <div className="modalBackground">
                <div className="modalContainer" style={{maxHeight: '16%', marginTop: '14%', backgroundColor: '#CD1C18', backgroundImage: 'unset', color: 'white'}}>
                    <div className="header" style={{backgroundColor: 'white', color: '#9B1313', minHeight: '25%'}}>
                        Advertencia
                    </div>
                    <div className="forms" style={{alignItems: 'center', justifyContent: 'center'}}>
                        <p style={{marginLeft: '3%', fontSize: '160%'}}>¿Está seguro que desea cancelar la venta?</p>
                        <div style={{display: 'flex', justifyContent: 'space-around', marginTop: '5%'}}>
                            <button className='button_delete' onClick={() => window.location.reload()}>Sí</button>
                            <button className='button_delete' onClick={closeModal}>No</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ConfirmacionModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
};

export default ConfirmacionModal;
