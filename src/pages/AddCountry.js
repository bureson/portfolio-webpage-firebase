import React, { Component } from 'react';
import { getDatabase, ref as databaseRef, onValue, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
      iso: null,
      key: null,
      loading: true,
      magnet: false,
      name: '',
      progress: null,
      story: '',
      timestamp: null
    }
  }

  componentDidMount = () => {
    const countryKey = this.props.match.params.country;
    if (countryKey) {
      const db = getDatabase();
      const countryRef = databaseRef(db, 'country/' + countryKey);
      onValue(countryRef, snapshot => {
        const payload = snapshot.val();
        if (payload) {
          document.title = `Edit ${payload.name} | Ondrej Bures`;
          this.setState({
            date: this.convertTimestamp(payload.date),
            description: payload.description,
            filePath: payload.photoPath,
            iso: payload.iso,
            key: countryKey,
            loading: false,
            magnet: !!payload.magnet,
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

  componentDidUpdate = () => {
    if (this.state.authed !== this.props.authed) {
      this.setState({
        authed: this.props.authed
      });
    }
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
    const storage = getStorage();
    const fileRef = storageRef(storage, `country/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + Math.round(progress) + '% done');
        this.setState({
          progress: Math.round(progress)
        });
      }, (error) => {
        console.log(error); // Note: eventually handle error
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then(filePath => {
          this.setState({
            filePath,
            progress: null
          });
        });
      }
    );
  }

  onChange = (key) => {
    return (e) => {
      this.setState({
        [key]: e.target.value
      });
    };
  }

  onToggle = (prop) => {
    return (e) => {
      this.setState({
        [prop]: !this.state[prop]
      });
    }
  }

  onDelete = (e) => {
    e.preventDefault();
    const urlTokens = decodeURIComponent(this.state.filePath).split('/');
    const fileName = urlTokens[urlTokens.length - 1].split('?')[0];
    const storage = getStorage();
    const fileRef = storageRef(storage, `country/${fileName}`);
    deleteObject(fileRef).then(() => {
      this.setState({
        filePath: null
      });
      if (this.state.key) {
        const db = getDatabase();
        const photoRef = databaseRef(db, `country/${this.state.key}/photoPath`);
        set(photoRef, null);
      }
    });
  }

  onSubmit = (e) => {
    e.preventDefault();
    const key = this.state.key || this.state.name.replace(/\s+/g, '-').toLowerCase();
    const db = getDatabase();
    set(databaseRef(db, `country/${key}`), {
      name: this.state.name,
      date: Math.floor(Date.parse(this.state.date) / 1000) || 0,
      photoPath: this.state.filePath || '',
      iso: this.state.iso,
      magnet: this.state.magnet,
      description: this.state.description,
      story: this.state.story,
      timestamp: this.state.timestamp || Math.floor(Date.now() / 1000)
    }).then(() => {
      this.props.history.push('/countries');
    }).catch(console.log);
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
            <input type='text' id='country' placeholder='Country name' value={this.state.name} onChange={this.onChange('name')} />
          </div>
          <div className='input-group'>
            <label htmlFor='date'>Date visited</label>
            <input type='date' id='date' placeholder='Visited' value={this.state.date} onChange={this.onChange('date')} />
          </div>
          <div className='input-group'>
            <label htmlFor='ico'>ISO code</label>
            <input type='text' id='iso' placeholder='ISO code' value={this.state.iso} onChange={this.onChange('iso')} />
          </div>
          <div className='input-group'>
            <label htmlFor='short-desc'>Short description</label>
            <textarea id='short-desc' placeholder='Description' onChange={this.onChange('description')} value={this.state.description} />
          </div>
          <div className='input-group'>
            <label htmlFor='story-preview'>Has magnet</label>
            <input type='checkbox' checked={this.state.magnet} onChange={this.onToggle('magnet')} />
          </div>
          <div className='input-group'>
            <label htmlFor='photo'>Main photo</label>
            {!(isLoading || hasUrl) && <input type='file' id='photo' onChange={this.onFileUpload} />}
            {isLoading && <progress value={this.state.progress} max='100' />}
            {hasUrl && <p>
              <button onClick={this.onDelete}><FontAwesomeIcon icon={faTrash} /></button>
              {this.state.filePath}
            </p>}
          </div>
          <div className='input-group'>
            <label htmlFor='short-desc'>Story</label>
            <textarea id='short-desc' rows='10' placeholder='Story' onChange={this.onChange('story')} value={this.state.story} />
          </div>
          <div className='input-group'>
            <label htmlFor='story-preview'>Preview</label>
            <input type='checkbox' checked={this.state.preview} onChange={this.onToggle('preview')} />
          </div>
          {this.state.preview && <div dangerouslySetInnerHTML={{__html: storyHtml}} />}
          <button type='submit' value='Submit'>Submit</button>
        </form>
      </div>
    )
  }
}

export default AddCountry;
