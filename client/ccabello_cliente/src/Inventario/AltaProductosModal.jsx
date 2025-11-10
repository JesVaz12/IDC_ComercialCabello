// --- MODIFICACIÓN: Ruta de importación corregida ---
// La ruta correcta es subir un nivel a 'src' y luego bajar a 'Punto_de_venta'
import '../Punto_de_venta/Modal.css'
import PropTypes from 'prop-types';
import axios from 'axios'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';

function AltaProductosModal({ closeModal }) {
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
        // --- MODIFICACIÓN: Asegúrate que la URL sea la correcta para tu staging/dev ---

        axios.post('http://localhost:8080/insertarProducto', values)
            .then(res => {
                if (res.data.Status === 'Exito') {

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

            // --- MODIFICACIÓN: Se quita el 'case' para 'codigo' ---
            case 'cantidad_minima':
                newValue = value.slice(0, 5); // Limit to 5 digits for 'cantidad_minima'

                break;
            case 'cantidad':
                newValue = value.slice(0, 5); // Limit to 5 digits for 'cantidad'

                break;
            case 'precio':
                newValue = value.slice(0, 10); // Limit to 10 digits for 'precio'

                break;
            default:
                break;

        }

        setValues({ ...values, [name]: newValue });
    };


    const handleKeyDown = (e) => {
        const { name } = e.target;
        const maxLength = {

            // 'codigo': 13, // Ya no es necesario, es readOnly
            'cantidad_minima': 5,
            'cantidad': 5,

            'precio': 10,
        };

        // --- MODIFICACIÓN: Excluimos 'codigo' de esta validación ---

        if (['cantidad_minima', 'cantidad', 'precio'].includes(name)) {
            const actualLength = values[name].replace(/\./g, '').length;


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

    // --- INICIO DE CÓDIGO AÑADIDO ---
    /**

     * Llama al backend para obtener un código de producto único.
     */
    const handleGenerateCode = async () => {

        try {
            // Hacemos la llamada al nuevo endpoint que creamos en el backend
            const res = await axios.get('http://localhost:8080/api/productos/generar-codigo');


            if (res.data.codigo) {
                // Actualizamos el estado del formulario con el nuevo código

                setValues(prev => ({ ...prev, codigo: res.data.codigo }));
                toast.success('¡Código único generado!');
            }

        } catch (err) {
            console.error("Error al generar el código:", err);
            toast.error('No se pudo generar el código.');

        }
    };
    // --- FIN DE CÓDIGO AÑADIDO ---

    return (

        <>
            <div><Toaster /></div>
            <div className="modalBackground">
                <div className="modalContainer">
                    <div className="header">
                        Alta de Productos
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

                            {/* --- INICIO DE BLOQUE MODIFICADO --- */}
                            <div className='inputLabel'>
                                {/* --- CORRECCIÓN: </glabel> a </label> --- */}
                                <label className="labelModal" htmlFor='codigo'>Código</label>
                                {/* Contenedor para alinear input y botón */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input className="inputAlta"
                                        style={{ flexGrow: 1, backgroundColor: '#eee' }} // El input ocupa el espacio restante y se ve deshabilitado

                                        required
                                        type='text' // Cambiado a 'text' para aceptar el código generado
                                        id="codigo"

                                        name='codigo'
                                        value={values.codigo}
                                        placeholder="Clic en 'Generar'..."

                                        readOnly // El campo es de solo lectura
                                    // Se quitan onChange y onKeyDown
                                    />
                                    <button
                                        type="button" // Importante: 'type="button"' para que no envíe el formulario
                                        onClick={handleGenerateCode}

                                        className="generarButton" // Puedes estilizar esta clase en Modal.css
                                        style={{
                                            padding: '8px 12px',

                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',

                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap' // Evita que el texto se parta

                                        }}
                                    >
                                        Generar
                                    </button>
                                </div>
                            </div>
                            {/* --- FIN DE BLOQUE MODIFICADO --- */}

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


AltaProductosModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
};


export default AltaProductosModal;