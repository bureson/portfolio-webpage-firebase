import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import Login from './Login';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn()
}));

const { signInWithEmailAndPassword } = require('firebase/auth');

describe('page/Login', () => {
  it('submits the form and redirects home', async () => {
    signInWithEmailAndPassword.mockResolvedValue({});
    const history = { push: jest.fn() };

    render(<Login history={history} />);
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'some@email.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'strongPassword' } });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(history.push).toHaveBeenCalledWith('/'));
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(undefined, 'some@email.com', 'strongPassword');
  });

  it('shows the error message on failure', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ message: 'rejected' });
    const history = { push: jest.fn() };

    render(<Login history={history} />);
    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('rejected')).toBeInTheDocument();
    expect(history.push).not.toHaveBeenCalled();
  });
});
