import './Modal.css'
import PropTypes from 'prop-types';
import axios from 'axios'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import NotificacionInventario from './NotificacionInventario';


function CobrarModal({ closeModal, data }) {
    const [openModal, setOpenModal] = useState(false);
    const [costo, setCosto] = useState(0.0);
    const [pago, setPago] = useState(0.0);
    const [selectedFaltantes, setFaltantes] = useState([]);
    const [values, setValues] = useState({
        costo: 0,
    });

    useEffect(() => {
        calcularCosto();
    }, []);

    const calcularCosto = () => {
        if (data) {
            let costo_aux = 0.0;
            for (let i = 0; i < data.length; i++) {
                costo_aux += data[i].precio * data[i].cantidad;
            }
            setCosto(costo_aux);
        }
    }


    const notificacion = async (faltantes) => {
        setFaltantes(faltantes);
        setOpenModal(true);
        alert(selectedFaltantes)
        { openModal && <NotificacionInventario closeModal={setOpenModal} faltantes={selectedFaltantes} /> }
    };

    const [showNotification, setShowNotification] = useState(false);

    // Triggered after successful API call
    const realizarCobro = () => {
        let username = '';
        axios.get('http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com:8080/GetUser', { withCredentials: true })
            .then(response => {
                username = response.data.username;
            }).then(() => {
                if (pago >= costo) {
                    axios.post('http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com:8080/realizarCobro', { pago, costo, data, username })
                        .then(res => {
                            if (res.data.Status === 'Exito') {
                                const faltantes = res.data.Faltantes;
                                const payload = { pago, costo, data };
                                localStorage.setItem('showToast', 'Venta exitosa');
                                axios.post('http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com:8080/imprimir-ticket', payload, {
                                    responseType: 'blob'
                                }).then((response) => {
                                    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', 'ticket.pdf');
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                }).catch((err) => {
                                    console.error('Error downloading PDF:', err);
                                });
                                if (faltantes && faltantes.length > 0) {
                                    setFaltantes(faltantes);
                                    setShowNotification(true);
                                } else {
                                    setTimeout(() => {
                                        window.location.replace('/punto_de_venta');
                                    }, 200);
                                }
                            } else {
                                toast.error(res.data.Error);
                            }
                        })
                        .catch(err => console.log(err));
                } else {
                    toast.error('MONTO INSUFICIENTE');
                }
            }).catch(error => console.error(error));
    };

    const getCambio = () => {
        if (pago > 0) {
            let cambio = pago - costo;
            if (cambio < 0) {
                return 0;
            } else {
                return cambio;
            }
        } else {
            return 0;
        }
    }

    return (
        <>
            <div><Toaster /></div>
            <div className="modalBackground">
                <div className="modalContainer" style={{ backgroundImage: 'unset', maxHeight: '25%', maxWidth: '35%', marginTop: '7%', backgroundColor: 'white', color: 'black' }}>
                    <div className="header">
                        Cobro
                    </div>
                    <div className="forms" style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ color: 'black', fontSize: '250%', fontWeight: '800', marginLeft: '30%', marginTop: '63' }}>Total: ${costo}</p>
                        <label htmlFor='pago' style={{ color: 'black', fontSize: '250%', fontWeight: '800', marginLeft: '30%' }}>Pago: </label>
                        <input name="pago" type="text" placeholder="Ingrese el monto" maxLength={5} style={{ width: '20%', height: '10%', borderRadius: '5px', borderColor: '#CD1C18', marginTop: '5%', marginLeft: '0%' }} onChange={e => setPago(e.target.value)} />
                        <p style={{ color: 'black', fontSize: '250%', fontWeight: '800', marginLeft: '30%' }}>Cambio:  ${getCambio()}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '5%' }}>
                            <button className='button_delete' onClick={() => realizarCobro(false)}>Cobrar</button>
                            <button className='button_delete' onClick={() => closeModal(false)}>Cancelar</button>
                        </div>
                        {showNotification && (
                            <NotificacionInventario
                                closeModal={() => setShowNotification(false)}
                                faltantes={selectedFaltantes}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

CobrarModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    data: PropTypes.array.isRequired,
};

export default CobrarModal;
