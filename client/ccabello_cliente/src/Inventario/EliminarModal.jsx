import './Modal.css'
import PropTypes from 'prop-types';
import axios from 'axios'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import ConfirmacionModal from './ConfirmacionModal';


function EliminarModal({ closeModal, codigo }) {
    const [openModal, setOpenModal] = useState(false);
    const [values, setValues] = useState({
        codigo: '',
        nombre: '',
        precio: '',
        cantidad: '',
        cantidad_minima: '',
    });

    const handleDelete = async (codigo) => {
        if (values.cantidad <= 0) {
            try {
                axios.delete(`http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com/deleteProducto/${codigo}`).then(res => {
                    if (res.status == 200) {
                        localStorage.setItem('showToast', 'Producto eliminado con éxito');
                        window.location.replace('/inventario');
                    } else {
                        console.error('Error eliminado el producto:', res.data);
                    }
                });
            } catch (error) {
                console.error('Error deleting data:', error);
            }
        } else {
            setOpenModal(true);
        }
    }

    useEffect(() => {
        if (codigo) {
            axios.get(`http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com/getProducto/${codigo}`)
                .then(res => {
                    if (res.data.Status === 'Exito') {
                        setValues({
                            codigo: res.data.Producto.codigo,
                            nombre: res.data.Producto.nombre,
                            precio: res.data.Producto.precio,
                            cantidad: res.data.Producto.cantidad,
                            cantidad_minima: res.data.Producto.cantidad_minima,
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
                <div className="modalContainer" style={{ backgroundImage: 'unset' }}>
                    <div className="header">
                        ¿Estás seguro de que deseas eliminar este producto?
                    </div>
                    <div className="forms" style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <ul style={{ color: 'black', fontSize: '170%' }}>
                            <li>Producto: {values.nombre}</li>
                            <li>Cantidad: {values.cantidad}</li>
                            <li>Código: {values.codigo}</li>
                            <li>Precio: {values.precio}</li>
                            <li>Cantidad mínima: {values.cantidad_minima}</li>
                        </ul>
                        <p style={{ color: 'black', fontSize: '200%', fontWeight: '800' }}>Esta acción no puede deshacerse</p>
                        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '5%' }}>
                            <button className='button_delete' onClick={() => handleDelete(values.codigo)}>Aceptar</button>
                            <button className='button_delete' onClick={() => closeModal(false)}>Cancelar</button>
                        </div>
                        {openModal && <ConfirmacionModal closeModal={setOpenModal} codigo={values.codigo} />}
                    </div>
                </div>
            </div>
        </>
    );
}

EliminarModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    codigo: PropTypes.string.isRequired,
};

export default EliminarModal;
