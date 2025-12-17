import { Component, createRef } from 'react';
import './Inventario.css';
import tienda from '../assets/inventario/tienda.svg';
import comercial from '../assets/inventario/ComercialCabello.svg';
import lista_faltantes from '../assets/inventario/lista_de_faltantes.svg'
import inventario_icon from '../assets/inventario/inventario_icon.svg'
import usericon from '../assets/inventario/user.svg'
import usuarios from '../assets/inventario/usuarios.svg'
import logoutIcon from '../assets/inventario/logout.svg'
import { Link } from "react-router-dom";
import pventa from '../assets/inventario/pventa.svg';
import tienda_bg from '../assets/inventario/tienda_bg.svg';
import DataTableComponentFaltantes from './DataTableComponentFaltantes';
import GetUser from '../GetUser';
import axios from 'axios';
import Logout from '../Logout'
import PropTypes from 'prop-types';
import download from '../assets/inventario/download.svg';

class Faltantes extends Component {
  constructor(props) {
    super(props);
    this.sidenav = createRef();
    this.storeButton = createRef();
    this.ui = createRef();
    this.sidenavmenu = createRef();
    this.state = {
      isAuthenticated: false,
    };
    this.openNavbar = this.openNavbar.bind(this);
    this.closeNavbar = this.closeNavbar.bind(this);
  }

  async componentDidMount() {
    console.log('Component Mounted, isAuthenticated prop:', this.state.isAuthenticated);
    await this.verifyUser();
  }

  async verifyUser() {
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.get('http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com:8080/');
      if (res.data.Status !== 'Exito') {
        window.location.replace('/');
        console.log(" notverified");

      } else {
        this.setState({ isAuthenticated: true });
        console.log("verified");
      }
    } catch (error) {
      console.error('Error verifying user', error);
    }
  }

  async descargarPdf() {
    try {
      // eslint-disable-next-line no-unused-vars
      const response = await axios.get('http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com:8080/generar-pdf');
    }
    catch (error) {
      console.error('Error descargando el pdf', error);
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

    return (
      <>
        {
          this.state.isAuthenticated ? (
            <div id="screen">
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
                <div id="header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div id="userinfo" style={{ marginTop: '10%' }}>
                    <img src={usericon} />
                    <div id="username">
                      <GetUser></GetUser>
                    </div>
                  </div>
                  <img src={lista_faltantes} id="logoFaltantes" style={{ width: '50%', marginLeft: '23%' }}></img>
                </div>
                <div id="headbar">
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <button className='button_faltantes' onClick={() => location.href = "http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com:8080/generar-pdf"} style={{ width: '12%' }}><img className='filter-white' src={download} style={{ width: '16%', marginRight: '10%' }}></img>Descargar </button>
                    <button className='button_faltantes' onClick={() => window.location.replace('/inventario')}>Inventario</button>
                  </div>
                </div>
                <DataTableComponentFaltantes ></DataTableComponentFaltantes>
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
Faltantes.propTypes = {
  navigate: PropTypes.func.isRequired,
};

export default Faltantes;