import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login/Login.jsx';
import axios from 'axios';

// 1. Simula (mock) el módulo de axios
vi.mock('axios');

describe('Login Component', () => {

  beforeEach(() => {
    // 2. Simula un fallo en la llamada GET.
    // Esto forzará al componente a poner showLogin = true.
    axios.get.mockRejectedValue(new Error('No autenticado'));

    // 3. Renderiza el componente UNA SOLA VEZ antes de cada prueba
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  });

  afterEach(() => {
    // 4. Limpia el DOM después de cada prueba
    cleanup();
  });

  it('debería renderizar el campo de usuario', async () => {
    // 5. Usa "findBy..." (asíncrono) para esperar a que aparezca el formulario
    const userInput = await screen.findByLabelText(/Usuario/i);
    expect(userInput).toBeInTheDocument();
  });

  it('debería renderizar el campo de contraseña', async () => {
    const passwordInput = await screen.findByLabelText(/Contraseña/i);
    expect(passwordInput).toBeInTheDocument();
  });

  it('debería renderizar el botón de ingresar', async () => {
    // 6. Ahora que el renderizado está limpio, findByRole solo encontrará UN botón
    const button = await screen.findByRole('button', { name: /INGRESAR/i });
    expect(button).toBeInTheDocument();
  });
});