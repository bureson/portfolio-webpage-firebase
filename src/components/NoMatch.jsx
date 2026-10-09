import React, { Component } from 'react';

import { setNoIndex } from '../lib/Shared';

class NoMatch extends Component {

  componentDidMount = () => {
    document.title = 'Not found | Ondrej Bures';
    setNoIndex(true);
  }

  componentWillUnmount = () => {
    setNoIndex(false);
  }

  render = () => {
    return (
      <div className="no-match">
        <h2>Oopsie!</h2>
        <p>Seems like you are trying to reach something that doesn't exist</p>
      </div>
    )
  }

}

export default NoMatch;
