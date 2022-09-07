import React, { Component } from 'react';

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
            I'm a full-stack developer from the Czech Republic who moved back to the homeland after living in Copenhagen, Denmark for 3 years.
            &nbsp;I'm still working for my danish employer <a href='https://www.culturedrivers.com/' target='_blank' rel='noopener noreferrer'>CultureDrivers</a>
            &nbsp;where we recently established 4 day work week.
          </p>
          <p>
            Initially I have built this webpage with the intention of providing a shelter to a small project called <em>Word of the day</em>
            &nbsp;that me and my colleague Ian have been running since June 2017. Every single work day (including holidays!) he provides
            &nbsp;me with a new word which needs to be either descriptive or iconic for danish culture or special for that very day. You
            &nbsp;can see the list of all the words after navigating yourself to the <em>Course</em> section.
          </p>
          <p>
            Over time this site became home to other collections that I want to keep track of. As I'm a keen traveller and because of lack of a nice 
            &nbsp;tool to track a list of visited countries that I've visited so far, during one of the long scandinavian nights I've decided 
            &nbsp;to create my own tracking tool right here. You can see the list in the <em>Countries</em> section.
          </p>
        </div>
      </div>
    )
  }
}

export default Home;
