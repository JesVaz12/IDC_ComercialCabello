import  { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import delIcon from '../assets/inventario/-.svg'
import PropTypes from 'prop-types';
import CobrarModal from './CobrarModal';
import toast, { Toaster } from 'react-hot-toast';
import './Modal.css'
import papelera from '../assets/pventa/papelera.png'
import ConfirmacionModal from './ConfirmacionModal';



function DataTableComponent({searchTerm}) {
  const[filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [confirmacionModal, setConfirmacionModal] = useState(false);
  const [previousData, setPreviousData] = useState([]);
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

  const cancelarPventa = async () => {
    if (data.length === 0) {
      window.location.replace('/punto_de_venta');
    }else{
      setConfirmacionModal(true);
      {confirmacionModal && <CobrarModal closeModal={{setConfirmacionModal}}/>}
    }
};

  const removeItem = (codigoToRemove) => {
    const filteredData = data.filter(item => item.codigo !== codigoToRemove);
    setData(filteredData);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    }
    fetchData();
  }, []);



  useEffect(() => {
    async function fetchDataProduct() {
        if (searchTerm) {
            const response = await axios.get(`http://localhost:8081/GetProducto/${searchTerm.value}`);
            const data_response = Array.isArray(response.data) ? response.data : [response.data];
            const processedData = data_response.map((item) => ({
                nombre: item.Producto.nombre,
                codigo: parseInt(item.Producto.codigo, 10),
                cantidad: parseInt(1, 10), 
                precio: parseFloat(item.Producto.precio), 
                inventario: parseInt(item.Producto.cantidad, 10),
              }));
            const filteredData = data.filter(item => item.codigo == processedData[0].codigo);
            if(filteredData.length==0){
                setData(data.concat(processedData[0]));
                setFilteredData(processedData[0]);
            }else if (filteredData.length>0 ){
                const updatedData = data.map(item => {
                    if (item.codigo === filteredData[0].codigo) {
                        return { ...item, cantidad: item.cantidad + 1 };
                    }
                    return item;
                });
                setData(updatedData);
            }
            setPreviousData(searchTerm.value);
          }
        }
    fetchDataProduct();
  }, [searchTerm?.value]);

  const decreaseCantidad = (targetItem) => {
    setData(prevData =>
      prevData.map(item =>
        item.codigo === targetItem.codigo
          ? { ...item, cantidad: Math.max(1, item.cantidad - 1) }
          : item
      )
    );
  };


  const calcularCosto = () => {
    if (data) {
        let costo_aux = 0.0;
        for(let i = 0; i < data.length; i++){
            costo_aux += data[i].precio * data[i].cantidad;
        }
        return costo_aux;
    }
}

  const increaseCantidad = (targetItem) => {
    setData(prevData =>
      prevData.map(item =>
        item.codigo === targetItem.codigo && item.inventario > item.cantidad
          ? { ...item, cantidad: Math.max(0, item.cantidad + 1) }
          : item
      )
    );
  };

  const columns = [
    { name: 'Producto', selector: (row) => row.nombre },
    { name: 'Cantidad', selector: (row) => row.cantidad, cell: (row) =>
        <div>
            <button style={{backgroundColor: 'white', color: 'gray', fontSize: '150%', fontWeight: 'bolder', borderColor: 'white'}} onClick={() => decreaseCantidad(row)}>-</button>{row.cantidad} 
            <button style={{backgroundColor: 'white', color: 'gray', fontSize: '150%', fontWeight: 'bolder', borderColor: 'white'}} onClick={() => increaseCantidad(row)}>+</button>
        </div>
    },
    { name: 'Precio', selector: (row) => row.precio },
    { name: 'Subtotal', selector: (row) => row.precio * row.cantidad },
    {
      name: '',
      cell: (row) => (
        <div style={{maxHeight: '1%', marginBottom: '10%'}}> 
          <img src={papelera} style={{maxHeight: '1%', maxWidth: '10%', marginTop: '0% '}} alt="Delete" onClick={() => removeItem(row.codigo)} /> 
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
    <Toaster/>
    <div>
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
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
        <button id='cancelButton' onClick={() => handleCobrar()} style={{minWidth: '10%', fontSize: '115%'}}>Cobrar</button>
        <button id='cancelButton' onClick={() => cancelarPventa()} style={{marginRight: '70%', backgroundColor: '#D9D9D9', color: '#CD1C18',minWidth: '10%'}}>Cancelar</button>
        <p style={{color: 'black', fontSize: "150%", marginTop: '1%'}}>Total:      ${calcularCosto()}</p>
      </div>
    {openModal && <CobrarModal closeModal={() => setOpenModal(false)} data={data}/>}
    {confirmacionModal && <ConfirmacionModal closeModal={() => setConfirmacionModal(false)}/>}

      
    </div>
    </>
  );
  
}

DataTableComponent.propTypes = {
  searchTerm: PropTypes.string.isRequired,
};

export default DataTableComponent;