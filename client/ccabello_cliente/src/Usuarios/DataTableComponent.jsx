import  { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
// --- MODIFICACIÓN: Ya no necesitamos el delIcon ---
// import delIcon from '../assets/inventario/-.svg' 
import modIcon from '../assets/inventario/modIcon.svg'
import showIcon from '../assets/usuarios/mostrar.svg'
import hideIcon from '../assets/usuarios/esconder.svg'
import ModificacionUsuariosModal from './ModificacionUsuariosModal';
import EliminarModal from './EliminarModal.jsx';

function DataTableComponent() {
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#9B1313",
        color: "white",
        fontSize: "170%",
        height: "200%",
      },
    },
  }


  const handleDelete = async (codigo) => {
    setSelectedUsuario(codigo);
    setOpenModalDelete(true);
    // {openModal && <EliminarModal closeModal={setOpenModal} codigo={selectedUsuario}/>}
  };


  //Modificar
  const handleModify = async (usuario) => {
    setSelectedUsuario(usuario);
    setOpenModal(true);
    // {openModal && <ModificacionUsuariosModal closeModal={setOpenModal} codigo={selectedUsuario}/>}
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/data_usuarios');
        setData(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const togglePassword = (userId) => {
    setVisiblePasswords(prevState => ({
      ...prevState,
      [userId]: !prevState[userId]
    }));
  };

  const columns = [
    { name: 'Usuario', selector: (row) => row.usuario, sortable: true },
    { name: 'Nombre', selector: (row) => row.nombre, sortable: true },
    { name: 'Apellidos', selector: (row) => `${row.apellido_paterno} ${row.apellido_materno}`, sortable: true },
    { name: 'Rol', selector: (row) => row.rol, sortable: true },
    {
      name: 'Contraseña',
      selector: (row) => (
        <div>
          {visiblePasswords[row.usuario] ? row.texto_plano : '********'}
        </div>
      ),
    },
    {
      name: '',
      cell: (row) => (
        // --- INICIO DE LA MODIFICACIÓN ---
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
          {/* Botón de Mostrar/Ocultar contraseña */}
          <img 
            src={visiblePasswords[row.usuario] ? hideIcon : showIcon} 
            alt="Toggle Password" 
            onClick={() => togglePassword(row.usuario)}
            style={{ cursor: 'pointer', width: '24px', height: '24px' }}
            title="Mostrar/Ocultar"
          />

          {/* Botón de Modificar */}
          <img 
            src={modIcon} 
            onClick={() => handleModify(row.usuario) }
            style={{ width: '24px', height: '24px', cursor: 'pointer'}} 
            alt="Modificar"
            title="Modificar"
          />

          {/* Reemplazamos el <img> por un <button> con una 'X' */}
          <button 
            onClick={() => handleDelete(row.usuario)}
            style={{
              color: 'red',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '3.8em', // Hacemos la 'X' más grande
              fontWeight: 'bold',
              padding: '0',
              lineHeight: '1'
            }}
            title="Eliminar"
          >
            {'\u00D7'}
          </button>
        </div>
        // --- FIN DE LA MODIFICACIÓN ---
      ),
      ignoreRowClick: true,
    },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
    <DataTable
      columns={columns}
      data={data} 
      noDataComponent="No hay usuarios"
      defaultSortFieldId={1}
      pagination
      responsive
      paginationPerPage={5} // Corregido el typo 'aginationPerPage'
      fixedHeader
      fixedHeaderScrollHeight="50%"
      customStyles={customStyles}
      paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
    />

    {openModal && <ModificacionUsuariosModal closeModal={() => setOpenModal(false)} usuario={selectedUsuario}/>}
    {openModalDelete && <EliminarModal closeModal={() => setOpenModalDelete(false)} codigo={selectedUsuario}/>}
    </>
  );
}

export default DataTableComponent;