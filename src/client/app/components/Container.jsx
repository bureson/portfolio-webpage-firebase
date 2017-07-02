import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import firebase from 'firebase';

import Add from './Add';
import Course from './Course';
import Login from './Login';
import Menu from './Menu';

class Container extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: false
    }
  }

  componentDidMount = () => {
    this.removeListener = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          authed: !user.isAnonymous,
          user: user.email
        })
      } else {
        this.setState({
          authed: false
        })
      }
    })
  }

  componentWillUnmount = () => {
    this.removeListener();
  }

  render = () => {
    return (
      <DocumentTitle title='Language course by Ian'>
        <div className='container'>
          <h1>Language course by Ian @ Triggerz</h1>
          <Menu authed={this.state.authed} />
          {this.state.authed && <p>User logged: {this.state.user}</p>}
          <Route exact path={this.props.match.path} component={Course} />
          <Route path='/add' component={Add} />
          <Route path='/login' component={Login} />
        </div>
      </DocumentTitle>
    )
  }
}

export default Container;
