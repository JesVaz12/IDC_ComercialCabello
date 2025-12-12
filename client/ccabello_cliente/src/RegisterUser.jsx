import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

function RegisterUser() {
    const [values, setValues] = useState({
        name: '',
        first_last_name: '',
        second_last_name: '',
        username: '',
        password: '',
        role: ''
    })
    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post('http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com/register_user', values)
            .then(res => console.log(res))
            .then(err => console.log(err));
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <input type="text" placeholder="Nombre" required name="name"
                    onChange={(e) => setValues({ ...values, name: e.target.value })} />

            </div>
            <div>
                <input type="text" placeholder="Apellido Paterno" required name="first_last_name"
                    onChange={(e) => setValues({ ...values, first_last_name: e.target.value })} />
            </div>
            <div>
                <input type="text" placeholder="Apellido Materno" required name="second_last_name"
                    onChange={(e) => setValues({ ...values, second_last_name: e.target.value })} />
            </div>
            <div>
                <input type="text" placeholder="Usuario" required name="username"
                    onChange={(e) => setValues({ ...values, username: e.target.value })} />

            </div>
            <div>
                <input type="text" placeholder="Contraseña" required name="password"
                    onChange={(e) => setValues({ ...values, password: e.target.value })} />
            </div>
            <div>
                <input type="text" placeholder="Rol" required name="role"
                    onChange={(e) => setValues({ ...values, role: e.target.value })} />

            </div>
            <button type="submit">Registrar</button>
        </form>
    )
}

export default RegisterUser;