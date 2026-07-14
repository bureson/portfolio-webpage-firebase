import React, { Component } from 'react';

class Dialog extends Component {

  componentDidMount = () => {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount = () => {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (e) => {
    if (e.key === 'Escape') {
      this.props.onClose();
    }
  }

  onBackdrop = (e) => {
    if (e.target === e.currentTarget) {
      this.props.onClose();
    }
  }

  render = () => {
    return (
      <div className='dialog-overlay' onMouseDown={this.onBackdrop}>
        <div className='dialog'>
          <div className='head'>
            <div>
              {this.props.kicker && <p className='kicker'>{this.props.kicker}</p>}
              <div className='title'>{this.props.title}</div>
            </div>
            <button className='close' onClick={this.props.onClose}>✕</button>
          </div>
          {this.props.children}
        </div>
      </div>
    )
  }

}

export default Dialog;
