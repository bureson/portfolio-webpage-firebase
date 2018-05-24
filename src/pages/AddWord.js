import React, { Component } from 'react';
import firebase from 'firebase';

import NoMatch from '../components/NoMatch';

class AddWord extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      original: '',
      pronunciation: '',
      translation: ''
    }
  }

  componentWillReceiveProps = (props) => {
    this.setState({
      authed: props.authed
    });
  }

  onChange = (e, key) => {
    this.setState({
      [key]: e.target.value
    });
  }

  onKeyUp = (e, key) => {
    if (e.ctrlKey && e.altKey) {
      switch (e.keyCode) {
        case 65: // Note: A
          e.preventDefault();
          this.setState({
            [key]: `${this.state[key]}å`
          });
          break;
        case 69: // Note: E
          e.preventDefault();
          this.setState({
            [key]: `${this.state[key]}æ`
          });
          break;
        case 79: // Note: O
          e.preventDefault();
          this.setState({
            [key]: `${this.state[key]}ø`
          });
          break;
        default:
          break;
      }
    }
  }

  onSubmit = (e) => {
    e.preventDefault();
    const courseRef = firebase.database().ref('course');
    courseRef.push({
      original: this.state.original,
      prons: this.state.pronunciation,
      means: this.state.translation,
      timestamp: Math.floor(Date.now() / 1000)
    }, error => {
      if (error) {
        console.log(error);
      } else {
        this.props.history.push('/course');
      }
    });
  }

  render = () => {
    if (!this.state.authed) {
      return <NoMatch />
    }
    return (
      <div className='add-phrase'>
        <h2>Add new phrase</h2>
        <form onSubmit={e => this.onSubmit(e)}>
          {['original', 'pronunciation', 'translation'].map(name => {
            return (
              <div className='input-group' key={name}>
                <label htmlFor={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</label>
                <input type='text' id={name} value={this.state[name]} onChange={e => this.onChange(e, name)} onKeyUp={e => this.onKeyUp(e, name)} />
              </div>
            )
          })}
          <button type='submit' value='Submit'>Submit</button>
        </form>
        <div className='tooltip'>
          <h3>Special characters</h3>
          <ul>
            <li>å (Ctrl + Shift + A)</li>
            <li>æ (Ctrl + Shift + E)</li>
            <li>ø (Ctrl + Shift + O)</li>
            <li>ö</li>
          </ul>
        </div>
      </div>
    )
  }
}

export default AddWord;
