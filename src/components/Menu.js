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
        <button className='hamburger' onClick={e => this.toggleMenu(e)}>
          <div></div>
          <div></div>
          <div></div>
        </button>
        <ul>
          <li><Link to='/course' onClick={e => this.navigate(e)}>Course</Link></li>
          <li><Link to='/countries' onClick={e => this.navigate(e)}>Countries</Link></li>
          {this.props.authed && <li><Link to='/' onClick={e => this.onLogout(e)}>Log out</Link></li>}
        </ul>
      </nav>
    )
  }

}

export default withRouter(Menu);
