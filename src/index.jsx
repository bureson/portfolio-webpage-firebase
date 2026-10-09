import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { initializeApp } from 'firebase/app';

import './index.css';
import Index from './pages/Index';
import RouteChangeListener from './components/RouteChangeListener';

const config = {
  apiKey: "AIzaSyAeVI0XvsnAu3W7msJQ3Iff4ly-gcm9uLs",
  authDomain: "portfolio-project-f7f88.firebaseapp.com",
  databaseURL: "https://portfolio-project-f7f88.firebaseio.com",
  projectId: "portfolio-project-f7f88",
  storageBucket: "portfolio-project-f7f88.appspot.com",
  messagingSenderId: "723749657784"
};
initializeApp(config);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <RouteChangeListener />
      <Route component={Index} path='/' />
    </Router>
  </React.StrictMode>
);

