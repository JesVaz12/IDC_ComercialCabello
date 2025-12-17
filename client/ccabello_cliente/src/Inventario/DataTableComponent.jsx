import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import PropTypes from 'prop-types';
import modIcon from '../assets/inventario/modIcon.svg';
// --- CORRECCIÓN: Se añaden extensiones .jsx para ayudar al build ---
import ModificacionProductosModal from './ModificacionProductosModal.jsx';
import EliminarModal from './EliminarModal.jsx';

function DataTableComponent({ searchTerm }) {
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedCodigo, setSelectedCodigo] = useState(null);

  // Estilos de la cabecera
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

  // --- ESTA ES TU NUEVA FUNCIONALIDAD ---
  /**
   * Define los estilos condicionales para las filas de la tabla.
   * Si la cantidad es menor a 5, la fila se resalta en rojo claro.
   */
  const conditionalRowStyles = [
    {
      when: row => row.cantidad < 5, // La condición
      style: {
        backgroundColor: 'rgba(255, 68, 68, 0.2)', // Un rojo claro semi-transparente
        color: '#B80000', // Un color de texto más oscuro para legibilidad
        '&:hover': {
          backgroundColor: 'rgba(255, 68, 68, 0.3)', // Un poco más oscuro en hover
        },
      },
    },
  ];
  // --- FIN DE LA NUEVA FUNCIONALIDAD ---

  const handleDelete = async (codigo) => {
    setSelectedCodigo(codigo);
    setOpenModalDelete(true);
  };

  const handleModify = (codigo) => {
    setSelectedCodigo(codigo);
    setOpenModal(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ CORRECCIÓN CRÍTICA: Se agregó el puerto :8080 aquí abajo
        const response = await axios.get('http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com:8080/data');
        setData(response.data);
        setFilteredData(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm === null) {
      setFilteredData(data);
      return;
    }

    if (searchTerm && searchTerm.value !== undefined && searchTerm.value !== null) {
      const busqueda = searchTerm.value;
      const filtered = data.filter((row) =>
        (row.nombre && row.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
        (row.codigo && String(row.codigo).toLowerCase().includes(busqueda.toLowerCase()))
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  const columns = [
    { name: 'Producto', selector: (row) => row.nombre, sortable: true },
    { name: 'Cantidad', selector: (row) => row.cantidad, sortable: true },
    { name: 'Código', selector: (row) => row.codigo, sortable: true },
    { name: 'Precio', selector: (row) => row.precio, sortable: true },
    { name: 'Cantidad Mínima', selector: (row) => row.cantidad_minima, sortable: true },
    {
      name: '',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
          {/* Botón de Eliminar (X) */}
          <button
            onClick={() => handleDelete(row.codigo)}
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

          {/* Mantenemos el icono de modificar */}
          <img
            src={modIcon}
            onClick={() => handleModify(row.codigo)}
            style={{ width: '24px', height: '24px', cursor: 'pointer' }}
            alt="Modificar"
            title="Modificar"
          />
        </div>
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
        data={filteredData && filteredData.length >= 0 ? filteredData : data}
        noDataComponent="Producto no disponible"
        defaultSortFieldId={1}
        pagination
        responsive
        paginationPerPage={5} // Corregido el typo 'aginationPerPage'
        fixedHeader
        fixedHeaderScrollHeight="50%"
        customStyles={customStyles}
        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}

        // --- APLICAMOS LA NUEVA FUNCIONALIDAD ---
        conditionalRowStyles={conditionalRowStyles}
      />

      {openModal && <ModificacionProductosModal closeModal={() => setOpenModal(false)} codigo={selectedCodigo} />}
      {openModalDelete && <EliminarModal closeModal={() => setOpenModalDelete(false)} codigo={selectedCodigo} />}
    </>
  );
}

DataTableComponent.propTypes = {
  searchTerm: PropTypes.object,
};

export default DataTableComponent;