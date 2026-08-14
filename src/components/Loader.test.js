import React from 'react';
import { render } from '@testing-library/react';

import Loader from './Loader';

describe('component/Loader', () => {
  it('renders without crashing', () => {
    render(<Loader />);
  });
});
