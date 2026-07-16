import React, { Component, Suspense } from 'react';
import { getDatabase, ref as databaseRef, onValue, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Converter } from 'showdown';

import Dropdown from '../components/Dropdown';
import Loader from '../components/Loader';
import NoMatch from '../components/NoMatch';
import { classNames, convertTimestamp } from '../lib/Shared';
import { statusList, statusLabel } from '../lib/Projects';

// Note: CodeMirror is admin-only, keep it out of the visitor bundle
const MarkdownEditor = React.lazy(() => import('../components/MarkdownEditor'));

const AUTOSAVE_DELAY = 2000;

class EditProject extends Component {

  constructor(props) {
    super(props);
    this.editorRef = React.createRef();
    this.imageInputRef = React.createRef();
    this.galleryInputRef = React.createRef();
    this.state = {
      authed: props.authed,
      appUrl: '',
      blogList: [],
      body: '',
      desc: '',
      dirty: false,
      dragIndex: null,
      gallery: [],
      galleryProgress: null,
      imageProgress: null,
      key: props.match.params.project,
      loading: true,
      milestoneDate: '',
      milestoneTitle: '',
      milestones: [],
      notFound: false,
      postKeys: [],
      public: false,
      repoUrl: '',
      saving: false,
      status: 'alive',
      tech: '',
      timestamp: null,
      title: '',
      view: 'write',
      years: ''
    };
  }

