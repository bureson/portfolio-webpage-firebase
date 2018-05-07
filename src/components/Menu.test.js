import React from 'react';
import { shallow } from 'enzyme';
import firebase from 'firebase';

import Menu from './Menu';

describe('component/Menu', () => {
  it('renders without crashing when not authed', () => {
    const wrapper = shallow(<Menu authed={false} />);
    expect(wrapper.find('ul li')).toHaveLength(3);
    wrapper.find('ul li').forEach(li => li.find('Link').simulate('click'));
  });

  it('renders without crashing when authed', () => {
    const signOut = jest.fn();
    firebase.auth = jest.fn(() => ({signOut}));
    const wrapper = shallow(<Menu authed={true} />);
    expect(wrapper.find('ul li')).toHaveLength(4);
    wrapper.find('ul li').last().find('Link').simulate('click');
    expect(signOut).toHaveBeenCalled();
  });

  it('toggles the menu', () => {
    const event = {preventDefault: jest.fn()};
    const wrapper = shallow(<Menu authed={false} />);
    expect(wrapper.state().isOpen).toBe(false);
    wrapper.find('.hamburger').simulate('click', event);
    expect(wrapper.state().isOpen).toBe(true);
    wrapper.find('ul li').first().find('Link').simulate('click', event);
    expect(wrapper.state().isOpen).toBe(false);
  });
});
