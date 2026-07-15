import React, { Component } from 'react';
import { getDatabase, ref as databaseRef, onValue, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

import Dialog from './Dialog';
import Dropdown from './Dropdown';
import { classNames, convertTimestamp } from '../lib/Shared';

class CountryDialog extends Component {

  constructor(props) {
    super(props);
    const country = props.country;
    this.state = {
      blogPostList: [],
      blogPostKey: (country && country.blogPostKey) || null,
      date: convertTimestamp(country ? country.date : Math.floor(Date.now() / 1000), 'yyyy-mm-dd'),
      description: (country && country.description) || '',
      filePath: (country && country.photoPath) || null,
      iso: ((country && country.iso) || '').toUpperCase(),
      magnet: !!(country && country.magnet),
      name: (country && country.name) || '',
      progress: null
    };
  }

  componentDidMount = () => {
    const db = getDatabase();
    onValue(databaseRef(db, 'blog'), snapshot => {
      const payload = snapshot.val() || {};
      const blogPostList = Object.keys(payload)
            .sort((a, b) => payload[b].timestamp - payload[a].timestamp)
            .map(key => Object.assign({key}, payload[key]));
      this.setState({
        blogPostList
      });
    }, { onlyOnce: true });
  }

  onChange = (e, key) => {
    this.setState({
      [key]: e.target.value
    });
  }

  onFileUpload = (e) => {
    const file = e.target.files[0];
    const storage = getStorage();
    const fileRef = storageRef(storage, `country/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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

  onPhotoDelete = () => {
    const urlTokens = decodeURIComponent(this.state.filePath).split('/');
    const fileName = urlTokens[urlTokens.length - 1].split('?')[0];
    const storage = getStorage();
    const fileRef = storageRef(storage, `country/${fileName}`);
    deleteObject(fileRef).then(() => {
      this.setState({
        filePath: null
      });
      if (this.props.country) {
        const db = getDatabase();
        const photoRef = databaseRef(db, `country/${this.props.country.key}/photoPath`);
        set(photoRef, null);
      }
    });
  }

  onSubmit = () => {
    if (!this.state.name) {
      return;
    }
    const country = this.props.country;
    const key = (country && country.key) || this.state.name.replace(/\s+/g, '-').toLowerCase();
    const db = getDatabase();
    set(databaseRef(db, `country/${key}`), {
      name: this.state.name,
      date: Math.floor(Date.parse(this.state.date) / 1000) || 0,
      photoPath: this.state.filePath || '',
      iso: this.state.iso || '',
      magnet: this.state.magnet,
      blogPostKey: this.state.blogPostKey || null,
      description: this.state.description || '',
      timestamp: (country && country.timestamp) || Math.floor(Date.now() / 1000)
    }).then(() => this.props.onClose()).catch(console.log);
  }

  renderPhotoField = () => {
    if (this.state.progress !== null) {
      return <progress value={this.state.progress} max='100' />;
    }
    if (this.state.filePath) {
      return (
        <div className='photo-box'>
          <img src={this.state.filePath} alt={this.state.name} />
          <button className='remove' onClick={this.onPhotoDelete}>✕ Remove photo</button>
        </div>
      );
    }
    return <input type='file' accept='image/*' onChange={this.onFileUpload} />;
  }

  render = () => {
    const selectedPost = this.state.blogPostList.find(post => post.key === this.state.blogPostKey);
    const postOptionList = [{ key: '', title: 'None' }, ...this.state.blogPostList];
    return (
      <Dialog kicker='Countries log' title={this.props.country ? `Edit ${this.props.country.name}` : 'Add a country'} onClose={this.props.onClose}>
        <div className='dialog-body'>
          <div className='field-grid country-row'>
            <div className='field'>
              <label>Country</label>
              <input value={this.state.name} placeholder='Country name ...' onChange={e => this.onChange(e, 'name')} />
            </div>
            <div className='field'>
              <label>ISO code</label>
              <input value={this.state.iso} placeholder='CZ' maxLength='2' onChange={e => this.setState({iso: e.target.value.toUpperCase()})} />
            </div>
            <div className='field'>
              <label>Date visited</label>
              <input type='date' value={this.state.date} onChange={e => this.onChange(e, 'date')} />
            </div>
          </div>
          <div className='field'>
            <label>Short note</label>
            <textarea rows='3' placeholder='Impression of the country ...' value={this.state.description} onChange={e => this.onChange(e, 'description')} />
          </div>
          <div className='field-grid souvenir-row'>
            <div className='field'>
              <label>Related blog post</label>
              <Dropdown selected={selectedPost ? selectedPost.title : 'None'} optionList={postOptionList} select={post => this.setState({ blogPostKey: post.key || null })} />
            </div>
            <div className='field'>
              <label>Souvenir</label>
              <div className='type-chips'>
                <button className={classNames('chip', {selected: this.state.magnet})} onClick={() => this.setState({magnet: !this.state.magnet})}>★ Fridge magnet</button>
              </div>
            </div>
          </div>
          <div className='field'>
            <label>Cover photo</label>
            {this.renderPhotoField()}
          </div>
        </div>
        <div className='dialog-foot'>
          <button onClick={this.props.onClose}>Cancel</button>
          <button className='primary' disabled={!this.state.name} onClick={this.onSubmit}>Save country</button>
        </div>
      </Dialog>
    )
  }

}

export default CountryDialog;
