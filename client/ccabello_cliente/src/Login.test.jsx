import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login/Login.jsx';

describe('Login Component', () => {
  it('debería renderizar el campo de usuario', () => {
    // Renderizamos el componente "en memoria" para la prueba
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Buscamos si el texto "Usuario" existe en el componente
    const userInput = screen.getByText(/Usuario/i);

    // Esperamos que el elemento exista
    expect(userInput).toBeInTheDocument();
  });
});
