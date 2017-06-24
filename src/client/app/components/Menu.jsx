import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router-dom';

class Menu extends Component {

  onLogout = (e) => {
    e.preventDefault();
    firebase.auth().signOut();
    browserHistory.push("/");
  }

  render = () => {
    return (
      <ul className="nav nav-pills">
        <li><Link to="/">Home</Link></li>
        {!this.props.authed && <li><Link to="/login">Login</Link></li>}
        {this.props.authed && <li><Link to="/add">Add new</Link></li>}
        {this.props.authed && <li><a href="#" onClick={e => this.onLogout(e)}>Log out</a></li>}
      </ul>
    )
  }

}

export default Menu;
