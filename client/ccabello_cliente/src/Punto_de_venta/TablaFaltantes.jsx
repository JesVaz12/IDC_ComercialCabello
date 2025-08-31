import  { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import delIcon from '../assets/inventario/-.svg'
import PropTypes from 'prop-types';
import CobrarModal from './CobrarModal';
import toast, { Toaster } from 'react-hot-toast';



function TablaFaltantes({faltantes}) {
  const [openModal, setOpenModal] = useState(false);
  //const [openModal, setOpenModal] = useState(false);
  //const [openModalDelete, setOpenModalDelete] = useState(false);
  //const [selectedCodigo, setSelectedCodigo] = useState(null);
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

/*  const handleDelete = async (codigo) => {
    try {
      axios.delete(`http://localhost:8081/deleteProducto/${codigo}`);
      setData(data.filter((row) => row.codigo !== codigo));
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };*/


  const handleCobrar = async () => {
      if(data.length>0){
        setOpenModal(true);
        {openModal && <CobrarModal closeModal={{setOpenModal}}/>}
      }else{
        toast.error('Por favor, ingrese algún producto');
      }
  };

  const columns = [
    { name: 'Producto', selector: (row) => row.nombre },
    { name: 'Cantidad Actual', selector: (row) => row.cantidad}
  ];

  return (
    <>
    <div>
      <DataTable
        columns={columns}
        data={faltantes} 
        noDataComponent="Producto no disponible"
        defaultSortFieldId={1}
        pagination
        responsive
        PaginationPerPage={5}
        fixedHeader
        fixedHeaderScrollHeight="50%"
        customStyles={customStyles}
        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
      />      
    </div>
    </>
  );
  
}
//    {openModal && <ModificacionProductosModal closeModal={() => setOpenModal(false)} codigo={selectedCodigo}/>}
//{openModalDelete && <EliminarModal closeModal={() => setOpenModalDelete(false)} codigo={selectedCodigo}/>}

TablaFaltantes.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  faltantes: PropTypes.array.isRequired
};

export default TablaFaltantes;