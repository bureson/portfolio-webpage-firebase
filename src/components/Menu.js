import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLanguage, faMap, faNewspaper, faPlane } from '@fortawesome/free-solid-svg-icons';

class Menu extends Component {

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
                  <Link className={this.isActive('/flights')} to='/flights'>
                      <FontAwesomeIcon icon={faPlane} className='responsive-placeholder' />
                      <span>flights</span>
                  </Link>
              </li>
              <li>
                  <Link className={this.isActive('/blog')} to='/blog'>
                      <FontAwesomeIcon icon={faNewspaper} className='responsive-placeholder' />
                      <span>blog</span>
                  </Link>
              </li>
          </ul>
      </nav>
    )
  }

}

export default withRouter(Menu);
