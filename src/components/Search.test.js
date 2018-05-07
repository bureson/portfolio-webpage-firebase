import React from 'react';
import { shallow } from 'enzyme';

import Search from './Search';

describe('component/Search', () => {
  it('renders without crashing', () => {
    const onChange = jest.fn(() => {});
    const event = {target: {value: 'phrase'}};
    const wrapper = shallow(<Search value={''} onChange={onChange} />);
    wrapper.find('input').simulate('change', event);
    expect(onChange).toHaveBeenCalledWith(event);
  });
});
