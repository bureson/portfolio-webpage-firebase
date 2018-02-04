import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import firebase from 'firebase';
import DocumentTitle from 'react-document-title';

class AddWord extends Component {

  onSubmit = (e) => {
    e.preventDefault();
    const courseRef = firebase.database().ref("course");
    courseRef.push({
      original: this.original.value,
      prons: this.prons.value,
      means: this.means.value,
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
    return (
      <DocumentTitle title='Add new phrase | Ondrej Bures'>
        <div className='add-phrase'>
          <h2>Add new phrase</h2>
          <form onSubmit={e => this.onSubmit(e)}>
            <div className='input-group'>
              <label htmlFor='original'>Original</label>
              <input type='text' id='original' ref={original => this.original = original} />
            </div>
            <div className='input-group'>
              <label htmlFor='pronunciation'>Pronunciation</label>
              <input type='text' id='pronunciation' ref={prons => this.prons = prons} />
            </div>
            <div className='input-group'>
              <label htmlFor='translation'>Translation</label>
              <input type='text' id='translation' ref={means => this.means = means} />
            </div>
            <button type='submit' value='Submit'>Submit</button>
          </form>
          <div className='tooltip'>
            <h3>Special characters</h3>
            <ul>
              <li>å</li>
              <li>ø</li>
              <li>ö</li>
              <li>æ</li>
            </ul>
          </div>
        </div>
      </DocumentTitle>
    )
  }
}

export default withRouter(AddWord);
