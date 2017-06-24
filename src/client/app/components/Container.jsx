import React, { Component } from 'react';

import Menu from './Menu';

class Container extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: false
    }
  }

  componentDidMount = () => {
    this.removeListener = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          authed: !user.isAnonymous,
          user: user.email
        })
      } else {
        this.setState({
          authed: false
        })
      }
    })
  }

  componentWillUnmount = () => {
    this.removeListener();
  }

  render = () => {
    return (
      <div className="container">
        <h1>Language course by Ian @ Triggerz</h1>
        <Menu authed={this.state.authed} />
        {this.state.authed && <p>User logged: {this.state.user}</p>}
        {this.props.children}
      </div>
    )
  }
}

export default Container;
