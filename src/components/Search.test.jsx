import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import Search from './Search';

describe('component/Search', () => {
  it('passes typing through to onChange', () => {
    // the input is controlled, so the typed value is only visible inside the handler
    const seen = [];
    const onChange = vi.fn(e => seen.push(e.target.value));
    render(<Search value='' onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText('Type to search ...'), { target: { value: 'phrase' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(seen).toEqual(['phrase']);
  });
});
