import React, { Component } from 'react';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

import AddCountry from './AddCountry';
import AddPost from './AddPost';
import AddWord from './AddWord';
import Blog from './Blog';
import Countries from './Countries';
import CountryDetail from './CountryDetail';
import Course from './Course';
import { definition } from '../lib/CourseModel';
import Home from './Home';
import Login from './Login';
import Menu from '../components/Menu';
import NoMatch from '../components/NoMatch';
import Post from './Post';
import Practice from './Practice';

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
    const defaultCourse = Object.keys(definition).find(key => definition[key].default);
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
          <Route exact path='/course' render={() => <Redirect to={`/course/${defaultCourse}`} />} />
          <Route exact path='/course/:language' render={(props) => <Course {...props} authed={this.state.authed}/>} />
          <Route exact path='/course/:language/add' render={(props) => <AddWord {...props} authed={this.state.authed}/>} />
          <Route exact path='/course/:language/practice' render={(props) => <Practice {...props} authed={this.state.authed}/>} />
          <Route exact path='/blog' render={(props) => <Blog {...props} authed={this.state.authed}/>} />
          <Route exact path='/blog/add' render={(props) => <AddPost {...props} authed={this.state.authed}/>} />
          <Route exact path='/blog/:post' render={(props) => <Post {...props} authed={this.state.authed}/>} />
          <Route exact path='/blog/:post/edit' render={(props) => <AddPost {...props} authed={this.state.authed}/>} />
          <Route exact path='/login' component={Login} />
          <Route component={NoMatch} />
        </Switch>
      </div>
    )
  }
}

export default Index;
