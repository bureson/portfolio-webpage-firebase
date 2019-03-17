import React from 'react';
import { shallow } from 'enzyme';
import firebase from 'firebase/app';

import Login from './Login';

describe('page/Login', () => {
  it('renders submits the form', async () => {
    const signInWithEmailAndPassword = jest.fn(() => Promise.resolve());
    firebase.auth = jest.fn(() => ({signInWithEmailAndPassword}));
    const history = {
      push: jest.fn()
    };
    const wrapper = shallow(<Login history={history} />);
    wrapper.find('#email').simulate('change', {target: {value: 'some@email.com'}});
    wrapper.find('#password').simulate('change', {target: {value: 'strongPassword'}});
    await wrapper.find('form').simulate('submit', {preventDefault: jest.fn()});
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith('some@email.com', 'strongPassword');
    expect(history.push).toHaveBeenCalledWith('/');
  });

  it('handles error', async () => {
    const history = {
      push: jest.fn()
    };
    firebase.auth = jest.fn(() => ({
      signInWithEmailAndPassword: jest.fn(() => Promise.reject(new Error('rejected')))
    }));
    const wrapper = shallow(<Login history={history} />);
    await wrapper.find('form').simulate('submit', {preventDefault: jest.fn()});
    // Note: for some reason resolve() can be awaited, but reject() not
  })
});
