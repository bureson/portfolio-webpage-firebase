import React from 'react';
import { render, screen } from '@testing-library/react';

import NoMatch from './NoMatch';

describe('component/NoMatch', () => {
  it('renders the message and marks the page noindex while mounted', () => {
    const { unmount } = render(<NoMatch />);
    expect(screen.getByText('Oopsie!')).toBeInTheDocument();
    expect(document.title).toBe('Not found | Ondrej Bures');
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex');

    unmount();
    expect(document.querySelector('meta[name="robots"]')).toBeNull();
  });
});
