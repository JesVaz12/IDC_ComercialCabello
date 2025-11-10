import axios from 'axios';
import PropTypes from 'prop-types';

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
    padding: '0',
    borderRadius: '8px',
    width: '400px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden', 
  },
  header: {
    backgroundColor: '#9B1313',
    color: 'white',
    padding: '15px 20px',
    fontSize: '1.25em',
    fontWeight: 'bold',
  },
  body: {
    padding: '20px',
    // ---
    // --- INICIO DE LA CORRECCIÓN (Texto Invisible) ---
    // ---
    color: '#333', // <-- ¡ESTA LÍNEA ARREGLA EL TEXTO BLANCO!
    // ---
    // --- FIN DE LA CORRECCIÓN ---
    // ---
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: '15px 0',
    fontSize: '1.1em',
  },
  listItem: {
    marginBottom: '10px',
  },
  boldText: {
    fontWeight: 'bold',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '0 20px 20px',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1em',
  },
  btnYes: {
    backgroundColor: '#E0E0E0',
    color: '#333',
  },
  btnNo: {
    backgroundColor: '#E0E0E0',
    color: '#333',
  }
};


function EliminarUsuarioModal({ closeModal, usuario }) {

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/deleteUsuario/${usuario.usuario}`, {
        withCredentials: true 
      });
      alert('Usuario eliminado correctamente');
      closeModal(); 
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      alert('Hubo un error al eliminar el usuario.');
    }
  };

  if (!usuario) return null; 

  return (
    <div style={modalStyles.overlay} onClick={closeModal}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          ¿Estás seguro de que deseas eliminar este usuario?
        </div>
        <div style={modalStyles.body}>
          <ul style={modalStyles.list}>
            <li style={modalStyles.listItem}>
              <span style={modalStyles.boldText}>Usuario:</span> {usuario.usuario}
            </li>
            <li style={modalStyles.listItem}>
              <span style={modalStyles.boldText}>Nombre:</span> {usuario.nombre}
            </li>
            <li style={modalStyles.listItem}>
              <span style={modalStyles.boldText}>Rol:</span> {usuario.rol}
            </li>
          </ul>
          <p style={modalStyles.boldText}>Esta acción no puede deshacerse</p>
        </div>
        <div style={modalStyles.footer}>
          <button style={{...modalStyles.button, ...modalStyles.btnYes}} onClick={handleConfirmDelete}>
            Sí
          </button>
          <button style={{...modalStyles.button, ...modalStyles.btnNo}} onClick={closeModal}>
            No
          </button>
        </div>
      </div>
    </div>
  );
}

EliminarUsuarioModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  usuario: PropTypes.shape({
    usuario: PropTypes.string,
    nombre: PropTypes.string,
    rol: PropTypes.string,
  }).isRequired,
};

export default EliminarUsuarioModal;