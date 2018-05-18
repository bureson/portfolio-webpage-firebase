import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/fontawesome-free-solid';
import { faFacebookSquare, faInstagram, faLinkedin, faGithubSquare, faGoodreads } from '@fortawesome/fontawesome-free-brands';

import firebaseLogo from '../assets/firebase-logo.png';
import reactLogo from '../assets/react-logo.png';
import travisciLogo from '../assets/travisci-logo.png';

class Home extends Component {

  componentDidMount = () => {
    document.title = 'Portfolio | Ondrej Bures';
  }

  render = () => {
    return (
      <div>
        <div className='welcome'>
          <h2>Welcome</h2>
          <p>
            I'm a full-stack developer from Czech Republic who currently resides in Copenhagen, Denmark.
          </p>
          <p>
            I have built this webpage with the main intention of providing a shelter to a small project called <em>Word of the day</em>
          &nbsp;that me and my colleague Ian have been running since June 2017. Every single work day (including holidays!) he provides
          &nbsp;me with a new word which needs to be either descriptive or iconic for danish culture or special for that very day. You
          &nbsp;can see the list of all the words after navigating yourself to the <em>Course</em> section.
          </p>
          <p>
            Additionally, as I'm also a keen traveller and because I was missing a nice tool where I would be able to track a list of visited countries
            &nbsp;that I've visited so far, during one of the long scandinavian nights I've decided to create my own tracking tool right here.
            &nbsp;You can see the list in the <em>Countries</em> section.
          </p>
          <p>
            <a href='https://www.facebook.com/bureson' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faFacebookSquare} /></a>
            <a href='https://www.instagram.com/ondrej_bures/' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faInstagram} /></a>
            <a href='https://www.linkedin.com/in/ondrej-bures/' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faLinkedin} /></a>
            <a href='https://github.com/bureson' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faGithubSquare} /></a>
            <a href='https://www.goodreads.com/user/show/71882156-ondrej-bures' target='_blank' rel='noopener noreferrer'><FontAwesomeIcon icon={faGoodreads} /></a>
          </p>
        </div>
        <div className='powered-by'>
          <ul>
            <li><a href='https://reactjs.org/' target='_blank' rel='noopener noreferrer'><img src={reactLogo} alt='react' /></a></li>
            <li><a href='https://firebase.google.com/' target='_blank' rel='noopener noreferrer'><img src={firebaseLogo} alt='firebase' /></a></li>
            <li><a href='https://travis-ci.org/' target='_blank' rel='noopener noreferrer'><img src={travisciLogo} alt='travis ci' /></a></li>
            <li><Link to={'/login'}><FontAwesomeIcon icon={faSignInAlt} /></Link></li>
          </ul>
        </div>
      </div>
    )
  }
}

export default Home;
