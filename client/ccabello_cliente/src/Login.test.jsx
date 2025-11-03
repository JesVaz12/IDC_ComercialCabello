import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login/Login.jsx';
import axios from 'axios';

// 1. Simula (mock) el módulo de axios
vi.mock('axios');

describe('Login Component', () => {
  beforeEach(() => {
    // 2. Antes de cada prueba, simula un fallo en la llamada GET.
    // Esto forzará al componente a poner showLogin = true.
    axios.get.mockRejectedValue(new Error('No autenticado'));
  });

  it('debería renderizar el campo de usuario', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // 3. Usa "findBy..." (asíncrono) para esperar a que aparezca el formulario
    const userInput = await screen.findByLabelText(/Usuario/i);
    expect(userInput).toBeInTheDocument();
  });

  it('debería renderizar el campo de contraseña', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // 4. Usa "findBy..." (asíncrono)
    const passwordInput = await screen.findByLabelText(/Contraseña/i);
    expect(passwordInput).toBeInTheDocument();
  });

  it('debería renderizar el botón de ingresar', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // 5. Usa "findBy..." (asíncrono)
    const button = screen.getByRole('button', { name: /INGRESAR/i });
    expect(button).toBeInTheDocument();
  });
});