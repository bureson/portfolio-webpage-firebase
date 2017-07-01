import React, { Component } from 'react';
import { browserHistory, withRouter } from 'react-router-dom';

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      errMess: null
    };
  }

  onSubmit = (e) => {
    e.preventDefault();
    firebase.auth().signInWithEmailAndPassword(this.email.value, this.pw.value)
      .then(result => {
        this.props.history.push('/');
      })
      .catch(error => {
        this.setState({
          errMess: error.message
        })
      });
  }

  render() {
    return (
      <div>
        <form onSubmit={e => this.onSubmit(e)}>
          <div className="form-group">
            <label htmlFor="email">E-mail:</label>
            <input type="text" id="email" className="form-control" ref={email => this.email = email} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" className="form-control" ref={pw => this.pw = pw} />
          </div>
          {this.state.errMess && <div className="alert alert-danger">{this.state.errMess}</div>}
          <input type="submit" className="btn btn-default" />
        </form>
      </div>
    )
  }
}

export default withRouter(Login);
