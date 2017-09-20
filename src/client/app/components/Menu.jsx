import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from 'firebase';

class Menu extends Component {

  onLogout = (e) => {
    e.preventDefault();
    firebase.auth().signOut();
    this.props.history.push('/');
  }

  render = () => {
    return (
      <nav>
        <ul className="nav nav-pills">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/course">Course</Link></li>
          {this.props.authed && <li><Link to="/add">Add new</Link></li>}
          {!this.props.authed && <li><Link to="/login">Login</Link></li>}
          {this.props.authed && <li><a href="#" onClick={e => this.onLogout(e)}>Log out</a></li>}
        </ul>
      </nav>
    )
  }

}

export default withRouter(Menu);
