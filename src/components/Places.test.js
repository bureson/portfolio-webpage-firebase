import React from 'react';
import { shallow } from 'enzyme';
import firebase from 'firebase/app';

import Places from './Places';

describe('component/Places', () => {
  it('handles full scenario', () => {
    const event = {preventDefault: jest.fn()};
    const removeListener = jest.fn();
    const childListener = jest.fn(() => ({
      remove: removeListener
    }));
    const unmountListener = jest.fn();
    const places = {
      1: {
        name: 'Copenhagen',
        date: 1525616662,
        lat: 0,
        lng: 0,
      },
      2: {
        name: 'Odense',
        date: 1494087960,
        lat: 0,
        lng: 0
      }
    };
    firebase.database = jest.fn(() => ({
      ref: jest.fn(() => ({
        child: childListener,
        off: unmountListener,
        orderByChild: jest.fn(() => ({
          equalTo: jest.fn(() => ({
            on: jest.fn((type, fn) => {
              fn({
                val: jest.fn(() => (places))
              });
            })
          }))
        }))
      }))
    }));
    const wrapper = shallow(<Places authed={false} country={'denmark'} />);
    expect(wrapper.find('tr')).toHaveLength(3);
    expect(wrapper.find('tr').last().find('td').last()).not.toContain('button');

    wrapper.setProps({authed: true});

    window.confirm = jest.fn(() => false);
    wrapper.find('tr').last().find('td').last().find('button').simulate('click', event);
    expect(window.confirm).toHaveBeenCalled();
    expect(childListener).not.toHaveBeenCalled();

    window.confirm = jest.fn(() => true);
    wrapper.find('tr').last().find('td').last().find('button').simulate('click', event);
    expect(childListener).toHaveBeenCalledWith('2');
    expect(removeListener).toHaveBeenCalled();

    wrapper.unmount();
    expect(unmountListener).toHaveBeenCalled();
  });

  it('handles no places', () => {
    firebase.database = jest.fn(() => ({
      ref: jest.fn(() => ({
        orderByChild: jest.fn(() => ({
          equalTo: jest.fn(() => ({
            on: jest.fn((type, fn) => {
              fn({
                val: jest.fn(() => null)
              });
            })
          }))
        }))
      }))
    }));
    const wrapper = shallow(<Places authed={false} country={'denmark'} />);
    expect(wrapper.find('tr')).toHaveLength(1);
  });
});
