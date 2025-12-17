import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import PropTypes from 'prop-types';
import modIcon from '../assets/inventario/modIcon.svg';

import ModificacionUsuarioModal from './ModificacionUsuarioModal.jsx';
import EliminarUsuarioModal from './EliminarUsuarioModal.jsx';

function DataTableComponent({ searchTerm }) {
  const [filteredData, setFilteredData] = useState([]);
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
  };

  const handleDelete = (usuario) => {
    setSelectedUsuario(usuario);
    setOpenModalDelete(true);
  };

  const handleModify = (usuario) => {
    setSelectedUsuario(usuario);
    setOpenModal(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ---
        // --- INICIO DE LA CORRECCIÓN (Error 403) ---
        // ---
        // Añadimos 'withCredentials: true' para que axios envíe la cookie de login
        const response = await axios.get('http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com:8080/data_usuarios', {
          withCredentials: true
        });
        // ---
        // --- FIN DE LA CORRECCIÓN ---
        // ---
        setData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [openModal, openModalDelete]);

  useEffect(() => {
    if (searchTerm === null) {
      setFilteredData(data);
      return;
    }
    if (searchTerm && searchTerm.value !== undefined && searchTerm.value !== null) {
      const busqueda = searchTerm.value;
      const filtered = data.filter((row) =>
        (row.nombre && row.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
        (row.usuario && String(row.usuario).toLowerCase().includes(busqueda.toLowerCase())) ||
        (row.rol && String(row.rol).toLowerCase().includes(busqueda.toLowerCase()))
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  const columns = [
    { name: 'Usuario', selector: (row) => row.usuario, sortable: true },
    { name: 'Nombre', selector: (row) => row.nombre, sortable: true },
    { name: 'Rol', selector: (row) => row.rol, sortable: true },
    {
      name: 'Acciones',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
          <button
            onClick={() => handleDelete(row)}
            style={{
              color: 'red',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '3.8em',
              fontWeight: 'bold',
              padding: '0',
              lineHeight: '1'
            }}
            title="Eliminar"
          >
            {'\u00D7'}
          </button>

          <img
            src={modIcon}
            onClick={() => handleModify(row)}
            style={{ width: '24px', height: '24px', cursor: 'pointer' }}
            alt="Modificar"
            title="Modificar"
          />
        </div>
      ),
      ignoreRowClick: true,
      width: '120px'
    },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredData && filteredData.length >= 0 ? filteredData : data}
        noDataComponent="No se encontraron usuarios"
        defaultSortFieldId={1}
        pagination
        responsive
        paginationPerPage={5}
        fixedHeader
        fixedHeaderScrollHeight="50%"
        customStyles={customStyles}
        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
      />

      {openModal && <ModificacionUsuarioModal closeModal={() => setOpenModal(false)} usuario={selectedUsuario} />}
      {openModalDelete && <EliminarUsuarioModal closeModal={() => setOpenModalDelete(false)} usuario={selectedUsuario} />}
    </>
  );
}

DataTableComponent.propTypes = {
  searchTerm: PropTypes.object,
};

export default DataTableComponent;