  componentDidMount = () => {
    const db = getDatabase();
    onValue(databaseRef(db, 'project/' + this.state.key), snapshot => {
      const payload = snapshot.val();
      if (payload) {
        document.title = `Edit ${payload.title} | Ondrej Bures`;
        this.setState({
          loading: false,
          title: payload.title,
          desc: payload.desc || '',
          body: payload.body || '',
          status: payload.status || 'alive',
          years: payload.years || '',
          appUrl: payload.appUrl || '',
          repoUrl: payload.repoUrl || '',
          tech: Array.isArray(payload.tech) ? payload.tech.join(', ') : payload.tech || '',
          gallery: payload.gallery || [],
          milestones: payload.milestones || [],
          postKeys: payload.postKeys || [],
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
    onValue(databaseRef(db, 'blog'), snapshot => {
      const payload = snapshot.val() || {};
      const blogList = Object.keys(payload)
            .sort((a, b) => payload[b].timestamp - payload[a].timestamp)
            .map(key => Object.assign({key}, payload[key]));
      this.setState({
        blogList
      });
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
    // Note: the editor handles Ctrl+S itself, this covers the rail fields
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
    return set(databaseRef(db, `project/${this.state.key}`), {
      title: this.state.title,
      desc: this.state.desc || '',
      body: this.state.body || '',
      status: this.state.status,
      years: this.state.years || '',
      appUrl: this.state.appUrl || '',
      repoUrl: this.state.repoUrl || '',
      tech: this.state.tech || '',
      gallery: this.state.gallery,
      milestones: this.state.milestones,
      postKeys: this.state.postKeys,
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
    result && result.then(saved => saved && this.props.history.push(`/projects/${this.state.key}`));
  }

  onTogglePublish = () => {
    this.setState({
      public: !this.state.public,
      dirty: true
    }, this.save);
  }

  uploadImage = (file, path, onProgress) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const fileRef = storageRef(storage, `${path}/${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);
      uploadTask.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(progress));
        }, reject, () => {
          getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
        }
      );
    });
  }

  onImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = null;
    this.uploadImage(file, 'project-image', progress => this.setState({imageProgress: progress}))
      .then(url => {
        this.setState({imageProgress: null});
        const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
        if (this.editorRef.current) {
          this.editorRef.current.insertBlock(`![${alt}](${url})`);
        }
      })
      .catch(error => {
        console.log(error); // Note: eventually handle error
        this.setState({imageProgress: null});
      });
  }

  onGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    e.target.value = null;
    if (!files.length) return;
    // uploads run one after another so the gallery keeps the picked order
    const uploadNext = (queue) => {
      if (!queue.length) {
        this.setState({galleryProgress: null});
        return;
      }
      const [file, ...rest] = queue;
      this.uploadImage(file, 'project-gallery', progress => this.setState({galleryProgress: progress}))
        .then(url => {
          this.onChange('gallery', [...this.state.gallery, url]);
          uploadNext(rest);
        })
        .catch(error => {
          console.log(error); // Note: eventually handle error
          this.setState({galleryProgress: null});
        });
    };
    this.setState({galleryProgress: 0});
    uploadNext(files);
  }

  onGalleryRemove = (index) => {
    const urlTokens = decodeURIComponent(this.state.gallery[index]).split('/');
    const fileName = urlTokens[urlTokens.length - 1].split('?')[0];
    const storage = getStorage();
    deleteObject(storageRef(storage, `project-gallery/${fileName}`)).catch(console.log);
    this.onChange('gallery', this.state.gallery.filter((url, i) => i !== index));
  }

  onDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    this.setState({ dragIndex: index });
  }

  onDragOver = (e, index) => {
    e.preventDefault();
    this.setState(state => {
      if (state.dragIndex === null || state.dragIndex === index) {
        return null;
      }
      const gallery = [...state.gallery];
      const [moved] = gallery.splice(state.dragIndex, 1);
      gallery.splice(index, 0, moved);
      return { gallery, dragIndex: index, dirty: true };
    });
  }

  onDragEnd = () => {
    if (this.state.dragIndex !== null) {
      this.setState({ dragIndex: null });
      this.scheduleSave();
    }
  }

  onAddMilestone = () => {
    const title = this.state.milestoneTitle.trim();
    if (!title) return;
    const milestone = { title, date: this.state.milestoneDate.trim() };
    this.setState({milestoneTitle: '', milestoneDate: ''});
    // newest on top, matching the public timeline
    this.onChange('milestones', [milestone, ...this.state.milestones]);
  }

  autoGrow = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight + 2) + 'px'; // + border (box-sizing: border-box)
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
        <button title='Quote' onClick={() => editor() && editor().prefixLine('> ')}>" "</button>
        <button title='Link' onClick={() => editor() && editor().insertLink()}>[link]</button>
        {isUploading
          ? <progress value={this.state.imageProgress} max='100' />
          : <button className='image' title='Upload an image and insert it at the cursor' onClick={() => this.imageInputRef.current.click()}>⇧ image</button>}
        <input type='file' accept='image/*' ref={this.imageInputRef} style={{display: 'none'}} onChange={this.onImageUpload} />
        <div className='note'>markdown · the story on the public page</div>
      </div>
    )
  }

  renderStatusRow = () => {
    const optionList = statusList.map(status => ({key: status.key, title: status.label}));
    return (
      <div className='switch-row'>
        <span>Status</span>
        <Dropdown selected={<span className={`status-pill ${this.state.status}`}>{statusLabel(this.state.status)} ▾</span>}
                  optionList={optionList} select={option => this.onChange('status', option.key)} />
      </div>
    )
  }

  renderGalleryField = () => {
    return (
      <div className='field'>
        <label>Gallery</label>
        <div className='gallery-grid'>
          {this.state.gallery.map((url, index) => {
            return (
              <div key={url} className={classNames('tile', {dragging: index === this.state.dragIndex})} draggable
                   onDragStart={e => this.onDragStart(e, index)} onDragOver={e => this.onDragOver(e, index)}
                   onDragEnd={this.onDragEnd}>
                <img src={url} alt='' />
                {index === 0 && <span className='cover'>cover</span>}
                <button className='remove' title='Remove' onClick={() => this.onGalleryRemove(index)}>✕</button>
              </div>
            )
          })}
          {this.state.galleryProgress !== null
            ? <div className='tile add'><progress value={this.state.galleryProgress} max='100' /></div>
            : <button className='tile add' onClick={() => this.galleryInputRef.current.click()}>⇧ add</button>}
        </div>
        <input type='file' accept='image/*' multiple ref={this.galleryInputRef} style={{display: 'none'}} onChange={this.onGalleryUpload} />
        <div className='hint'>drag to reorder · first is the cover</div>
      </div>
    )
  }

  renderMilestonesField = () => {
    return (
      <div className='field'>
        <label>Milestones</label>
        <div className='milestone-rows'>
          {this.state.milestones.map((milestone, index) => {
            return (
              <div className='row' key={index}>
                <span className='name'>{milestone.title}</span>
                <span className='right'>
                  {milestone.date && <span className='date'>{milestone.date}</span>}
                  <button title='Remove' onClick={() => this.onChange('milestones', this.state.milestones.filter((m, i) => i !== index))}>✕</button>
                </span>
              </div>
            )
          })}
          <div className='row add'>
            <input placeholder='What happened ...' value={this.state.milestoneTitle}
                   onChange={e => this.setState({milestoneTitle: e.target.value})}
                   onKeyDown={e => e.key === 'Enter' && this.onAddMilestone()} />
            <input className='date' placeholder='Feb 2025' value={this.state.milestoneDate}
                   onChange={e => this.setState({milestoneDate: e.target.value})}
                   onKeyDown={e => e.key === 'Enter' && this.onAddMilestone()} />
            <button title='Add milestone' disabled={!this.state.milestoneTitle.trim()} onClick={this.onAddMilestone}>+</button>
          </div>
        </div>
      </div>
    )
  }

  renderPostsField = () => {
    const linked = this.state.postKeys
          .map(key => this.state.blogList.find(post => post.key === key))
          .filter(Boolean);
    const available = this.state.blogList.filter(post => !this.state.postKeys.includes(post.key));
    return (
      <div className='field'>
        <label>Linked posts</label>
        <div className='milestone-rows'>
          {linked.map(post => {
            return (
              <div className='row' key={post.key}>
                <span className='name'>{post.title}</span>
                <span className='right'>
                  <button title='Unlink' onClick={() => this.onChange('postKeys', this.state.postKeys.filter(key => key !== post.key))}>✕</button>
                </span>
              </div>
            )
          })}
        </div>
        {available.length > 0 && <Dropdown selected='+ link a blog post'
                                           optionList={available.map(post => ({key: post.key, title: post.title}))}
                                           select={option => this.onChange('postKeys', [...this.state.postKeys, option.key])} />}
        <div className='hint'>shown as “from the blog” on the public page</div>
      </div>
    )
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
    return (
      <div className='page editor-page'>
        <div className='editor-topbar'>
          <div className='left'>
            <p className='kicker'>Editing project</p>
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
            <input className='editor-title' placeholder='Project name ...' value={this.state.title}
                   onChange={e => this.onChange('title', e.target.value)} />
            <div className='editor-slug'>{window.location.host}/projects/<span className='slug'>{this.state.key}</span></div>
            <textarea className='editor-perex' rows='1' placeholder='Perex — short teaser shown on the projects list ...'
                      value={this.state.desc} ref={this.autoGrow}
                      onChange={e => { this.autoGrow(e.target); this.onChange('desc', e.target.value); }} />
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
              {this.renderStatusRow()}
              <div className='switch-row'>
                <span>Public</span>
                <button className={classNames('switch', {on: this.state.public})} aria-label='Toggle public'
                        onClick={this.onTogglePublish} />
              </div>
            </div>
            <div className='field'>
              <label>Years</label>
              <input placeholder='2023 — now' value={this.state.years}
                     onChange={e => this.onChange('years', e.target.value)} />
            </div>
            <div className='field'>
              <label>App link</label>
              <input placeholder='https://...' value={this.state.appUrl}
                     onChange={e => this.onChange('appUrl', e.target.value)} />
            </div>
            <div className='field'>
              <label>Repository link</label>
              <input placeholder='https://github.com/...' value={this.state.repoUrl}
                     onChange={e => this.onChange('repoUrl', e.target.value)} />
            </div>
            <div className='field'>
              <label>Tech</label>
              <input placeholder='React, Firebase, ...' value={this.state.tech}
                     onChange={e => this.onChange('tech', e.target.value)} />
              <div className='hint'>comma separated · shown as chips</div>
            </div>
            {this.renderGalleryField()}
            {this.renderMilestonesField()}
            {this.renderPostsField()}
            <div className='stats'>
              {this.state.timestamp && <div>created {convertTimestamp(this.state.timestamp, 'dd:mm:yyyy')}</div>}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default EditProject;
