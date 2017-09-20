import { render } from 'react-dom';
import { BrowserRouter as Router, Route, IndexRoute, browserHistory } from 'react-router-dom';
import firebase from 'firebase';

import Index from './pages/Index';
import Less from './less/root.less';

var config = {
  apiKey: "AIzaSyAeVI0XvsnAu3W7msJQ3Iff4ly-gcm9uLs",
  authDomain: "portfolio-project-f7f88.firebaseapp.com",
  databaseURL: "https://portfolio-project-f7f88.firebaseio.com",
  projectId: "portfolio-project-f7f88",
  storageBucket: "portfolio-project-f7f88.appspot.com",
  messagingSenderId: "723749657784"
};
firebase.initializeApp(config);

render((
  <Router history={browserHistory}>
    <Route component={Index} path='/' />
  </Router>
), document.getElementById('app'));
