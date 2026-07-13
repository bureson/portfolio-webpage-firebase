import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Home from './Home';

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
  ref: jest.fn(),
  onValue: jest.fn()
}));

const { ref, onValue } = require('firebase/database');

describe('pages/Home', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the hero and cards from firebase data', () => {
    const data = {
      danish: {
        w1: { original: 'overskud', prons: 'ˈɒwɐsɡuð', means: 'surplus', timestamp: 2 },
        w2: { original: 'hygge', means: 'cosiness', timestamp: 1 }
      },
      country: {
        'czech-republic': { name: 'Czech Republic', iso: 'cz', date: 2, photoPath: 'cz.jpg' },
        denmark: { name: 'Denmark', iso: 'dk', date: 1, photoPath: 'dk.jpg' }
      },
      blog: {
        p1: { title: 'Public story', timestamp: 1, public: true, body: 'word '.repeat(400) },
        p2: { title: 'Private draft', timestamp: 2, public: false, body: 'short' }
      }
    };
    jest.spyOn(Math, 'random').mockReturnValue(0);
    ref.mockImplementation((db, path) => path);
    onValue.mockImplementation((path, callback) => callback({ val: () => data[path] }));

    render(<MemoryRouter><Home /></MemoryRouter>);

    expect(screen.getByText(/I build software/)).toBeInTheDocument();
    expect(screen.getByText('overskud')).toBeInTheDocument();
    expect(screen.getByText('Countries (2)')).toBeInTheDocument();
    expect(screen.getByText('Czech Republic')).toBeInTheDocument();
    expect(screen.getByText('Blog (1)')).toBeInTheDocument();
    expect(screen.getByText('Public story')).toBeInTheDocument();
    expect(screen.getByText(/~2 min read/)).toBeInTheDocument();
    expect(screen.queryByText('Private draft')).not.toBeInTheDocument();
  });

  it('renders loaders while data is loading', () => {
    onValue.mockImplementation(() => {});

    render(<MemoryRouter><Home /></MemoryRouter>);

    expect(screen.getByText(/I build software/)).toBeInTheDocument();
  });
});
