import React, { useState, useEffect } from 'react';

const Reloj = () => {
  const [hora, setHora] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setHora(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  // Opciones para formatear la hora en una sola línea (ej: 9:25:05 PM)
  const opcionesDeFormato = {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };

  return (
    // Usamos un div en lugar de <p> para mejor control de estilos
    <div>
      {/* Añadimos una etiqueta y luego la hora ya formateada */}
      Hora Local: {hora.toLocaleTimeString('es-MX', opcionesDeFormato)}
    </div>
  );
};

export default Reloj;