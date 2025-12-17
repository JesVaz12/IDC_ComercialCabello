import './Modal.css'
import PropTypes from 'prop-types';
import axios from 'axios'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import TablaFaltantes from './TablaFaltantes.jsx';

// eslint-disable-next-line no-unused-vars
function NotificacionInventario({ closeModal, faltantes }) {
    const [value, setValue] = useState({
        cantidad: ''
    });

    const handleDelete = async (codigo) => {
        try {
            axios.delete(`http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com:8080/deleteProducto/${codigo}`).then(res => {
                if (res.status === 200) {
                    localStorage.setItem('showToast', 'Producto eliminado con éxito');
                    window.location.reload();
                } else {
                    console.error('Error eliminado el producto:', res.data);
                }
            });
        } catch (error) {
            console.error('Error deleting data:', error);
        }
    }

    useEffect(() => {
        console.log(faltantes);
    }, [faltantes]);
    /*
    useEffect(() => {
        if (true) {
            axios.get(`http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com:8080/getProducto/${codigo}`)
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
*/
    return (
        <>
            <div><Toaster /></div>
            <div className="modalBackground">
                <div className="modalContainer" style={{ maxHeight: '35%', marginTop: '7%', backgroundColor: 'white', backgroundImage: 'unset', color: 'black' }}>
                    <div className="header" style={{ backgroundColor: '#CD1C18', color: 'white', minHeight: '10%' }}>
                        <p>INVENTARIO FALTANTE</p>
                    </div>
                    <div className="forms" style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ fontSize: "200%" }}>Poco inventario de: </p>
                        <p style={{ fontSize: "200%" }}>¿Actualizar inventario? </p>
                        <div style={{ width: '95%', height: '50%', overflowY: 'auto', marginTop: '2%' }}>
                            <TablaFaltantes faltantes={faltantes} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '5%' }}>
                            <button className='button_delete' onClick={() => window.location.replace('/inventario')}>Sí</button>
                            <button className='button_delete' onClick={() => window.location.reload()}>No</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

NotificacionInventario.propTypes = {
    closeModal: PropTypes.func.isRequired,
    faltantes: PropTypes.array.isRequired
};

export default NotificacionInventario;
