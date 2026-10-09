import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import Login from './Login';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn()
}));

import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

describe('page/Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signs in with Google and redirects home', async () => {
    signInWithPopup.mockResolvedValue({});
    const history = { push: vi.fn() };

    render(<Login history={history} />);
    fireEvent.click(screen.getByRole('button', { name: /log in with google/i }));

    await waitFor(() => expect(history.push).toHaveBeenCalledWith('/'));
    expect(GoogleAuthProvider).toHaveBeenCalledTimes(1);
    expect(signInWithPopup).toHaveBeenCalledWith(undefined, GoogleAuthProvider.mock.instances[0]);
  });

  it('shows the error message on failure', async () => {
    signInWithPopup.mockRejectedValue({ message: 'rejected' });
    const history = { push: vi.fn() };

    render(<Login history={history} />);
    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('rejected')).toBeInTheDocument();
    expect(history.push).not.toHaveBeenCalled();
  });

  it('does not render email or password fields', () => {
    render(<Login history={{ push: vi.fn() }} />);

    expect(screen.queryByLabelText('E-mail')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  });
});
