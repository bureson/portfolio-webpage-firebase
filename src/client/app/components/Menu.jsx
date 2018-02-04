import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import firebase from 'firebase';

class Menu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    }
  }

  toggleMenu = (e) => {
    e.preventDefault();
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  navigate = (e, route) => {
    this.setState({
      isOpen: false
    });
  }

  onLogout = (e) => {
    firebase.auth().signOut();
    this.setState({
      isOpen: false
    });
  }

  render = () => {
    return (
      <nav className={this.state.isOpen ? 'open' : 'closed'}>
        <a href='#' className='hamburger' onClick={e => this.toggleMenu(e)}>
          <div></div>
          <div></div>
          <div></div>
        </a>
        <ul>
          <li><Link to='/course' onClick={e => this.navigate(e)}>Course</Link></li>
          {this.props.authed &&<li><Link to='/countries' onClick={e => this.navigate(e)}>Countries</Link></li>}
          <li><a href='#'><i className="fas fa-user-circle"></i></a>
            <ul>
              {!this.props.authed && <li><Link to='/login' onClick={e => this.navigate(e)}>Login</Link></li>}
              {this.props.authed && <li><Link to='/' onClick={e => this.onLogout(e)}>Log out ({this.props.user.email})</Link></li>}
            </ul>
          </li>
        </ul>
      </nav>
    )
  }

}

export default withRouter(Menu);
