import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import firebase from 'firebase';

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
