import { Component, createRef } from 'react';
import './Inventario.css';
import tienda from '../assets/inventario/tienda.svg';
import comercial from '../assets/inventario/ComercialCabello.svg';
import inventario from '../assets/inventario/inventarioo.svg';
import inventario_icon from '../assets/inventario/inventario_icon.svg'
import usericon from '../assets/inventario/user.svg'
import usuarios from '../assets/inventario/usuarios.svg'
import logoutIcon from '../assets/inventario/logout.svg'
import { Link } from "react-router-dom";
import pventa from '../assets/inventario/pventa.svg';
import tienda_bg from '../assets/inventario/tienda_bg.svg';
import DataTableComponent from './DataTableComponent';
import GetUser from '../GetUser';
import axios from 'axios';
import Logout from '../Logout'
import AltaProductos from './AltaProductos';
import PropTypes from 'prop-types';
import ListaDeFaltantes from './ListaDeFaltantes';
import toast, { Toaster } from 'react-hot-toast';

class Inventario extends Component {
  constructor(props) {
    super(props);
    this.sidenav = createRef();
    this.storeButton = createRef();
    this.ui = createRef();
    this.sidenavmenu = createRef();
    this.state = {
      isAuthenticated: false,
      searchTerm: '' // Inicializamos searchTerm para evitar errores de componente no controlado
    };
    this.openNavbar = this.openNavbar.bind(this);
    this.closeNavbar = this.closeNavbar.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
  }

  async componentDidMount() {
    console.log('Component Mounted, isAuthenticated prop:', this.state.isAuthenticated);

    // Configuración global de credenciales para asegurar que la cookie viaje siempre
    axios.defaults.withCredentials = true;

    await this.verifyUser();

    const message = localStorage.getItem('showToast');
    if (message) {
      toast.success(message);
      localStorage.removeItem('showToast');
    }
  }

  async verifyUser() {
    try {
      // CORRECCIÓN CRÍTICA:
      // Cambiamos la ruta de '/' a '/login'.
      // La ruta '/' es interceptada por el Frontend en el Balanceador de Carga.
      // La ruta '/login' sí llega al Backend.
      const res = await axios.get('http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com:8080/');

      // Verificamos si la respuesta es "Exito" O si el backend devuelve un usuario logueado
      if (res.data.Status === 'Exito') {
        this.setState({ isAuthenticated: true });
        console.log("✅ Verificado: Sesión activa");
      } else {
        console.log("❌ No verificado: Respuesta del servidor no es Exito", res.data);
        window.location.replace('/');
      }
    } catch (error) {
      console.error('Error verifying user', error);
      // Si falla la conexión o da error 404/500, asumimos que no hay sesión
      window.location.replace('/');
    }
  }

  handleSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  openNavbar() {
    if (this.sidenav.current && this.storeButton.current && this.ui.current) {
      this.sidenav.current.style.width = '300px';
      this.sidenav.current.style.background = `url(${tienda_bg}), #9B1313`;
      this.sidenav.current.style.backgroundPosition = 'left 5%';
      this.sidenav.current.style.backgroundPositionX = 'center';
      this.sidenav.current.style.backgroundSize = '350%';
      this.storeButton.current.style.marginLeft = '28%';
      this.ui.current.onclick = this.closeNavbar;
      this.sleep(250).then(() => {
        if (this.sidenavmenu.current) {
          this.sidenavmenu.current.style.display = 'flex';
        }
      });
      this.ui.current.style.opacity = '.5';
    }
  }

  closeNavbar() {
    if (this.sidenav.current && this.storeButton.current && this.ui.current) {
      this.sidenav.current.style.width = '60%';
      this.sidenav.current.style.background = '#9B1313';
      this.storeButton.current.style.marginLeft = '10%';
      this.ui.current.onclick = null;
      if (this.sidenavmenu.current) {
        this.sidenavmenu.current.style.display = 'none';
      }
      document.body.style.backgroundColor = 'rgba(255, 255, 255, 0)';
      this.ui.current.style.opacity = '1';
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  render() {
    return (
      <>
        {
          this.state.isAuthenticated ? (
            <div id="screen">
              <Toaster />
              <div id="sidenavbar">
                <div className="sidenav" id="mySidenav" ref={this.sidenav}>
                  <img
                    src={tienda}
                    id="tienda"
                    ref={this.storeButton}
                    onClick={this.openNavbar}
                    alt="Store Icon"
                  />
                  <div className="sidenavmenu" ref={this.sidenavmenu}>
                    <img src={comercial} alt="Comercial Icon" id="logo" />
                    <ul className="menu">
                      <li className="menu-item" onClick={() => window.location.replace('/punto_de_venta')}>
                        <img src={pventa} alt="Punto de Venta" style={{ width: "25%" }} /> <span>Punto de Venta</span>
                      </li>
                      <li className="menu-item" style={{ paddingLeft: "22px" }} onClick={this.closeNavbar}>
                        <img src={inventario_icon} className="imageIcon" alt="Inventario" style={{ width: "25%" }} /> <span>Inventario</span>
                      </li>
                      <li className="menu-item" style={{ paddingLeft: "19px" }} onClick={() => window.location.replace('/usuarios')} >
                        <img src={usuarios} className="imageIcon" alt="Messages" style={{ width: "25%" }} /> <span>Administración de Usuarios</span>
                      </li>
                      <li className="menu-item">
                        <img src={logoutIcon} className="imageIcon" alt="Cerrar Sesión" /> <Logout />
                      </li>
                    </ul>
                    <Link to="/login">  </Link>
                  </div>
                </div>
              </div>
              <div className="ui" id="ui" ref={this.ui}>
                <div id="header">
                  <img src={inventario} id="logoInventario" alt="Logo Inventario"></img>
                </div>
                <div id="headbar">
                  <div id="userinfo">
                    <img src={usericon} alt="User Icon" />
                    <div id="username">
                      <GetUser></GetUser>
                    </div>
                  </div>
                  <div id='buscarDiv'>
                    <p style={{ color: 'black', fontSize: '120%', marginBottom: '0', marginTop: '0' }}>Buscar Inventario</p>
                    <input id='inputBuscar' placeholder='Nombre o código del producto'
                      value={this.state.searchTerm}
                      onChange={this.handleSearchChange}
                    ></input>
                  </div>
                  <div id='opciones'>
                    <AltaProductos />
                    <ListaDeFaltantes />
                  </div>
                </div>
                <DataTableComponent searchTerm={this.state.searchTerm}></DataTableComponent>
              </div>
            </div>
          )
            :
            // Puedes poner un spinner de carga aquí si quieres
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <p>Verificando sesión...</p>
            </div>
        }
      </>
    );
  }
}

Inventario.propTypes = {
  // navigate no se usa directamente en props aquí, pero lo dejo por compatibilidad si lo usas
};

export default Inventario;