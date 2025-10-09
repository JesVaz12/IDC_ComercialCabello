import './Modal.css'
import PropTypes from 'prop-types';
import axios from 'axios'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';


function EliminarModal({ closeModal, usuario}) {
    const [values, setValues] = useState({
        usuario: '',
        nombre: '',
        apellido_materno: '',
        apellido_paterno: '',
        rol: ''
    });

    const handleDelete = async (usuario) => {
        try {
            axios.delete(`http://localhost:8080/deleteUsuario/${usuario}`).then(res => {
                if (res.status == 200) {
                    window.location.replace('/usuarios');
                } else {
                    console.error('Error eliminando el usuario:', res.data);
                }
          } );
        }catch (error) {
            console.error('Error deleting data:', error);
          }
    }

    useEffect(() => {
        if (usuario) {
            axios.get(`http://localhost:8080/GetUserData/${usuario}`)
                .then(res => {  
                    if (res.status === 200) {
                        console.log(res.data.Nombre)
                        setValues({
                            usuario: res.data.usuario,
                            nombre: res.data.Nombre,
                            apellido_materno: res.data.apellido_materno,
                            apellido_paterno: res.data.apellido_paterno,
                            rol: res.data.rol
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
    }, [usuario]);

    return (
        <>
            <div><Toaster /></div>
            <div className="modalBackground">
                <div className="modalContainer" style={{backgroundImage: 'unset', maxHeight: '33%', marginTop: '6%'}}>
                    <div className="header">
                        ¿Estás seguro de que deseas eliminar este  usuario?
                    </div>
                    <div className="forms" style={{alignItems: 'center', justifyContent: 'center'}}>
                        <ul style={{color: 'black', fontSize: '170%'}}>
                            <li>Usuario: {values.usuario}</li>
                            <li>Nombre: {values.nombre}</li>
                            <li>Rol: {values.rol}</li>
                        </ul>
                        <p style={{color: 'black', fontSize: '200%', fontWeight: '800'}}>Esta acción no puede deshacerse</p>
                        <div style={{display: 'flex', justifyContent: 'space-around', marginTop: '5%'}}>
                            <button className='button_delete' onClick={()=>handleDelete(values.usuario)}>Si</button>
                            <button className='button_delete' onClick={() => closeModal(false)}>No</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

EliminarModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    usuario: PropTypes.string.isRequired,
};

export default EliminarModal;
