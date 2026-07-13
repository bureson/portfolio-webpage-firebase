import React, { Component } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      pw: '',
      errMess: null
    };
  }

  onSubmit = (e) => {
    e.preventDefault();
    const auth = getAuth();
    signInWithEmailAndPassword(auth, this.state.email, this.state.pw)
      .then(result => {
        this.props.history.push('/');
      })
      .catch(error => {
        this.setState({
          errMess: error.message
        })
      });
  }

  onChange = (e, key) => {
    this.setState({
      [key]: e.target.value
    })
  }

  render() {
    return (
      <div className='page'>
        <div className='login-card'>
          <p className='kicker'>Administration</p>
          <h2>Login</h2>
          <p>This website is so fancy it has its own administration!</p>
          <form onSubmit={e => this.onSubmit(e)}>
            <label htmlFor='email'>E-mail</label>
            <input type='text' id='email' value={this.state.email} onChange={e => this.onChange(e, 'email')} />
            <label htmlFor='password'>Password</label>
            <input type='password' id='password' value={this.state.pw} onChange={e => this.onChange(e, 'pw')} />
            {this.state.errMess && <div className='error'>{this.state.errMess}</div>}
            <button type='submit' value='Submit'>Log in →</button>
          </form>
        </div>
      </div>
    )
  }
}

export default Login;
