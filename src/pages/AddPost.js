import React, { Component } from 'react';
import { getDatabase, ref as databaseRef, onValue, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/fontawesome-free-solid';
import { Converter } from 'showdown';

import Attachments from '../components/Attachments';
import NoMatch from '../components/NoMatch';

class AddPost extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      body: '',
      coverPath: null,
      key: null,
      perex: '',
      preview: false,
      progress: null,
      public: false,
      timestamp: null,
      title: ''
    }
  }

  componentDidMount = () => {
    const postKey = this.props.match.params.post;
    if (postKey) {
      const db = getDatabase();
      const postRef = databaseRef(db, 'blog/' + postKey);
      onValue(postRef, snapshot => {
        const payload = snapshot.val();
        if (payload) {
          document.title = `Edit ${payload.title} | Ondrej Bures`;
          this.setState({
            key: postKey,
            loading: false,
            title: payload.title,
            coverPath: payload.coverPath,
            perex: payload.perex,
            body: payload.body,
            public: payload.public,
            timestamp: payload.timestamp
          });
        }
      });
    } else {
      document.title = 'Add post | Ondrej Bures';
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

  onFileUpload = (e) => {
    const file = e.target.files[0];
    const storage = getStorage();
    const fileRef = storageRef(storage, `blog-cover/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.setState({
          progress: Math.round(progress)
        });
      }, (error) => {
        console.log(error); // Note: eventually handle error
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then(coverPath => {
          this.setState({
            coverPath,
            progress: null
          });
        });
      }
    );
  }

  onDeleteCover = (e) => {
    e.preventDefault();
    const urlTokens = decodeURIComponent(this.state.coverPath).split('/');
    const fileName = urlTokens[urlTokens.length - 1].split('?')[0];
    const storage = getStorage();
    const fileRef = storageRef(storage, `blog-cover/${fileName}`);
    deleteObject(fileRef).then(() => {
      this.setState({
        coverPath: null
      });
      if (this.state.key) {
        const db = getDatabase();
        const coverRef = databaseRef(db, `blog/${this.state.key}/coverPath`);
        set(coverRef, null);
      }
    });
  }

  onSubmit = (e) => {
    e.preventDefault();
    const key = this.state.key || this.state.title.replace(/\s+/g, '-').toLowerCase();
    const db = getDatabase();
    set(databaseRef(db, `blog/${key}`), {
      title: this.state.title,
      coverPath: this.state.coverPath || '',
      perex: this.state.perex || '',
      body: this.state.body || '',
      public: this.state.public,
      timestamp: this.state.timestamp || Math.floor(Date.now() / 1000)
    }).then(() => {
      this.props.history.push(`/blog/${key}`);
    }).catch(console.log);
  }

  onChange = (e, key) => {
    this.setState({
      [key]: e.target.value
    })
  }

  onToggle = (e, key) => {
    this.setState({
      [key]: !this.state[key]
    });
  }

  render = () => {
    if (!this.state.authed) {
      return <NoMatch />
    }
    const mdConverter = new Converter({
      noHeaderId: true,
      underline: true,
      openLinksInNewWindow: true
    });
    const bodyHtml = mdConverter.makeHtml(this.state.body);
    const isUploading = this.state.progress;
    const hasCover = this.state.coverPath;
    return (
      <div className='page'>
        <p className='kicker'>Administration</p>
        <h2>{this.state.key ? 'Edit post' : 'Add post'}</h2>
        <form onSubmit={e => this.onSubmit(e)}>
          <div className='input-group'>
            <label htmlFor='title'>Title</label>
            <input type='text' id='title' placeholder='Title' value={this.state.title} onChange={e => this.onChange(e, 'title')} />
          </div>
          <div className='input-group'>
            <label htmlFor='perex'>Perex</label>
            <textarea id='perex' rows='5' placeholder='Perex' onChange={e => this.onChange(e, 'perex')} value={this.state.perex} />
          </div>
          <div className='input-group'>
            <label htmlFor='cover'>Cover photo</label>
            {!(isUploading || hasCover) && <input type='file' id='cover' onChange={this.onFileUpload} />}
            {isUploading && <progress value={this.state.progress} max='100' />}
            {hasCover && <div className='file-preview'>
              <div className='thumb' style={{backgroundImage: `url(${this.state.coverPath})`}}></div>
              <button onClick={this.onDeleteCover}><FontAwesomeIcon icon={faTrash} /></button>
            </div>}
          </div>
          <div className='input-group'>
            <label htmlFor='public'>Public</label>
            <input id='public' type='checkbox' checked={this.state.public} onChange={e => this.onToggle(e, 'public')} />
          </div>
          <div className='input-group'>
            <label htmlFor='preview'>Preview</label>
            <input id='preview' type='checkbox' checked={this.state.preview} onChange={e => this.onToggle(e, 'preview')} />
          </div>
          {this.state.key && <Attachments post={this.state.key} />}
          <div className='input-group'>
            <label htmlFor='body'>Body</label>
            <textarea id='body' rows='20' placeholder='Body' onChange={e => this.onChange(e, 'body')} value={this.state.body} />
          </div>
          <button type='submit' value='Submit'>Submit</button>
        </form>
        {this.state.preview && <div dangerouslySetInnerHTML={{__html: bodyHtml}} />}
      </div>
    )
  }
}

export default AddPost;
