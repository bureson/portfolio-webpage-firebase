import React, { Component } from 'react';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/fontawesome-free-solid';

import AddCountry from './AddCountry';
import AddPost from './AddPost';
import Blog from './Blog';
import Countries from './Countries';
import CountryDetail from './CountryDetail';
import Course from './Course';
import { definition } from '../lib/CourseModel';
import GalaxyFlight from '../components/GalaxyFlight';
import Home from './Home';
import Login from './Login';
import Menu from '../components/Menu';
import NoMatch from '../components/NoMatch';
// import Starscape from '../components/Starscape';
import Post from './Post';

class Index extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: false
    }
  }

  componentDidMount = () => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
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
    });
  }

  render = () => {
    const defaultCourse = Object.keys(definition).find(key => definition[key].default);
    return (
      <GalaxyFlight>
        <div className='container'>
          <div className='navigation'>
            <Link className='home-link' to='/'>
              <FontAwesomeIcon icon={faHome} className='responsive-placeholder' />
              <h1>Ondrej Bures</h1>
            </Link>
            <Menu authed={this.state.authed} user={this.state.user} />
          </div>
          <div className='content'>
            <Switch>
              <Route exact path={this.props.match.path} component={Home} />
              <Route exact path='/countries' render={(props) => <Countries {...props} authed={this.state.authed}/>} />
              <Route exact path='/countries/add' render={(props) => <AddCountry {...props} authed={this.state.authed}/>} />
              <Route exact path='/countries/:country' render={(props) => <CountryDetail {...props} authed={this.state.authed}/>} />
              <Route exact path='/countries/:country/edit' render={(props) => <AddCountry {...props} authed={this.state.authed}/>} />
              <Route exact path='/course' render={() => <Redirect to={`/course/${defaultCourse}`} />} />
              <Route exact path='/course/:language' render={(props) => <Course {...props} authed={this.state.authed}/>} />
              <Route exact path='/course/:language/add' render={(props) => <Course {...props} authed={this.state.authed}/>} />
              <Route exact path='/course/:language/edit/:key' render={(props) => <Course {...props} authed={this.state.authed}/>} />
              <Route exact path='/course/:language/practice' render={(props) => <Course {...props} authed={this.state.authed}/>} />
              <Route exact path='/blog' render={(props) => <Blog {...props} authed={this.state.authed}/>} />
              <Route exact path='/blog/add' render={(props) => <AddPost {...props} authed={this.state.authed}/>} />
              <Route exact path='/blog/:post' render={(props) => <Post {...props} authed={this.state.authed}/>} />
              <Route exact path='/blog/:post/edit' render={(props) => <AddPost {...props} authed={this.state.authed}/>} />
              <Route exact path='/login' component={Login} />
              <Route component={NoMatch} />
            </Switch>
          </div>
        </div>
      </GalaxyFlight>
    )
  }
}

export default Index;
