import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login/Login.jsx';

describe('Login Component', () => {
  it('debería renderizar el campo de usuario', async () => { // <--- 1. Añadimos 'async' aquí
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // 2. Cambiamos 'getByText' por 'await screen.findByText'
    const userInput = await screen.findByText(/Usuario/i);

    expect(userInput).toBeInTheDocument();
  });
});