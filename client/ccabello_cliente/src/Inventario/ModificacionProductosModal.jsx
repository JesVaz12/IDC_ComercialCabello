import './Modal.css'
import PropTypes from 'prop-types';
import axios from 'axios'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';

function ModificacionProductosModal({ closeModal, codigo }) {
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



    const [values, setValues] = useState({
        codigo: '',
        nombre: '',
        precio: '',
        cantidad: '',
        cantidad_minima: '',
    });


    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(values);
        axios.post('http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com/modificarProducto', values)
            .then(res => {
                if (res.data.Status === 'Exito') {
                    localStorage.setItem('showToast', 'Producto modificado con éxito');
                    window.location.reload();
                } else {
                    toast.error(res.data.Error);
                }
            })
            .catch(err => console.log(err));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        // Apply different length restrictions for each field
        switch (name) {
            case 'codigo':
                newValue = value.slice(0, 13); // Limit to 1 digit for 'codigo'
                break;
            case 'cantidad_minima':
                newValue = value.slice(0, 5); // Limit to 3 digits for 'cantidad_minima'
                break;
            case 'cantidad':
                newValue = value.slice(0, 5); // Limit to 2 digits for 'cantidad'
                break;
            case 'precio':
                newValue = value.slice(0, 10); // Limit to 5 digits for 'precio'
                break;
            default:
                break;
        }

        setValues({ ...values, [name]: newValue });
    };

    const handleKeyDown = (e) => {
        const { name } = e.target;
        const maxLength = {
            codigo: 13,
            cantidad_minima: 5,
            cantidad: 5,
            precio: 10,
        };
        const actualLength = values[name].replace(/\./g, '').length;

        if (['codigo', 'cantidad_minima', 'cantidad', 'precio'].includes(name)) {
            if (e.key === '-') {
                e.preventDefault();
            }
            const inputElement = document.getElementById(name);
            if (!isTextSelected(document.getElementById(inputElement))) {
                if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && actualLength >= maxLength[name]) {
                    e.preventDefault();
                }
            }
        }
    };

    function isTextSelected(input) {
        if (typeof input.selectionStart == "number") {
            return input.selectionStart == 0 && input.selectionEnd == input.value.length;
        } else if (typeof document.selection != "undefined") {
            input.focus();
            return document.selection.createRange().text == input.value;
        }
    }

    return (
        <>
            <div><Toaster /></div>
            <div className="modalBackground">
                <div className="modalContainer">
                    <div className="header">
                        Modificación de Productos
                    </div>
                    <div className="forms">
                        <form onSubmit={handleSubmit}>
                            <div className='inputLabel'>
                                <label className="labelModal" htmlFor='nombre'>Nombre</label>
                                <input className="inputAlta"
                                    required
                                    id="nombre"
                                    name='nombre'
                                    maxLength='35'
                                    value={values.nombre}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className='inputLabel'>
                                <label className="labelModal" htmlFor='codigo'>Código</label>
                                <p style={{ color: 'black', marginLeft: '5vw' }}>{values.codigo}</p>
                            </div>
                            <div className='inputLabel'>
                                <label className="labelModal" htmlFor='precio'>Precio</label>
                                <input className="inputAlta"
                                    required
                                    type='number'
                                    id="precio"
                                    min='0'
                                    step='0.01'
                                    name='precio'
                                    value={values.precio}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            <div className='inputLabel'>
                                <label className="labelModal" htmlFor='cantidad_minima'>Cantidad Min.</label>
                                <input className="inputAlta"
                                    required
                                    type='number'
                                    id="cantidad_minima"
                                    min='0'
                                    step="any"
                                    name='cantidad_minima'
                                    value={values.cantidad_minima}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            <div className='inputLabel'>
                                <label className="labelModal" htmlFor='cantidad'>Cantidad Actual</label>
                                <input className="inputAlta"
                                    required
                                    type='number'
                                    id="cantidad"
                                    name='cantidad'
                                    min='0'
                                    step="any"
                                    value={values.cantidad}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                            <div id='buttons'>
                                <button id='acceptButton' type='submit'>Aceptar</button>
                                <button id='cancelButton' onClick={() => closeModal(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

ModificacionProductosModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    codigo: PropTypes.string.isRequired,
};

export default ModificacionProductosModal;
