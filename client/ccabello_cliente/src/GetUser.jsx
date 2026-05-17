import { useEffect } from 'react'
import axios from 'axios'
import { useState } from 'react'
import { API_URL } from '@/config'

function GetUser(){
    const [name,setName] = useState();
    const [rol,setRol] = useState();

    useEffect(() => {
        axios.get(`${API_URL}/GetUser`,{ withCredentials: true })
          .then(response => {
            const name = response.data.name;
            const rol = response.data.rol;
            setName(name);
            setRol(rol)
            console.log(name);
          })
          .catch(error => {
            console.error(error);
          });
      }, []);

      return(
        <>
            <h2 style={{marginBottom: '0',marginLeft:'7%', textAlign:'center'}}>{name}</h2>
            <p style={{textAlign:'center',fontSize:'130%',marginTop:'0'}}>{rol}</p>
        </>
      )
}

export default GetUser
