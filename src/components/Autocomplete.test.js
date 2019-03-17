import React from 'react';
import { shallow } from 'enzyme';
import firebase from 'firebase/app';

import Autocomplete from './Autocomplete';

describe('component/Autocomplete', () => {
  beforeAll(() => {
    firebase.database = jest.fn(() => ({
      ref: jest.fn(() => ({
        push: jest.fn(() => ({
          catch: jest.fn()
        }))
      }))
    }));
    Object.defineProperty(window, 'google', {
      writable: true,
      value: {
        maps: {
          places: {
            Autocomplete: jest.fn(() => ({
              addListener: jest.fn(() => ({
                remove: jest.fn()
              }))
            }))
          }
        }
      }
    });
  });

  it('renders without crashing', () => {
    const wrapper = shallow(<Autocomplete />);
    wrapper.find('input[type="date"]').simulate('change', {target: {value: '2018-05-10'}});
    wrapper.find('button').simulate('click', {});
    wrapper.unmount();
  });
});
