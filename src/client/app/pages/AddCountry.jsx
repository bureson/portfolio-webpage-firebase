import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';
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
    const uploadTask = storageRef.child(`countries/${file.name}`).put(file);
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
    return (
      <DocumentTitle title='Add new country'>
        <div>
          <form onSubmit={e => this.onSubmit(e)}>
            <h2>Add new country</h2>
            <input type='text' placeholder='Country name' ref={name => this.name = name} />
            <input type='date' placeholder='Visited' ref={date => this.date = date} />
            <input type='file' onChange={e => this.onFileUpload(e)} />
            <textarea placeholder='Description' ref={description => this.description = description}></textarea>
            <p>{this.state.filePath}</p>
            <input type='submit' value='Submit'></input>
          </form>
        </div>
      </DocumentTitle>
    )
  }
}

export default Course;
