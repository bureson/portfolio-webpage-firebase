import React, { Component } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      errMess: null
    };
  }

  onGoogleLogin = () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    this.setState({ errMess: null });
    signInWithPopup(auth, provider)
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
      <div className='page'>
        <div className='login-card'>
          <p className='kicker'>Administration</p>
          <h2>Login</h2>
          <p>This website is so fancy it has its own administration!</p>
          {this.state.errMess && <div className='error'>{this.state.errMess}</div>}
          <button type='button' onClick={this.onGoogleLogin}>Log in with Google →</button>
        </div>
      </div>
    )
  }
}

export default Login;
