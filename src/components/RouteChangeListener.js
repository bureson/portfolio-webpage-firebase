import React from 'react';
import { withRouter } from 'react-router-dom';

const RouteChangeListener = props => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [props.location.pathname]);
  return null;
};

export default withRouter(RouteChangeListener);
