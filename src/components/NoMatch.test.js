import React from 'react';
import { shallow } from 'enzyme';

import NoMatch from './NoMatch';

describe('component/NoMatch', () => {
  it('renders without crashing', () => {
    shallow(<NoMatch />);
  });
});
