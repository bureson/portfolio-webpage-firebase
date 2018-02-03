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
      <DocumentTitle title='Add new phrase'>
        <div className={'row'}>
          <div className={'col-xs-9'}>
            <form onSubmit={e => this.onSubmit(e)}>
              <div className='form-group'>
                <label htmlFor='original'>Original:</label>
                <input type='text' id='original' className='form-control' ref={original => this.original = original} />
              </div>
              <div className='form-group'>
                <label htmlFor='pronunciation'>Pronunciation:</label>
                <input type='text' id='pronunciation' className='form-control' ref={prons => this.prons = prons} />
              </div>
              <div className='form-group'>
                <label htmlFor='translation'>Translation:</label>
                <input type='text' id='translation' className='form-control' ref={means => this.means = means} />
              </div>
              <input type='submit' className='btn btn-default' />
            </form>
          </div>
          <div className={'col-xs-3'}>
            <div className='panel panel-default'>
              <div className='panel-heading'>Special characters</div>
              <div className='panel-body'>
                <ul>
                  <li>å</li>
                  <li>ø</li>
                  <li>ö</li>
                  <li>æ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DocumentTitle>
    )
  }
}

export default withRouter(AddWord);
