import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAuth, signOut } from 'firebase/auth';
import { faLanguage, faMap, faNewspaper, faSignOutAlt } from '@fortawesome/fontawesome-free-solid';

class Menu extends Component {

  onLogout = (e) => {
    const auth = getAuth();
    signOut(auth);
  }

  isActive = (prefix) => {
    const path = this.props.location.pathname;
    return path === prefix || path.startsWith(`${prefix}/`) ? 'active' : '';
  }

  render = () => {
    return (
      <nav>
          <ul className='main-nav'>
              <li>
                  <Link className={this.isActive('/course')} to='/course'>
                      <FontAwesomeIcon icon={faLanguage} className='responsive-placeholder' />
                      <span>course</span>
                  </Link>
              </li>
              <li>
                  <Link className={this.isActive('/countries')} to='/countries'>
                      <FontAwesomeIcon icon={faMap} className='responsive-placeholder' />
                      <span>countries</span>
                  </Link>
              </li>
              <li>
                  <Link className={this.isActive('/blog')} to='/blog'>
                      <FontAwesomeIcon icon={faNewspaper} className='responsive-placeholder' />
                      <span>blog</span>
                  </Link>
              </li>
              {this.props.authed && <li>
                  <Link to='/' onClick={this.onLogout}>
                      <FontAwesomeIcon icon={faSignOutAlt} className='responsive-placeholder' />
                      <span className='plain'>log out</span>
                  </Link>
              </li>}
          </ul>
      </nav>
    )
  }

}

export default withRouter(Menu);
