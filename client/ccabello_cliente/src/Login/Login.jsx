import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Assuming your assets are in the correct path
import ellipse from '../assets/login/ellipse.svg';
import tienda from '../assets/login/tienda.svg';
import logo from '../assets/login/logo.svg';

// Assuming your CSS file is in the same directory
import './Login.css';

export default function Login() {
    const [values, setValues] = useState({
        username: '',
        password: '',
    });
    const [showLogin, setShowLogin] = useState(false);
    const navigate = useNavigate();

    // Set withCredentials to true for all axios requests
    axios.defaults.withCredentials = true;

    // Function to handle form submission
    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        axios.post('http://localhost:8080/login', values)
            .then(res => {
                if (res.data.Status === 'Exito') {
                    navigate('/inventario'); // Navigate on successful login
                } else {
                    // Handle and display specific errors from the server
                    const userErrorElement = document.getElementById("usererror");
                    const passwordErrorElement = document.getElementById("wrongpassword");

                    if (res.data.Error.toLowerCase().includes("usuario")) {
                        userErrorElement.innerText = res.data.Error;
                        userErrorElement.style.display = 'block';
                        passwordErrorElement.style.display = 'none';
                    } else if (res.data.Error.toLowerCase().includes("contraseña")) {
                        passwordErrorElement.innerText = res.data.Error;
                        passwordErrorElement.style.display = 'block';
                        userErrorElement.style.display = 'none';
                    }
                }
            })
            .catch(err => console.log(err)); // Log any other errors
    };

    // useEffect to check for an existing session when the component mounts
    useEffect(() => {
        axios.get("http://localhost:8080/")
            .then((res) => {
                if (res.data?.Status === "Exito") {
                    setShowLogin(false);
                    navigate("/inventario"); // If already logged in, redirect
                } else {
                    setShowLogin(true); // If not logged in, show the login form
                }
            })
            .catch(() => {
                setShowLogin(true); // Show login form on any error (e.g., server down)
            });
    }, [navigate]);

    return (
        <>
            {showLogin ? (
                <div className='layout'>
                    <div className='horizontal_layout'>
                        <div className='tienda_logo'>
                            <img src={ellipse} className="ellipse" alt="ellipse background" />
                            <img src={tienda} className="tienda" alt="store icon" />
                        </div>
                        <div className="login">
                            <img src={logo} className='logo' alt='company logo' />
                            <form onSubmit={handleSubmit} noValidate>
                                <label htmlFor="username" className='label'>Usuario</label>
                                <input
                                    id="username"
                                    className='input'
                                    name="username"
                                    type="text"
                                    maxLength={20}
                                    required
                                    onChange={(e) => setValues({ ...values, username: e.target.value })}
                                />
                                <small id="usererror" style={{ color: "red", display: 'none', marginLeft: "36%" }}></small>

                                <label htmlFor="password" className='label'>contraseña</label>
                                <input
                                    id="password"
                                    className='input'
                                    name="password"
                                    type="password"
                                    maxLength={20}
                                    required
                                    onChange={(e) => setValues({ ...values, password: e.target.value })}
                                />
                                <small id="wrongpassword" style={{ color: "red", display: 'none', marginLeft: "36%" }}></small>

                                <button type="submit" className='button'>INGRESAR</button>
                            </form>
                        </div>
                    </div>
                    <div className='rectangle'></div>
                </div>
            ) : (
                // Render nothing or a loading spinner while checking auth status
                <div></div>
            )}
        </>
    );
}