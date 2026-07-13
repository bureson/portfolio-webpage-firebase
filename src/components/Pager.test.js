import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import Pager from './Pager';

const pageLabels = () => screen.getAllByRole('listitem').map(li => li.textContent);

describe('component/Pager', () => {
  it('renders all pages when there are few', () => {
    render(<Pager itemsCount={20} currentPage={2} perPage={5} />);
    expect(pageLabels()).toEqual(['<', '1', '2', '3', '4', '>']);
    expect(screen.getByText('3').closest('li')).toHaveClass('active');
  });

  it('collapses trailing pages into dots', () => {
    render(<Pager itemsCount={100} currentPage={0} perPage={5} />);
    expect(pageLabels()).toEqual(['<', '1', '2', '3', '4', '…', '20', '>']);
  });

  it('shows dots on both sides in the middle', () => {
    render(<Pager itemsCount={100} currentPage={9} perPage={5} />);
    expect(pageLabels()).toEqual(['<', '1', '…', '9', '10', '11', '…', '20', '>']);
  });

  it('collapses leading pages into dots near the end', () => {
    render(<Pager itemsCount={100} currentPage={19} perPage={5} />);
    expect(pageLabels()).toEqual(['<', '1', '…', '17', '18', '19', '20', '>']);
  });

  it('updates active page', () => {
    const { rerender } = render(<Pager itemsCount={20} currentPage={2} perPage={5} />);
    rerender(<Pager itemsCount={20} currentPage={3} perPage={5} />);
    expect(screen.getByText('4').closest('li')).toHaveClass('active');
  });

  it('navigates', () => {
    const onPageChange = jest.fn();
    render(<Pager itemsCount={20} currentPage={1} perPage={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByText('2'));
    expect(onPageChange).toHaveBeenLastCalledWith(expect.anything(), 1);

    fireEvent.click(screen.getByText('<'));
    expect(onPageChange).toHaveBeenLastCalledWith(expect.anything(), 0);

    fireEvent.click(screen.getByText('>'));
    expect(onPageChange).toHaveBeenLastCalledWith(expect.anything(), 2);
  });

  it('disables prev on the first page and next on the last', () => {
    render(<Pager itemsCount={100} currentPage={0} perPage={5} />);
    expect(screen.getByText('<')).toBeDisabled();
    expect(screen.getByText('>')).not.toBeDisabled();
  });
});
