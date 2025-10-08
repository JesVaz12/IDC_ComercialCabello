import { useEffect, useState } from 'react';
import axios from 'axios';



function Logout(){
    const [auth, setAuth] = useState(false);
    axios.defaults.withCredentials = true;
    useEffect(() => {
        axios.get('http://localhost:8080/')
        .then(res => {
            console.log(res.data); 
            if(res.data.Status === "Exito"){
                setAuth(true);
            }else{
                setAuth(false);
                window.location.href = 'http://localhost:5173/';
             }
        })
        .then(err => console.log(err));
    }, [])

    const handleDelete = () => {
        axios.get('http://localhost:8080/logout')
        // eslint-disable-next-line no-unused-vars
        .then(res => {
            location.reload(true);
        }).catch(err=>console.log(err));
    }
    return (
        <div>
            {
                auth  ?
                <div>
                    <a onClick={handleDelete} style={{cursor: 'pointer',fontSize: '1.2em'}}>Cerrar Sesión</a>
                </div>
                :
                <div>
                </div>
            }
        </div>
    )
}
export default Logout;