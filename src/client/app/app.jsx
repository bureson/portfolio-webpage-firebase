import { render } from 'react-dom';
import { BrowserRouter as Router, Route, IndexRoute, browserHistory } from 'react-router-dom';

import Container from './components/Container';
import Less from './less/root.less';

render((
  <Router history={browserHistory}>
    <Route component={Container} path='/' />
  </Router>
), document.getElementById('app'));
