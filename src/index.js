import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { initializeApp } from 'firebase/app';

import './index.css';
import Index from './pages/Index';
import RouteChangeListener from './components/RouteChangeListener';
import reportWebVitals from './reportWebVitals';

const config = {
  apiKey: "AIzaSyAeVI0XvsnAu3W7msJQ3Iff4ly-gcm9uLs",
  authDomain: "portfolio-project-f7f88.firebaseapp.com",
  databaseURL: "https://portfolio-project-f7f88.firebaseio.com",
  projectId: "portfolio-project-f7f88",
  storageBucket: "portfolio-project-f7f88.appspot.com",
  messagingSenderId: "723749657784"
};
initializeApp(config);

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <RouteChangeListener />
      <Route component={Index} path='/' />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
