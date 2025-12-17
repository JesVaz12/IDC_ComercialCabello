import { useState, useEffect } from 'react';
import axios from 'axios';

function Logout() {
    const [auth, setAuth] = useState(false);

    // Configuración global de axios (asegura que las cookies viajen)
    axios.defaults.withCredentials = true;

    useEffect(() => {
        // Verificar sesión al cargar el componente
        axios.get('http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com:8080/')
            .then(res => {
                if (res.data.Status === "Exito") {
                    setAuth(true);
                } else {
                    setAuth(false);
                    // Si no hay sesión, redirigir al Login
                    window.location.href = '/';
                }
            })
            .catch(err => console.log(err));
    }, [])

    const handleDelete = () => {
        // Petición de Logout al Backend
        axios.get('http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com:8080/logout')
            .then(res => {
                // Recargar la página para limpiar el estado
                location.reload(true);
            }).catch(err => console.log(err));
    }

    return (
        <div>
            {auth ?
                <div>
                    <a onClick={handleDelete} style={{ cursor: 'pointer', fontSize: '1.2em' }}>Cerrar Sesión</a>
                </div>
                :
                <div></div>
            }
        </div>
    )
}

// ⚠️ ¡ESTA ES LA LÍNEA QUE FALTABA!
export default Logout;