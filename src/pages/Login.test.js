import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import Login from './Login';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn()
}));

const { signInWithPopup, GoogleAuthProvider } = require('firebase/auth');

describe('page/Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs in with Google and redirects home', async () => {
    signInWithPopup.mockResolvedValue({});
    const history = { push: jest.fn() };

    render(<Login history={history} />);
    fireEvent.click(screen.getByRole('button', { name: /log in with google/i }));

    await waitFor(() => expect(history.push).toHaveBeenCalledWith('/'));
    expect(GoogleAuthProvider).toHaveBeenCalledTimes(1);
    expect(signInWithPopup).toHaveBeenCalledWith(undefined, GoogleAuthProvider.mock.instances[0]);
  });

  it('shows the error message on failure', async () => {
    signInWithPopup.mockRejectedValue({ message: 'rejected' });
    const history = { push: jest.fn() };

    render(<Login history={history} />);
    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('rejected')).toBeInTheDocument();
    expect(history.push).not.toHaveBeenCalled();
  });

  it('does not render email or password fields', () => {
    render(<Login history={{ push: jest.fn() }} />);

    expect(screen.queryByLabelText('E-mail')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  });
});
