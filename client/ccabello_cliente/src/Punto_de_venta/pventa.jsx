import { Component, createRef } from 'react';
import axios from 'axios';
import tienda_bg from '../assets/inventario/tienda_bg.svg';
import '../Inventario/Inventario.css';
import tienda from '../assets/inventario/tienda.svg';
import comercial from '../assets/inventario/ComercialCabello.svg';
import inventario_icon from '../assets/inventario/inventario_icon.svg'
import usericon from '../assets/inventario/user.svg'
import usuarios from '../assets/inventario/usuarios.svg'
import logoutIcon from '../assets/inventario/logout.svg'
import { Link } from "react-router-dom";
import logo_pventa from '../assets/pventa/pv.svg';
import pventa from '../assets/inventario/pventa.svg';
import DataTableComponent from './DataTableComponent';
import GetUser from '../GetUser';
import Logout from '../Logout'
import PropTypes from 'prop-types';
import toast, { Toaster } from 'react-hot-toast';
import AddProduct from './addProduct';
import Reloj from '../Reloj';

class Pventa extends Component {
  constructor(props) {
    super(props);
    this.sidenav = createRef();
    this.storeButton = createRef();
    this.ui = createRef();
    this.sidenavmenu = createRef();
    this.state = {
      isAuthenticated: false,
      rol: null,
      user: null,
      selectedProduct: null,
    };
    this.openNavbar = this.openNavbar.bind(this);
    this.closeNavbar = this.closeNavbar.bind(this);
  }

  handleProductSelect = (selectedOption) => {
    this.setState({ selectedProduct: selectedOption });
    setTimeout(() => {
      this.setState({ selectedProduct: null });
      console.log("Selected from AddProduct:", selectedOption);
    }, 100);
  };

  async componentDidMount() {
    await this.verifyUser();
    const message = localStorage.getItem('showToast');
    if (message) {
      toast.success(message);
      localStorage.removeItem('showToast');
    }
  }

  async verifyUser() {
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.get('http://localhost:8080/');

      // --> LÍNEA AÑADIDA PARA DEPURACIÓN <--
      console.log('Datos recibidos del servidor:', res.data);

      if (res.data.Status !== 'Exito') {
        window.location.replace('/');
      } else {
        this.setState({
          isAuthenticated: true,
          rol: res.data.rol // Guardamos el rol del usuario en el estado
        });
      }
    } catch (error) {
      console.error('Error verifying user', error);
    }
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
        this.sidenavmenu.current.style.display = 'flex';
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
      this.sidenavmenu.current.style.display = 'none';
      document.body.style.backgroundColor = 'rgba(255, 255, 255, 0)';
      this.ui.current.style.opacity = '1';
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  render() {
    // Decisión basada en el rol del usuario.
    // Asegúrate de que la palabra 'operario' coincida exactamente con lo que ves en la consola.
    const mostrarReloj = this.state.rol === 'Operario';

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
                      <li className="menu-item" onClick={() => this.closeNavbar()}>
                        <img src={pventa} alt="Punto de Venta" style={{ width: "25%" }} /> <span>Punto de Venta</span>
                      </li>
                      <li className="menu-item" style={{ paddingLeft: "22px" }} onClick={() => window.location.replace('/inventario')}>
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
                  <img src={logo_pventa} id="logoPuntoVenta"></img>
                </div>
                <div id="headbar">
                  <div id="userinfo" style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={usericon} />
                    <div id="username">
                      <GetUser />
                    </div>

                    {/* El Feature Flag ahora obedece al rol del usuario */}
                    {mostrarReloj && (
                      <div style={{ marginLeft: '20px', color: 'black' }}>
                        <Reloj />
                      </div>
                    )}

                  </div>
                  <div id='buscarDiv' style={{ paddingLeft: '30%', paddingTop: '2%' }}>
                    <AddProduct onProductSelect={this.handleProductSelect}></AddProduct>
                  </div>
                  <div id='opciones'>
                  </div>
                </div>
                <DataTableComponent searchTerm={this.state.selectedProduct}></DataTableComponent>
              </div>
            </div>
          )
            :
            <div>
            </div>
        }
      </>
    );
  }
}

Pventa.propTypes = {
  navigate: PropTypes.func.isRequired,
};

export default Pventa;