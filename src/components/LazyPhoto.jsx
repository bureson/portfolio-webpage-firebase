import React, { Component } from 'react';

import { classNames } from '../lib/Shared';

class LazyPhoto extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loaded: false
    };
    this.ref = React.createRef();
  }

  componentDidMount = () => {
    if (!('IntersectionObserver' in window)) {
      this.onVisible();
      return;
    }
    this.observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        this.observer.disconnect();
        this.onVisible();
      }
    }, { rootMargin: '300px' });
    this.observer.observe(this.ref.current);
  }

  componentWillUnmount = () => {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.image) {
      this.image.onload = null;
    }
  }

  // start the download only once the photo is near the viewport and
  // fade it in when the browser has it ready
  onVisible = () => {
    this.setState({ visible: true });
    this.image = new Image();
    this.image.onload = () => this.setState({ loaded: true });
    this.image.src = this.props.src;
  }

  render = () => {
    return (
      <div ref={this.ref} className={classNames('lazy-photo', this.props.className)}>
        {this.state.visible && <div className={classNames('img', {loaded: this.state.loaded})} style={{backgroundImage: `url(${this.props.src})`}}></div>}
      </div>
    )
  }

}

export default LazyPhoto;
