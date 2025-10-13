import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import axios from 'axios';
import Swal from 'sweetalert2';

function Login() {
    const [values, setValues] = useState({
        username: '',
        password: ''
    });

    const navigate = useNavigate();
    axios.defaults.withCredentials = true;
    const [showLogin, setShowLogin] = useState(false);

    const handleInput = (event) => {
        setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post('http://localhost:8080/login', values)
            .then(res => {
                if (res.data.Status === "Exito") {
                    navigate('/inventario');
                } else {
                    Swal.fire({
                        position: 'top-end',
                        icon: 'error',
                        title: res.data.Error,
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            })
            .catch(err => console.log(err));
    };

    useEffect(() => {
        axios.get("http://localhost:8080/")
            .then(res => {
                if (res.data.Status === "Exito") {
                    navigate('/inventario');
                } else {
                    setShowLogin(true);
                }
            })
            .catch(err => {
                setShowLogin(true);
            });
    }, []);


    if (!showLogin) {
        return null;
    }

    return (
        <div className='login-container'>
            <div className='login-box'>
                <p className='title'>Comercial Cabello</p>
                <form onSubmit={handleSubmit}>
                    {/* CORRECCIÓN 1: Se usa 'label' para evitar texto duplicado */}
                    <label className='label' htmlFor='username'>Usuario</label>
                    <input
                        className='input'
                        type="text"
                        placeholder='Ingrese su usuario'
                        name='username'
                        onChange={handleInput}
                        id='username'
                    />
                    
                    <label className='label' htmlFor='password'>Contraseña</label>
                    <input
                        className='input'
                        type="password"
                        placeholder='Ingrese su contraseña'
                        name='password'
                        onChange={handleInput}
                        id='password'
                    />
                    
                    {/* CORRECCIÓN 2: El botón ahora es un elemento <button> */}
                    <button className='button' type='submit'>Ingresar</button>
                </form>
            </div>
        </div>
    );
}

export default Login;