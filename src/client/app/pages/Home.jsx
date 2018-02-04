import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';

class Home extends Component {
  render = () => {
    return (
      <DocumentTitle title='Homepage | Ondrej Bures'>
        <div className='welcome'>
          <h2>Welcome</h2>
          <p>
            I'm a front-end developer from Czechia who currently resides in Copenhagen, Denmark.
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
            <a href='https://www.facebook.com/bureson' target='_blank'><i className='fab fa-facebook-square'></i></a>
            <a href='https://www.instagram.com/ondrej_bures/' target='_blank'><i className='fab fa-instagram'></i></a>
            <a href='https://www.linkedin.com/in/ondrej-bures/' target='_blank'><i className='fab fa-linkedin'></i></a>
            <a href='https://github.com/bureson' target='_blank'><i className='fab fa-github-square'></i></a>
          </p>
        </div>
      </DocumentTitle>
    )
  }
}

export default Home;
