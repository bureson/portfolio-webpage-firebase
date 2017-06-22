import React, { Component } from 'react';
import { browserHistory } from 'react-router';

class Add extends Component {

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
        browserHistory.push('/');
      }
    });
  }

  render = () => {
    return (
      <div>
        <form onSubmit={e => this.onSubmit(e)}>
          <div className="form-group">
            <label htmlFor="original">Original:</label>
            <input type="text" id="original" className="form-control" ref={original => this.original = original} />
          </div>
          <div className="form-group">
            <label htmlFor="pronunciation">Pronunciation:</label>
            <input type="text" id="pronunciation" className="form-control" ref={prons => this.prons = prons} />
          </div>
          <div className="form-group">
            <label htmlFor="translation">Translation:</label>
            <input type="text" id="translation" className="form-control" ref={means => this.means = means} />
          </div>
          <input type="submit" className="btn btn-default" />
        </form>
      </div>
    )
  }

}

export default Add;
