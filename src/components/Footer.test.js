import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import Footer from './Footer';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signOut: jest.fn()
}));

const { signOut } = require('firebase/auth');

describe('component/Footer', () => {
  it('renders without the log out button when not authed', () => {
    render(<Footer authed={false} />);
    expect(screen.queryByText('log out')).not.toBeInTheDocument();
  });

  it('renders the log out button when authed and signs out on click', () => {
    render(<Footer authed={true} />);
    fireEvent.click(screen.getByText('log out'));
    expect(signOut).toHaveBeenCalled();
  });
});
