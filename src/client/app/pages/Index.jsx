import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import firebase from 'firebase';

import Add from '../components/Add';
import Course from './Course';
import Home from './Home';
import Login from '../components/Login';
import Menu from '../components/Menu';

class Index extends Component {

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
      <div className='container'>
        <h1><span>O</span>ndrej <span>B</span>ures portfolio page</h1>
        <Menu authed={this.state.authed} />
        {this.state.authed && <p>User logged: {this.state.user}</p>}
        <Route exact path={this.props.match.path} component={Home} />
        <Route path='/course' component={Course} />
        <Route path='/add' component={Add} />
        <Route path='/login' component={Login} />
      </div>
    )
  }
}

export default Index;
