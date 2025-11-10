import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

// (Puedes reutilizar los estilos del EliminarModal si lo deseas)
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '450px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  },
  header: {
    fontSize: '1.5em',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    fontWeight: 'bold',
  },
  input: {
    padding: '8px',
    fontSize: '1em',
    border: '1px solid #CCC',
    borderRadius: '4px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  btnSave: {
    backgroundColor: '#9B1313',
    color: 'white',
  },
  btnCancel: {
    backgroundColor: '#E0E0E0',
    color: '#333',
  }
};

function ModificacionUsuarioModal({ closeModal, usuario }) {
  const [formData, setFormData] = useState({
    usuario: '',
    nombre: '',
    rol: '',
    password: '' // Incluir password por si se quiere modificar
  });

  // Cuando el componente carga, llena el formulario con los datos del usuario
  useEffect(() => {
    if (usuario) {
      setFormData({
        usuario: usuario.usuario || '',
        nombre: usuario.nombre || '',
        rol: usuario.rol || '',
        password: '' // Dejar vacío por seguridad
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Preparamos los datos. Si la contraseña está vacía, no la enviamos.
      const dataToUpdate = { ...formData };
      if (!dataToUpdate.password) {
        delete dataToUpdate.password;
      }
      
      // El ID (username) va en la URL, no en el body
      const username = usuario.usuario;
      delete dataToUpdate.usuario; // No se puede modificar el username
      
      await axios.put(`http://localhost:8080/usuarios/${username}`, dataToUpdate);
      alert('Usuario modificado correctamente');
      closeModal();
    } catch (error) {
      console.error('Error al modificar el usuario:', error);
      alert('Hubo un error al modificar el usuario.');
    }
  };

  if (!usuario) return null;

  return (
    <div style={modalStyles.overlay} onClick={closeModal}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>Modificar Usuario</div>
        <form style={modalStyles.form} onSubmit={handleSubmit}>
          
          <label style={modalStyles.label}>
            Usuario:
            {/* El nombre de usuario (ID) no se puede editar */}
            <input 
              type="text" 
              name="usuario"
              value={formData.usuario}
              readOnly 
              style={{...modalStyles.input, backgroundColor: '#EEE'}}
            />
          </label>

          <label style={modalStyles.label}>
            Nombre:
            <input 
              type="text" 
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              style={modalStyles.input}
            />
          </label>
          
          <label style={modalStyles.label}>
            Rol:
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              style={modalStyles.input}
            >
              <option value="Operario">Operario</option>
              <option value="Administrador">Administrador</option>
              {/* Añade más roles si es necesario */}
            </select>
          </label>

          <label style={modalStyles.label}>
            Contraseña:
            <input 
              type="password" 
              name="password"
              placeholder="Dejar en blanco para no cambiar"
              value={formData.password}
              onChange={handleChange}
              style={modalStyles.input}
            />
          </label>

          <div style={modalStyles.buttonContainer}>
            <button type="button" style={{...modalStyles.button, ...modalStyles.btnCancel}} onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" style={{...modalStyles.button, ...modalStyles.btnSave}}>
              Guardar Cambios
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

ModificacionUsuarioModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  usuario: PropTypes.shape({
    usuario: PropTypes.string,
    nombre: PropTypes.string,
    rol: PropTypes.string,
  }).isRequired,
};

export default ModificacionUsuarioModal;