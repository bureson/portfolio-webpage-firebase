import React, { Component } from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import firebase from 'firebase';

import AddCountry from './AddCountry';
import AddWord from './AddWord';
import Countries from './Countries';
import Course from './Course';
import Home from './Home';
import Login from './Login';
import Menu from '../components/Menu';
import NoMatch from '../components/NoMatch';
import CountryDetail from './CountryDetail';

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
        <Switch>
          <Route exact path={this.props.match.path} component={Home} />
          <Route exact path='/countries' render={(props) => <Countries {...props} authed={this.state.authed}/>} />
          <Route exact path='/countries/add' render={(props) => <AddCountry {...props} authed={this.state.authed}/>} />
          <Route exact path='/countries/:country' render={(props) => <CountryDetail {...props} authed={this.state.authed}/>} />
          <Route exact path='/countries/:country/edit' render={(props) => <AddCountry {...props} authed={this.state.authed}/>} />
          <Route exact path='/course' render={(props) => <Course {...props} authed={this.state.authed}/>} />
          <Route exact path='/course/add' render={(props) => <AddWord {...props} authed={this.state.authed}/>} />
          <Route exact path='/login' component={Login} />
          <Route component={NoMatch} />
        </Switch>
      </div>
    )
  }
}

export default Index;
