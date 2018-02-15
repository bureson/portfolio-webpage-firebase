import React, { Component } from 'react';

class NoMatch extends Component {

  componentDidMount = () => {
    document.title = 'Not found | Ondrej Bures';
  }

  render = () => {
    return (
      <div className="no-match">
        <h2>Oops!</h2>
        <p>Seems like you are trying to reach something that doesn't exist</p>
      </div>
    )
  }

}

export default NoMatch;
