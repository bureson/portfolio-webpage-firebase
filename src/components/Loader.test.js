import React from 'react';
import { shallow } from 'enzyme';

import Loader from './Loader';

describe('component/Loader', () => {
  it('renders without crashing', () => {
    shallow(<Loader />);
  });
});
