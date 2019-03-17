import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import firebase from 'firebase/app';

import './index.css';
import Index from './pages/Index';
import registerServiceWorker from './registerServiceWorker';

const config = {
  apiKey: "AIzaSyAeVI0XvsnAu3W7msJQ3Iff4ly-gcm9uLs",
  authDomain: "portfolio-project-f7f88.firebaseapp.com",
  databaseURL: "https://portfolio-project-f7f88.firebaseio.com",
  projectId: "portfolio-project-f7f88",
  storageBucket: "portfolio-project-f7f88.appspot.com",
  messagingSenderId: "723749657784"
};
firebase.initializeApp(config);

render(
  <Router>
    <Route component={Index} path='/' />
  </Router>, document.getElementById('root'));
registerServiceWorker();
