import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';
import firebase from 'firebase';

import AddCountry from './AddCountry';
import AddWord from './AddWord';
import Countries from './Countries';
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
          user: user
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
        <div className='header'>
          <Link to='/'>
            <h1>Ondrej Bures</h1>
          </Link>
          <Menu authed={this.state.authed} user={this.state.user} />
        </div>
        <Route exact path={this.props.match.path} component={Home} />
        <Route path='/countries' render={(props) => <Countries {...props} authed={this.state.authed}/>} />
        <Route path='/add-country' render={(props) => <AddCountry {...props} authed={this.state.authed}/>} />
        <Route path='/course' render={(props) => <Course {...props} authed={this.state.authed}/>} />
        <Route path='/add-phrase' component={AddWord} />
        <Route path='/login' component={Login} />
      </div>
    )
  }
}

export default Index;
