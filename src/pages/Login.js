import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import firebase from 'firebase';

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
          <div className='input-group'>
            <label htmlFor='email'>E-mail:</label>
            <input type='text' id='email' ref={email => this.email = email} />
          </div>
          <div className='input-group'>
            <label htmlFor='password'>Password:</label>
            <input type='password' id='password' ref={pw => this.pw = pw} />
          </div>
          {this.state.errMess && <div className='alert alert-danger'>{this.state.errMess}</div>}
          <button type='submit' value='Submit'>Submit</button>
        </form>
      </div>
    )
  }
}

export default withRouter(Login);
