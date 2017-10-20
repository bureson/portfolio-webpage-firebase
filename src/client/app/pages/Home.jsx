import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';

class Home extends Component {
  render = () => {
    return (
      <DocumentTitle title='Homepage'>
        <div>
          Welcome to my page
        </div>
      </DocumentTitle>
    )
  }
}

export default Home;
