import React from 'react';
import { withRouter } from 'react-router-dom';

const RouteChangeListener = props => {
  // GoatCounter counts the initial page load itself; only SPA navigations
  // after that need to be reported manually.
  const isInitialLoad = React.useRef(true);
  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    if (window.goatcounter) {
      window.goatcounter.count({
        path: props.location.pathname + props.location.search,
      });
    }
  }, [props.location.pathname, props.location.search]);
  return null;
};

export default withRouter(RouteChangeListener);
