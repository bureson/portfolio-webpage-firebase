import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class Loader extends Component {
  render = () => {
    return (
      <div className="spinner"></div>
    )
  }

}

export default withRouter(Loader);
