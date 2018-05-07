import React from 'react';
import { shallow } from 'enzyme';

import Home from './Home';

describe('component/Home', () => {
  it('renders without crashing', () => {
    shallow(<Home />);
  });
});
