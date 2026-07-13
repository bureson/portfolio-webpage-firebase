import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Menu from './Menu';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signOut: jest.fn()
}));

const { signOut } = require('firebase/auth');

describe('component/Menu', () => {
  it('renders without crashing when not authed', () => {
    render(<MemoryRouter><Menu authed={false} /></MemoryRouter>);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.queryByText('log out')).not.toBeInTheDocument();
  });

  it('renders the log out link when authed and signs out on click', () => {
    render(<MemoryRouter><Menu authed={true} /></MemoryRouter>);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    fireEvent.click(screen.getByText('log out'));
    expect(signOut).toHaveBeenCalled();
  });
});
