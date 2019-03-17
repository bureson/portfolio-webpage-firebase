import React, { Component } from 'react';
import firebase from 'firebase/app';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/fontawesome-free-solid';
import { Converter } from 'showdown';

import Loader from '../components/Loader';
import NoMatch from '../components/NoMatch';

class AddCountry extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      date: this.convertTimestamp(Math.floor(Date.now() / 1000)),
      description: '',
      filePath: null,
      key: null,
      loading: true,
      name: '',
      progress: null,
      story: '',
      timestamp: null
    }
  }

  componentDidMount = () => {
    const countryKey = this.props.match.params.country;
    if (countryKey) {
      firebase.database().ref('country').child(countryKey).on('value', snapshot => {
        const payload = snapshot.val();
        if (payload) {
          document.title = `Edit ${payload.name} | Ondrej Bures`;
          this.setState({
            date: this.convertTimestamp(payload.date),
            description: payload.description,
            filePath: payload.photoPath,
            key: countryKey,
            loading: false,
            name: payload.name,
            preview: false,
            story: payload.story,
            timestamp: payload.timestamp
          });
        }
      });
    } else {
      this.setState({
        loading: false
      });
    }
  }

  componentWillReceiveProps = (props) => {
    this.setState({
      authed: props.authed
    });
  }

  convertTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    return `${year}-${month}-${day}`;
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
        uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
          this.setState({
            filePath: downloadURL,
            progress: null
          });
        });
      }
    );
  }

  onChange = (e, key) => {
    this.setState({
      [key]: e.target.value
    })
  }

  onToggle = (e) => {
    this.setState({
      preview: !this.state.preview
    });
  }

  onDelete = (e) => {
    e.preventDefault();
    const urlTokens = decodeURIComponent(this.state.filePath).split('/');
    const fileName = urlTokens[urlTokens.length - 1].split('?')[0];
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(`country/${fileName}`);
    fileRef.delete().then(() => {
      this.setState({
        filePath: null
      });
      if (this.state.key) {
        firebase.database().ref(`country/${this.state.key}/photoPath`).set(null);
      }
    });
  }

  onSubmit = (e) => {
    e.preventDefault();
    const key = this.state.key || this.state.name.replace(/\s+/g, '-').toLowerCase();
    firebase.database().ref(`country/${key}`).set({
      name: this.state.name,
      date: Math.floor(Date.parse(this.state.date) / 1000) || 0,
      photoPath: this.state.filePath || '',
      description: this.state.description,
      story: this.state.story,
      timestamp: this.state.timestamp || Math.floor(Date.now() / 1000)
    }).then(() => {
      this.props.history.push('/countries');
    }).catch(e => {
      console.log(e);
    });
  }

  render = () => {
    if (!this.state.authed) {
      return <NoMatch />
    }
    if (this.state.loading) {
      return <Loader />
    }
    const mdConverter = new Converter({
      noHeaderId: true,
      underline: true,
      openLinksInNewWindow: true
    });
    const storyHtml = mdConverter.makeHtml(this.state.story);
    const isLoading = this.state.progress;
    const hasUrl = this.state.filePath;
    return (
      <div>
        <form onSubmit={e => this.onSubmit(e)}>
          <h2>Add new country</h2>
          <div className='input-group'>
            <label htmlFor='country'>Country</label>
            <input type='text' id='country' placeholder='Country name' value={this.state.name} onChange={e => this.onChange(e, 'name')} />
          </div>
          <div className='input-group'>
            <label htmlFor='date'>Date visited</label>
            <input type='date' id='date' placeholder='Visited' value={this.state.date} onChange={e => this.onChange(e, 'date')} />
          </div>
          <div className='input-group'>
            <label htmlFor='short-desc'>Short description</label>
            <textarea id='short-desc' placeholder='Description' onChange={e => this.onChange(e, 'description')} value={this.state.description} />
          </div>
          <div className='input-group'>
            <label htmlFor='photo'>Main photo</label>
            {!(isLoading || hasUrl) && <input type='file' id='photo' onChange={e => this.onFileUpload(e)} />}
            {isLoading && <progress value={this.state.progress} max='100' />}
            {hasUrl && <p>
              <button onClick={this.onDelete}><FontAwesomeIcon icon={faTrash} /></button>
              {this.state.filePath}
            </p>}
          </div>
          <div className='input-group'>
            <label htmlFor='short-desc'>Story</label>
            <textarea id='short-desc' rows='10' placeholder='Story' onChange={e => this.onChange(e, 'story')} value={this.state.story} />
          </div>
          <div className='input-group'>
            <label htmlFor='story-preview'>Preview</label>
            <input type='checkbox' checked={this.state.preview} onChange={this.onToggle} />
          </div>
          {this.state.preview && <div dangerouslySetInnerHTML={{__html: storyHtml}} />}
          <button type='submit' value='Submit'>Submit</button>
        </form>
      </div>
    )
  }
}

export default AddCountry;
