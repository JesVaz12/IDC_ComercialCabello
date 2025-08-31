import  { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import ModificacionProductosModal from './ModificacionProductosModal';

function DataTableComponentFaltantes() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
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

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('http://localhost:8081/dataFaltantes');
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






  const columns = [
    { name: 'Producto', selector: (row) => row.nombre, sortable: true },
    { name: 'Cantidad', selector: (row) => row.cantidad, sortable: true },
    { name: 'Código', selector: (row) => row.codigo},
    { name: 'Precio', selector: (row) => row.precio, sortable: true },
    { name: 'Cantidad Mínima', selector: (row) => row.cantidad_minima, sortable: true},
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
    <DataTable
      columns={columns}
      data={data} 
      noDataComponent="Producto no disponible"
      defaultSortFieldId={1}
      pagination
      responsive
      aginationPerPage={5}
      fixedHeader
      fixedHeaderScrollHeight="50%"
      customStyles={customStyles}
      paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
    />

    {openModal && <ModificacionProductosModal closeModal={() => setOpenModal(false)} />}

    </>
  );
  
}

export default DataTableComponentFaltantes;