import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Menu from './Menu';

describe('component/Menu', () => {
  it('renders without crashing when not authed', () => {
    render(<MemoryRouter><Menu authed={false} /></MemoryRouter>);
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('flights')).toBeInTheDocument();
    expect(screen.getByText('projects')).toBeInTheDocument();
  });

  it('renders the flights link when authed', () => {
    render(<MemoryRouter><Menu authed={true} /></MemoryRouter>);
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('flights')).toBeInTheDocument();
  });
});
