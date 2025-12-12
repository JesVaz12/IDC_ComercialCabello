import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import axios from 'axios';

const Checkbox = ({ children, ...props }) => (
  <label style={{ marginRight: '1em' }}>
    <input type="checkbox" {...props} />
    {children}
  </label>
);

Checkbox.propTypes = {
  children: PropTypes.node.isRequired,
};


function AddProduct({ onProductSelect }) {
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isRtl, setIsRtl] = useState(false);
  const [options, setOptions] = useState([]);
  const selectInputRef = useRef();
  const [searchInput, setSearchInput] = useState('');

  const onClear = () => {
    selectInputRef.current.clearValue();
  };

  const handleSelectChange = (option) => {
    setSelectedOption(null);
    if (onProductSelect) {
      onProductSelect(option);
    }
  };

  const handleProductSelect = (selectedOption) => {
    this.setSelectedOption(selectedOption);
    console.log("Selected from AddProduct:", selectedOption);
  };

  useEffect(() => {
    async function fetchAllRecords() {
      setIsLoading(true);
      try {
        const response = await axios.get('http://alb-comercial-2000369602.us-east-2.elb.amazonaws.com/dataPventa');

        const formattedOptions = response.data.map(item => ({
          value: item.codigo,
          label: item.nombre + ' -  ' + item.codigo,
        }));

        setOptions(formattedOptions);
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllRecords();
  }, []);


  return (
    <>
      <Select
        className="basic-single"
        classNamePrefix="select"
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable={isClearable}
        isRtl={isRtl}
        inputValue={searchInput}
        onInputChange={(inputValue, { action }) => {
          if (action === 'input-change') {
            const sanitizedInput = inputValue.replace(/[^a-zA-Z0-9 ]/g, '');

            if (sanitizedInput.length <= 35) {
              setSearchInput(sanitizedInput);
            }
          }
        }}
        noOptionsMessage={() => 'Producto no disponible'}
        onBlur={() => setSearchInput('')}
        hideSelectedOptions={false}
        placeholder="Nombre o código del producto"
        isSearchable={isSearchable}
        onChange={handleSelectChange}
        name="producto"
        value={selectedOption}
        options={options}
        styles={{
          container: (base) => ({
            ...base,
            width: 350,
          }),
          control: (base) => ({
            ...base,
            backgroundColor: 'white',
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: 'white',
            zIndex: 100,
            color: 'black',
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#9B1313' : 'white',
            color: state.isFocused ? 'white' : 'black',
            fontWeight: state.isSelected ? 'bold' : 'normal',
            fontSize: '1rem',
          }),
          singleValue: (base) => ({
            ...base,
            color: '#CD1C18',
            fontWeight: 'bold',
          }),
        }}
        theme={(theme) => ({
          ...theme,
          borderRadius: 0,
          colors: {
            ...theme.colors,
            primary25: '#FFA896',
            primary: 'white',
          },
        })}
      />

      <div
        style={{
          color: 'hsl(0, 0%, 40%)',
          display: 'inline-block',
          fontSize: 12,
          fontStyle: 'italic',
          marginTop: '1em',
          backgroundColor: 'black'

        }}
      >
      </div>
    </>
  );
}


AddProduct.propTypes = {
  onProductSelect: PropTypes.func,
};

export default AddProduct;
