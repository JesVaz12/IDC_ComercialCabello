import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
// import delIcon from '../assets/inventario/-.svg' // COMENTADO: Simulamos que quitamos el guion
import PropTypes from 'prop-types';
import modIcon from '../assets/inventario/modIcon.svg'
import ModificacionProductosModal from './ModificacionProductosModal';
import EliminarModal from './EliminarModal';

function DataTableComponent({searchTerm}) {
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedCodigo, setSelectedCodigo] = useState(null);

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

  // --- NUEVO: Lógica para pintar filas rojas (SCRUM-66) ---
  const conditionalRowStyles = [
    {
      when: row => row.cantidad < row.cantidad_minima,
      style: {
        backgroundColor: 'rgba(255, 0, 0, 0.2)', // Rojo suave
        color: 'black',
        '&:hover': {
          cursor: 'pointer',
        },
      },
    },
  ];

  const handleDelete = async (codigo) => {
    setSelectedCodigo(codigo);
    setOpenModalDelete(true);
  };

  const handleModify = async (codigo) => {
    setSelectedCodigo(codigo);
    setOpenModal(true);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:8080/data');
        const processedData = response.data.map((item) => ({
          ...item,
          cantidad: parseInt(item.cantidad, 10), 
          precio: parseFloat(item.precio), 
          cantidad_minima: parseInt(item.cantidad_minima, 10), 
        }));
        setData(processedData);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredData(data.filter((item) => {
        return (
          item.nombre.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||  
          item.codigo.indexOf(searchTerm) !== -1
        );
      }));
    } else {
      setFilteredData(data);
    }
  }, [data, searchTerm]);

  const columns = [
    { name: 'Producto', selector: (row) => row.nombre, sortable: true },
    { name: 'Cantidad', selector: (row) => row.cantidad, sortable: true },
    { name: 'Código', selector: (row) => row.codigo, sortable:true},
    { name: 'Precio', selector: (row) => row.precio, sortable: true },
    { name: 'Cantidad Mínima', selector: (row) => row.cantidad_minima, sortable: true},
    {
      name: '',
      cell: (row) => (
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}> 
          {/* --- MODIFICADO: Cambiamos la imagen del guion por una X roja (SCRUM-63) --- */}
          <div 
            onClick={() => handleDelete(row.codigo)}
            style={{
              color: 'red', 
              fontWeight: 'bold', 
              fontSize: '1.5rem', 
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            X
          </div>

          <img src={modIcon} onClick={() => handleModify(row.codigo)}
          style={{ width: '25px', height: '25px', cursor: 'pointer'}} />        
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
      paginationPerPage={5}
      fixedHeader
      fixedHeaderScrollHeight="50%"
      customStyles={customStyles}
      // --- AQUÍ APLICAMOS EL ESTILO CONDICIONAL ---
      conditionalRowStyles={conditionalRowStyles} 
      paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
    />

    {openModal && <ModificacionProductosModal closeModal={() => setOpenModal(false)} codigo={selectedCodigo}/>}
    {openModalDelete && <EliminarModal closeModal={() => setOpenModalDelete(false)} codigo={selectedCodigo}/>}

    </>
  );
}

DataTableComponent.propTypes = {
  searchTerm: PropTypes.string.isRequired,
};

export default DataTableComponent;