import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login/Login.jsx';

describe('Login Component', () => {
  it('debería renderizar el campo de usuario', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const userInput = await screen.findByText(/Usuario/i);
    expect(userInput).toBeInTheDocument();
  });

  it('debería renderizar el botón de ingresar', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const button = await screen.findByRole('button', { name: /ingresar/i });
    expect(button).toBeInTheDocument();
  });

  it('debería renderizar el campo de contraseña', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    // CORRECCIÓN: Busca "contraseña" con 'c' minúscula
    const passwordInput = await screen.findByText(/contraseña/i);
    expect(passwordInput).toBeInTheDocument();
  });
});