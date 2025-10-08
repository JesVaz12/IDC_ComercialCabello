import './Modal.css'
import PropTypes from 'prop-types';
import axios from 'axios'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';

// eslint-disable-next-line no-unused-vars
function ConfirmacionModal({ closeModal, codigo}) {
    const [value, setValue] = useState({
        cantidad: ''});

    const handleDelete = async (codigo) => {
            try {
                axios.delete(`http://localhost:8080/deleteProducto/${codigo}`).then(res => {
                    if (res.status === 200) {
                        localStorage.setItem('showToast', 'Producto eliminado con éxito');
                        window.location.reload();
                    } else {
                        console.error('Error eliminado el producto:', res.data);
                    }
              } );
            }catch (error) {
                console.error('Error deleting data:', error);
              }  
    }

    useEffect(() => {
        if (codigo) {
            axios.get(`http://localhost:8080/getProducto/${codigo}`)
                .then(res => {  
                    if (res.data.Status === 'Exito') {
                        setValue({
                            cantidad: res.data.Producto.cantidad,
                        });
                    } else {
                        toast.error(res.data.Error);
                    }
                })
                .catch((error) => {
                    toast.error('Error obteniendo los datos del producto, recargue la página');
                    console.error(error);
                });
        }
    }, [codigo]);

    return (
        <>
            <div><Toaster /></div>
            <div className="modalBackground">
                <div className="modalContainer" style={{maxHeight: '16%', marginTop: '14%', backgroundColor: '#CD1C18', backgroundImage: 'unset', color: 'white'}}>
                    <div className="header" style={{backgroundColor: 'white', color: '#9B1313', minHeight: '25%'}}>
                        Advertencia
                    </div>
                    <div className="forms" style={{alignItems: 'center', justifyContent: 'center'}}>
                        <p style={{color: 'white', fontSize: '190%'}}>Aún quedan {value.cantidad} productos, ¿eliminar?</p>
                        <div style={{display: 'flex', justifyContent: 'space-around', marginTop: '5%'}}>
                            <button className='button_delete' onClick={()=>handleDelete(codigo)}>Aceptar</button>
                            <button className='button_delete' onClick={() => window.location.reload()}>Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ConfirmacionModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    codigo: PropTypes.string.isRequired,
};

export default ConfirmacionModal;
