import React, { Component } from 'react';

import { classNames } from '../lib/Shared';

// the site's starfield in miniature: a gold satellite and a silver one
// circling a glowing core. The small variant drops the inner orbit and
// fits inline, e.g. in a homepage card
class Loader extends Component {
  render = () => {
    return (
      <div className={classNames('orbit-loader', {small: this.props.small})}>
        <div className='ring outer'>
          <svg viewBox='0 0 120 120'>
            <circle className='track' cx='60' cy='60' r='52' />
            <circle className='satellite' cx='60' cy='8' r='4.5' />
          </svg>
        </div>
        <div className='ring inner'>
          <svg viewBox='0 0 84 84'>
            <circle className='track' cx='42' cy='42' r='36' />
            <circle className='satellite' cx='42' cy='6' r='3' />
          </svg>
        </div>
        <div className='core' />
      </div>
    )
  }
}

export default Loader;
