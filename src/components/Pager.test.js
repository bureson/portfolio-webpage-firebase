import React from 'react';
import { shallow } from 'enzyme';

import Pager from './Pager';

describe('component/pager', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<Pager itemsCount={20} currentPage={2} perPage={5} />);
    expect(wrapper.find('li')).toHaveLength(6);
    expect(Number(wrapper.find('li.active button').text())).toBe(3);
  });

  it('updates active page', () => {
    const wrapper = shallow(<Pager itemsCount={20} currentPage={2} perPage={5} />);
    wrapper.setProps({currentPage: 3});
    expect(Number(wrapper.find('li.active button').text())).toBe(4);
  });

  it('updates pages count', () => {
    const wrapper = shallow(<Pager itemsCount={100} currentPage={2} perPage={5} />);
    wrapper.setProps({itemsCount: 30});
    expect(wrapper.find('li')).toHaveLength(8);
  });

  it('navigates', () => {
    const onPageChange = jest.fn();
    const clickEv = {preventDefault: () => {}};
    const wrapper = shallow(<Pager itemsCount={20} currentPage={1} perPage={5} onPageChange={onPageChange}/>);

    wrapper.find('li.active button').simulate('click', clickEv);
    expect(onPageChange).toHaveBeenLastCalledWith(clickEv, 1);

    wrapper.find('li').first().find('button').simulate('click', clickEv);
    expect(onPageChange).toHaveBeenLastCalledWith(clickEv, 0);

    wrapper.find('li').last().find('button').simulate('click', clickEv);
    expect(onPageChange).toHaveBeenLastCalledWith(clickEv, 3);
  });
});
