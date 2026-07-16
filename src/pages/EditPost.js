import React, { Component, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { getDatabase, ref as databaseRef, onValue, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Converter } from 'showdown';

import Attachments from '../components/Attachments';
import Loader from '../components/Loader';
import NoMatch from '../components/NoMatch';
import { classNames, convertTimestamp, readingTime } from '../lib/Shared';
import { uploadAttachment, isImage } from '../lib/Storage';

// Note: CodeMirror is admin-only, keep it out of the visitor bundle
const MarkdownEditor = React.lazy(() => import('../components/MarkdownEditor'));

const AUTOSAVE_DELAY = 2000;

class EditPost extends Component {

  constructor(props) {
    super(props);
    this.editorRef = React.createRef();
    this.imageInputRef = React.createRef();
    this.coverInputRef = React.createRef();
    this.state = {
      authed: props.authed,
      body: '',
      coverPath: null,
      coverProgress: null,
      dirty: false,
      imageProgress: null,
      key: props.match.params.post,
      loading: true,
      notFound: false,
      perex: '',
      public: false,
      saving: false,
      timestamp: null,
      title: '',
      view: 'write'
    };
  }

  componentDidMount = () => {
    const db = getDatabase();
    const postRef = databaseRef(db, 'blog/' + this.state.key);
    onValue(postRef, snapshot => {
      const payload = snapshot.val();
      if (payload) {
        document.title = `Edit ${payload.title} | Ondrej Bures`;
        this.setState({
          loading: false,
          title: payload.title,
          coverPath: payload.coverPath || null,
          perex: payload.perex || '',
          body: payload.body || '',
          public: !!payload.public,
          timestamp: payload.timestamp
        });
      } else {
        document.title = 'Not found | Ondrej Bures';
        this.setState({
          loading: false,
          notFound: true
        });
      }
    }, { onlyOnce: true });
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('beforeunload', this.onBeforeUnload);
  }

  componentDidUpdate = () => {
    if (this.state.authed !== this.props.authed) {
      this.setState({
        authed: this.props.authed
      });
    }
  }

  componentWillUnmount = () => {
    clearTimeout(this.saveTimer);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('beforeunload', this.onBeforeUnload);
    if (this.state.dirty) {
      this.save();
    }
  }

  onKeyDown = (e) => {
    // Note: the editor handles Ctrl+S itself, this covers title/perex focus
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      this.save();
    }
  }

  onBeforeUnload = (e) => {
    if (this.state.dirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  }

  onChange = (key, value) => {
    this.setState({
      [key]: value,
      dirty: true
    }, this.scheduleSave);
  }

  scheduleSave = () => {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(this.save, AUTOSAVE_DELAY);
  }

  // resolves with true when the write succeeded, so callers can chain navigation
  save = () => {
    clearTimeout(this.saveTimer);
    if (this.state.notFound || this.state.loading) {
      return;
    }
    this.setState({saving: true});
    const db = getDatabase();
    return set(databaseRef(db, `blog/${this.state.key}`), {
      title: this.state.title,
      coverPath: this.state.coverPath || '',
      perex: this.state.perex || '',
      body: this.state.body || '',
      public: this.state.public,
      timestamp: this.state.timestamp || Math.floor(Date.now() / 1000)
    }).then(() => {
      this.setState({
        dirty: false,
        saving: false
      });
      return true;
    }).catch(error => {
      console.log(error);
      this.setState({saving: false});
      return false;
    });
  }

  onSaveAndClose = () => {
    const result = this.save();
    result && result.then(saved => saved && this.props.history.push(`/blog/${this.state.key}`));
  }

  onTogglePublish = () => {
    this.setState({
      public: !this.state.public,
      dirty: true
    }, this.save);
  }

  onCoverUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const storage = getStorage();
    const fileRef = storageRef(storage, `blog-cover/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);
    uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.setState({
          coverProgress: Math.round(progress)
        });
      }, (error) => {
        console.log(error); // Note: eventually handle error
        this.setState({coverProgress: null});
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then(coverPath => {
          this.setState({coverProgress: null});
          this.onChange('coverPath', coverPath);
        });
      }
    );
  }

  onCoverDelete = () => {
    const urlTokens = decodeURIComponent(this.state.coverPath).split('/');
    const fileName = urlTokens[urlTokens.length - 1].split('?')[0];
    const storage = getStorage();
    const fileRef = storageRef(storage, `blog-cover/${fileName}`);
    deleteObject(fileRef).then(() => {
      this.onChange('coverPath', null);
    });
  }

  onImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = null;
    uploadAttachment(file, this.state.key, progress => this.setState({imageProgress: progress}))
      .then(attachment => {
        this.setState({imageProgress: null});
        this.insertAttachment(attachment);
      })
      .catch(error => {
        console.log(error); // Note: eventually handle error
        this.setState({imageProgress: null});
      });
  }

  autoGrow = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight + 2) + 'px'; // + border (box-sizing: border-box)
  }

  insertAttachment = (attachment) => {
    const alt = attachment.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    const snippet = isImage(attachment.name)
      ? `![${alt}](${attachment.url})`
      : `[${alt}](${attachment.url})`;
    if (this.editorRef.current) {
      this.editorRef.current.insertBlock(snippet);
    }
  }

  renderToolbar = () => {
    const editor = () => this.editorRef.current;
    const isUploading = this.state.imageProgress !== null;
    return (
      <div className='editor-toolbar'>
        <button title='Bold (Ctrl+B)' style={{fontWeight: 700}} onClick={() => editor() && editor().wrapSelection('**')}>B</button>
        <button title='Italic (Ctrl+I)' style={{fontStyle: 'italic'}} onClick={() => editor() && editor().wrapSelection('*')}>I</button>
        <button title='Heading' onClick={() => editor() && editor().prefixLine('### ')}>H3</button>
        <button title='Subheading' onClick={() => editor() && editor().prefixLine('#### ')}>H4</button>
        <button title='Sub-subheading' onClick={() => editor() && editor().prefixLine('##### ')}>H5</button>
        <button title='Quote' onClick={() => editor() && editor().prefixLine('> ')}>" "</button>
        <button title='Link' onClick={() => editor() && editor().insertLink()}>[link]</button>
        {isUploading
          ? <progress value={this.state.imageProgress} max='100' />
          : <button className='image' title='Upload an image and insert it at the cursor' onClick={() => this.imageInputRef.current.click()}>⇧ image</button>}
        <input type='file' accept='image/*' ref={this.imageInputRef} style={{display: 'none'}} onChange={this.onImageUpload} />
        <div className='note'>markdown supported · Ctrl+S saves</div>
      </div>
    )
  }

  renderCoverField = () => {
    let field = <button className='upload' onClick={() => this.coverInputRef.current.click()}>+ Upload cover</button>;
    if (this.state.coverProgress !== null) {
      field = <progress value={this.state.coverProgress} max='100' />;
    } else if (this.state.coverPath) {
      field = (
        <div className='photo-box'>
          <img src={this.state.coverPath} alt={this.state.title} />
          <button className='remove' onClick={this.onCoverDelete}>✕ Remove</button>
        </div>
      );
    }
    return (
      <>
        {field}
        <input type='file' accept='image/*' ref={this.coverInputRef} style={{display: 'none'}} onChange={this.onCoverUpload} />
      </>
    );
  }

  render = () => {
    if (!this.state.authed || this.state.notFound) {
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
    const view = this.state.view;
    const showEditor = view === 'write' || view === 'split';
    const showPreview = view === 'preview' || view === 'split';
    const wordCount = this.state.body.trim() ? this.state.body.trim().split(/\s+/).length : 0;
    return (
      <div className='page editor-page'>
        <div className='editor-topbar'>
          <div className='left'>
            <p className='kicker'>Editing post</p>
          </div>
          <div className='right'>
            <div className='view-toggle'>
              {['write', 'split', 'preview'].map(option => {
                return (
                  <button key={option} className={classNames({active: view === option})}
                          onClick={() => this.setState({view: option})}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <div className='editor-grid'>
          <div className='editor-main'>
            <input className='editor-title' placeholder='Post title ...' value={this.state.title}
                   onChange={e => this.onChange('title', e.target.value)} />
            <textarea className='editor-perex' rows='1' placeholder='Perex — short teaser shown on the blog index ...'
                      value={this.state.perex} ref={this.autoGrow}
                      onChange={e => { this.autoGrow(e.target); this.onChange('perex', e.target.value); }} />
            {showEditor && this.renderToolbar()}
            <div className={classNames({'editor-split': view === 'split'})}>
              {showEditor && <Suspense fallback={<Loader />}>
                <MarkdownEditor ref={this.editorRef} value={this.state.body}
                                onChange={body => this.onChange('body', body)} onSave={this.save} />
              </Suspense>}
              {showPreview && <div className='post-body' dangerouslySetInnerHTML={{__html: mdConverter.makeHtml(this.state.body)}} />}
            </div>
          </div>
          <div className='editor-rail'>
            <div className='save-actions'>
              <button onClick={this.save} disabled={this.state.saving}>{this.state.saving ? 'Saving …' : 'Save'}</button>
              <button className='primary' onClick={this.onSaveAndClose} disabled={this.state.saving}>Save &amp; close</button>
            </div>
            <div className='visibility'>
              <div className='switch-row'>
                <span>Public</span>
                <button className={classNames('switch', {on: this.state.public})} aria-label='Toggle public'
                        onClick={this.onTogglePublish} />
              </div>
            </div>
            <div className='field'>
              <label>Cover photo</label>
              {this.renderCoverField()}
              <div className='hint'>optional — post works without it</div>
            </div>
            <Attachments post={this.state.key} onInsert={this.insertAttachment} />
            <div className='stats'>
              <div>{wordCount.toLocaleString('en').replace(/,/g, ' ')} words · ~{readingTime(this.state.body)} min read</div>
              {this.state.timestamp && <div>created {convertTimestamp(this.state.timestamp, 'dd:mm:yyyy')}</div>}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default EditPost;
