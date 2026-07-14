import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookSquare, faInstagram, faLinkedin, faGithubSquare, faGoodreads, faYoutubeSquare } from '@fortawesome/fontawesome-free-brands';

import firebaseLogo from '../assets/firebase-logo.png';
import reactLogo from '../assets/react-logo.png';
import goatcounterLogo from '../assets/goatcounter.png';

class Footer extends Component {

  render = () => {
    return (
      <div className='footer'>
        <p className='social'>
            <a href='https://github.com/bureson' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faGithubSquare} /><span>GitHub</span></a>
            <a href='https://www.linkedin.com/in/ondrej-bures/' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faLinkedin} /><span>LinkedIn</span></a>
            <a href='https://www.instagram.com/ondrej_bures/' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faInstagram} /><span>Instagram</span></a>
            <a href='https://www.facebook.com/bureson' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faFacebookSquare} /><span>Facebook</span></a>
            <a href='https://www.goodreads.com/user/show/71882156-ondrej-bures' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faGoodreads} /><span>Goodreads</span></a>
            <a href='https://youtube.com/@czeBuri' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faYoutubeSquare} /><span>YouTube</span></a>
        </p>
        <div className='powered-by'>
            <ul>
                <li><a href='https://reactjs.org/' target='_blank' rel='noopener noreferrer'><img src={reactLogo} alt='react' /></a></li>
                <li><a href='https://firebase.google.com/' target='_blank' rel='noopener noreferrer'><img src={firebaseLogo} alt='firebase' /></a></li>
                <li><a href='https://ondrejbures.goatcounter.com/' target='_blank' rel='noopener noreferrer'><img src={goatcounterLogo} alt='goatcounter' /></a></li>
                <li><span>est. 2017</span></li>
            </ul>
        </div>
      </div>
    )
  }

}

export default Footer;
