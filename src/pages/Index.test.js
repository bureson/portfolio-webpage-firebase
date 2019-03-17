import React from 'react';
import { shallow } from 'enzyme';
import firebase from 'firebase';

import Index from './Index';

describe('pages/Index', () => {
  it('mounts and unmounts firebase', () => {
    const unmounter = jest.fn();
    firebase.auth = jest.fn(() => ({
      onAuthStateChanged: jest.fn((fn) => {
        fn({isAnonymous: false});
        return unmounter;
      })
    }));
    const wrapper = shallow(<Index match={{path: '/'}} />);
    const routeList = wrapper.find('Switch').find('Route');
    expect(routeList).toHaveLength(14);
    routeList.forEach(route => {
      route.props().render && route.props().render();
    });

    expect(wrapper.state().authed).toBe(true);

    expect(unmounter).not.toHaveBeenCalled();
    wrapper.unmount();
    expect(unmounter).toHaveBeenCalled();
  });

  it('handles incorrect auth', () => {
    firebase.auth = jest.fn(() => ({
      onAuthStateChanged: jest.fn((fn) => fn(null))
    }));
    const wrapper = shallow(<Index match={{path: '/'}} />);
    expect(wrapper.state().authed).toBe(false);
  });
});
