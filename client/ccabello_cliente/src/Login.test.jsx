import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login/Login.jsx';

describe('Login Component', () => {
  // Función helper para renderizar el componente antes de cada prueba
  const setup = () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  };

  it('debería renderizar el campo de usuario', () => {
    setup();
    // CORREGIDO: Usamos getByLabelText para ser más específicos
    const userInput = screen.getByLabelText(/Usuario/i);
    expect(userInput).toBeInTheDocument();
  });

  it('debería renderizar el campo de contraseña', () => {
    setup();
    // PERFECTO: Esta es la corrección que hiciste
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    expect(passwordInput).toBeInTheDocument();
  });

  it('debería renderizar el botón de ingresar', () => {
    setup();
    // BIEN: getByRole también es una excelente forma de seleccionar
    const button = screen.getByRole('button', { name: /INGRESAR/i });
    expect(button).toBeInTheDocument();
  });
});