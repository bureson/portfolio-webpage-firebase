import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Container from './components/Container';
import Course from './components/Course';
import Login from './components/Login';
import Add from './components/Add';

render((
  <Router history={browserHistory}>
    <Route component={Container} path='/'>
      <IndexRoute component={Course} />
      <Route component={Add} path='/add' />
      <Route component={Login} path='/login' />
    </Route>
  </Router>
), document.getElementById('app'));
