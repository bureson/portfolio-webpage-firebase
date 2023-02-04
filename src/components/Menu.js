import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAuth, signOut } from 'firebase/auth';
import { faLanguage, faMap, faNewspaper } from '@fortawesome/fontawesome-free-solid';
import { faFacebookSquare, faInstagram, faLinkedin, faGithubSquare, faGoodreads, faYoutubeSquare } from '@fortawesome/fontawesome-free-brands';

import firebaseLogo from '../assets/firebase-logo.png';
import reactLogo from '../assets/react-logo.png';

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

  navigate = (e) => {
    this.setState({
      isOpen: false
    });
  }

  onLogout = (e) => {
    const auth = getAuth();
    signOut(auth);
    this.setState({
      isOpen: false
    });
  }

  render = () => {
    return (
      <nav className={this.state.isOpen ? 'open' : 'closed'}>
          <ul className='main-nav'>
              <li>
                  <Link to='/course'>
                      <FontAwesomeIcon icon={faLanguage} className='responsive-placeholder' />
                      <span>course</span>
                  </Link>
              </li>
              <li>
                  <Link to='/countries'>
                      <FontAwesomeIcon icon={faMap} className='responsive-placeholder' />
                      <span>countries</span>
                  </Link>
              </li>
              <li>
                  <Link to='/blog'>
                      <FontAwesomeIcon icon={faNewspaper} className='responsive-placeholder' />
                      <span>blog</span>
                  </Link>
              </li>
              {this.props.authed && <li>
                  <Link to='/' onClick={this.onLogout}>
                      <span>log out</span>
                  </Link>
              </li>}
          </ul>
          <p className='social'>
              <a href='https://www.facebook.com/bureson' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faFacebookSquare} /></a>
              <a href='https://www.instagram.com/ondrej_bures/' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faInstagram} /></a>
              <a href='https://www.goodreads.com/user/show/71882156-ondrej-bures' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faGoodreads} /></a>
              <br />
              <a href='https://www.linkedin.com/in/ondrej-bures/' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faLinkedin} /></a>
              <a href='https://github.com/bureson' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faGithubSquare} /></a>
              <br />
              <a href='https://youtube.com/@czeBuri' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faYoutubeSquare} /></a>
          </p>
          <div className='powered-by'>
            <ul>
                <li><a href='https://reactjs.org/' target='_blank' rel='noopener noreferrer'><img src={reactLogo} alt='react' /></a></li>
                <li><a href='https://firebase.google.com/' target='_blank' rel='noopener noreferrer'><img src={firebaseLogo} alt='firebase' /></a></li>
            </ul>
        </div>
      </nav>
    )
  }

}

export default Menu;
