import './Modal.css'
import PropTypes from 'prop-types';
import axios from 'axios'
import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast';

function ModificacionUsuariosModal({ closeModal, usuario }) {
    const [values, setValues] = useState({
        usuario: '',
        nombre: '',
        apellido_materno: '',
        apellido_paterno: '',
        contrasena: '',
        rol: 'Operario',
        confirmar_contrasena: '',
    });

    useEffect(() => {
        if (usuario) {
            axios.get(`http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com/GetUserData/${usuario}`)
                .then(res => {
                    setValues({
                        usuario: res.data.usuario,
                        nombre: res.data.Nombre,
                        apellido_materno: res.data.apellido_materno,
                        apellido_paterno: res.data.apellido_paterno,
                        contrasena: res.data.texto_plano,
                        confirmar_contrasena: res.data.texto_plano,
                        rol: res.data.rol
                    });
                })

                .catch((error) => {
                    toast.error('Error obteniendo los datos del producto, recargue la página');
                    console.error(error);
                });
        }
    }, [usuario]);




    const handleSubmit = (event) => {
        event.preventDefault();
        const passError = document.getElementById("passerror")
        const usererror = document.getElementById("usererror")

        if (values.contrasena !== values.confirmar_contrasena) {
            document.getElementById("passerror").innerHTML = "Las contraseñas NO coinciden";
            usererror.removeAttribute("open");
            if (!passError.hasAttribute("open")) {
                passError.toggleAttribute("open");
            }
            return;
        } else {
            if (passError.hasAttribute("open")) {
                passError.toggleAttribute("open");
                document.getElementById("passerror").removeAttribute("open");
            }
            console.log(values);
            axios.post('http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com/update_user', values)
                .then(res => {
                    if (res.status === 200) {
                        localStorage.setItem('showToast', 'Usuario modificado con éxito');
                        window.location.reload();
                    } else {
                        if (res.data.Error.toLowerCase().includes("usuario")) {
                            document.getElementById("usererror").innerHTML = res.data.Error;
                            if (!usererror.hasAttribute("open")) {
                                usererror.toggleAttribute("open");
                            }
                        }
                    }
                })
                .catch(err => console.log(err));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        switch (name) {
            case 'nombre':
                newValue = value.slice(0, 30);
                break;
            case 'apellido_paterno':
                newValue = value.slice(0, 20);
                break;
            case 'apellido_materno':
                newValue = value.slice(0, 20);
                break;
            case 'contrasena':
                newValue = value.slice(0, 20);
                break;
            case 'confirmar_contrasena':
                newValue = value.slice(0, 20);
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

        if (['nombre', 'apellido_paterno', 'apellido_materno'].includes(name)) {
            if (e.key === '-' || e.key === '?' || e.key === '!' || e.key === '@' || e.key === '#' || e.key === '$'
                || e.key === '%' || e.key === '^' || e.key === '&' || e.key === '*' || e.key === '(' || e.key === ')'
                || e.key === '+' || e.key === '=' || e.key === '{' || e.key === '}' || e.key === '[' || e.key === ']'
                || e.key === ':' || e.key === ';' || e.key === '"' || e.key === "'" || e.key === '<' || e.key === '>'
                || e.key === ',' || e.key === '.' || e.key === '/' || e.key === '\\') {
                e.preventDefault();
            }
            const inputElement = document.getElementById(name);
            if (!isTextSelected(document.getElementById(inputElement))) {
                if (e.key in ['Backspace', 'Delete', 'Tab'] && actualLength >= maxLength[name]) {
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
            <div className="modalBackground_user">
                <div className="modalContainer_user">
                    <div className="header">
                        Modificación de Usuarios
                    </div>
                    <div className="forms_user">
                        <form onSubmit={handleSubmit} className='formModal_user'>
                            <div className='rowInput'>
                                <div className='inputLabel_user'>
                                    <label className="labelModal_user" htmlFor='nombre'>Nombre</label>
                                    <input className="inputAlta_user"
                                        required
                                        id="nombre"
                                        name='nombre'
                                        size='30'
                                        type='text'
                                        maxLength='35'
                                        value={values.nombre}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className='inputLabel_user'>
                                    <label className="labelModal_user" htmlFor='apellido_paterno'>Apellido Paterno</label>
                                    <input className="inputAlta_user"
                                        required
                                        id="apellido_paterno"
                                        name='apellido_paterno'
                                        size='30'
                                        maxLength='35'
                                        value={values.apellido_paterno}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                            </div>
                            <div className='rowInput'>
                                <div className='inputLabel_user'>
                                    <label className="labelModal_user" htmlFor='apellido_materno'>Apellido Materno</label>
                                    <input className="inputAlta_user"
                                        required
                                        id="apellido_materno"
                                        name='apellido_materno'
                                        type='text'
                                        size='30'
                                        maxLength='35'
                                        value={values.apellido_materno}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                                <div className='inputLabel_user'>
                                    <label className="labelModal_user" htmlFor='usuario' style={{ display: 'none' }}>Usuario</label>
                                    <input className="inputAlta_user"
                                        style={{ display: 'none' }}
                                        required
                                        id="usuario"
                                        name='usuario'
                                        size='30'
                                        type='text'
                                        maxLength='35'
                                        value={values.usuario}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                        disabled
                                    />
                                </div>
                            </div>
                            <error id="usererror" style={{ color: "red", marginLeft: "20%", fontSize: "140%", marginTop: "0%", marginBottom: '0%' }}>Hola soy un texto</error>
                            <div className='rowInput'>
                                <div className='inputLabel_user' style={{ marginTop: '7%' }}>
                                    <label className="labelModal_user" htmlFor='contrasena'>Contraseña</label>
                                    <input className="inputAlta_user"
                                        required
                                        id="contrasena"
                                        name='contrasena'
                                        size='30'
                                        type='password'
                                        maxLength='35'
                                        value={values.contrasena}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                                <div className='inputLabel_user'>
                                    <label className="labelModal_user" htmlFor='confirmar_contrasena'> Confirmar contraseña</label>
                                    <input className="inputAlta_user"
                                        required
                                        id="confirmar_contrasena"
                                        name='confirmar_contrasena'
                                        size='30'
                                        type='password'
                                        maxLength='35'
                                        value={values.confirmar_contrasena}
                                        onChange={handleChange}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                            </div>
                            <error id="passerror" style={{ color: "red", marginLeft: "20%", fontSize: "140%" }}>Hola soy un texto</error>

                            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '4%', color: 'black' }}>
                                <label className="labelModal_user" htmlFor='rol'> Rol</label>
                                <div>
                                    <input className="inputAlta_user"
                                        required
                                        id="rol_operario"
                                        name='rol'
                                        type='radio'
                                        value="Operario"
                                        onChange={(e) => setValues({ ...values, rol: e.target.value })}
                                        checked={values.rol === "Operario"} />
                                    <label htmlFor="rol" style={{ marginRight: '5%' }}> Operario</label>
                                    <input className="inputAlta_user"
                                        required
                                        id="rol_admin"
                                        name='rol'
                                        type='radio'
                                        value="Administrador"
                                        onChange={(e) => setValues({ ...values, rol: e.target.value })}
                                        checked={values.rol === "Administrador"}
                                    />
                                    <label htmlFor="rol"> Administrador</label>
                                </div>
                            </div>
                            <div id='buttons' style={{ marginTop: '3%' }}>
                                <button id='acceptButton_user' type='submit'>Aceptar</button>
                                <button id='cancelButton_user' onClick={() => closeModal(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

ModificacionUsuariosModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    usuario: PropTypes.string.isRequired,
};

export default ModificacionUsuariosModal;
