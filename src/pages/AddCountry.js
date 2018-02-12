import React, { Component } from 'react';
import firebase from 'firebase';

class Course extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      country: null,
      date: null,
      description: null,
      flag: null,
      filePath: null,
      progress: null
    }
  }

  componentWillReceiveProps = (props) => {
    this.setState(props);
  }

  onFileUpload = (e) => {
    const file = e.target.files[0];
    const storageRef = firebase.storage().ref();
    const uploadTask = storageRef.child(`country/${file.name}`).put(file);
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + Math.round(progress) + '% done');
        this.setState({
          progress: Math.round(progress)
        });
      }, (error) => {
        console.log(error); // Note: eventually handle error
      }, () => {
        this.setState({
          filePath: uploadTask.snapshot.downloadURL,
          progress: null
        });
      }
    );
  }

  onSubmit = (e) => {
    e.preventDefault();
    const countryRef = firebase.database().ref("country");
    countryRef.push({
      name: this.name.value,
      date: Math.floor(Date.parse(this.date.value) / 1000),
      photoPath: this.state.filePath,
      description: this.description.value,
      timestamp: Math.floor(Date.now() / 1000)
    }, error => {
      if (error) {
        console.log(error);
      } else {
        this.props.history.push('/countries');
      }
    });
  }

  render = () => {
    const isLoading = this.state.progress;
    const hasUrl = this.state.filePath;
    return (
      <div>
        <form onSubmit={e => this.onSubmit(e)}>
          <h2>Add new country</h2>
          <div className='input-group'>
            <label htmlFor='country'>Country</label>
            <input type='text' id='country' placeholder='Country name' ref={name => this.name = name} />
          </div>
          <div className='input-group'>
            <label htmlFor='date'>Date visited</label>
            <input type='date' id='date' placeholder='Visited' ref={date => this.date = date} />
          </div>
          <div className='input-group'>
            <label htmlFor='photo'>Main photo</label>
            {!(isLoading || hasUrl) && <input type='file' id='photo' onChange={e => this.onFileUpload(e)} />}
            {isLoading && <progress value={this.state.progress} max='100' />}
            {hasUrl && <p>{this.state.filePath}</p>}
          </div>
          <div className='input-group'>
            <label htmlFor='short-desc'>Short description</label>
            <textarea id='short-desc' placeholder='Description' ref={description => this.description = description}></textarea>
          </div>
          <button type='submit' value='Submit'>Submit</button>
        </form>
      </div>
    )
  }
}

export default Course;
