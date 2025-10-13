import { useEffect, useState } from 'react'
import ellipse from '../assets/login/ellipse.svg'
import tienda from '../assets/login/tienda.svg'
import logo from '../assets/login/logo.svg'
import './Login.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Login() {
    const [values, setValues] = useState({
        username: '',
        password: '',
    })
    const [showLogin, setShowLogin] = useState(false);
    const navigate = useNavigate();
    console.log(showLogin);
    axios.defaults.withCredentials = true;
    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post('http://localhost:8080/login', values)
        .then(res => {
            if(res.data.Status==='Exito'){
              navigate('/inventario');
            }else{
                if(res.data.Error.toLowerCase().includes("usuario")){
                  document.getElementById("usererror").innerHTML=res.data.Error;
                  const userError = document.getElementById("usererror")
                  if (!userError.hasAttribute("open")) {
                    userError.toggleAttribute("open");
                    document.getElementById("wrongpassword").removeAttribute("open");
                  }
                }else{
                  document.getElementById("usererror").removeAttribute("open");
                  if(res.data.Error.toLowerCase().includes("contraseña")){
                    document.getElementById("wrongpassword").innerHTML=res.data.Error;
                    const userError = document.getElementById("wrongpassword")
                    if (!userError.hasAttribute("open")) {
                      userError.toggleAttribute("open");
                      document.getElementById("usererror").removeAttribute("open");
                    }
                  }else{
                    document.getElementById("wrongpassword").removeAttribute("open");
                  }
                }
            }
        })
        .then(err => console.log(err));
    }

    useEffect(() => {
      axios.defaults.withCredentials = true;
      axios.get("http://localhost:8080/")
        .then((res) => {
          if (res.data?.Status === "Exito") {
            setShowLogin(false);
            navigate("/inventario");
          }else{
            setShowLogin(true);
          }
        })
        // eslint-disable-next-line no-unused-vars
        .catch((error) => {
          setShowLogin(true);
        });

    }, []);

    return (
      <>
      {  showLogin ?(
        <div className='layout'>
          <div className='horizontal_layout'>
            <div className='tienda_logo'>
              <img src={ellipse} className="ellipse" alt="React logo" />
              <img src={tienda} className="tienda" alt="React logo" />
            </div>
            <div className="login">
              <img src={logo} className='logo' alt='logo' />
              <form onSubmit={handleSubmit} required id="loginform">
                <p className='label'>Usuario</p>
                <label> 
                  <input className='input'
                    type="text" 
                    required
                    data-error="Usuario no registrado"
                    maxLength={20}
                    name='username'
                    onChange={(e) => setValues({...values, username: e.target.value})}
                  />
                  <error id="usererror" style={{color: "red", marginLeft: "36%", fontSize: "140%"}}>Hola soy un texto</error>
                </label>
                <p className='label'>Contraseña</p>
                <label> 
                  <input className='input'
                    type="password" 
                    required
                    data-error="Contraseña incorrecta"
                    maxLength={20}
                    name='password'
                    onChange={(e) => setValues({...values, password: e.target.value})}
                  />
                  <error id="wrongpassword" style={{color: "red", marginLeft: "36%", fontSize: "140%"}}>Hola soy un texto</error>
                </label>
                <label>
                  <button type="submit" className='button'>INGRESAR</button>
                </label>
              </form>
            </div>
          </div>
          <div className='rectangle'>
          </div>
        </div>
      ) : (
        <div>
        </div>
      )
      }
      </>
    )
}

export default Login;