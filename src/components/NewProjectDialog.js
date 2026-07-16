import React, { Component } from 'react';
import { getDatabase, ref, set } from 'firebase/database';

import Dialog from './Dialog';
import { slugify } from '../lib/Shared';

class NewProjectDialog extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: ''
    };
  }

  onCreate = () => {
    const title = this.state.title.trim();
    const slug = slugify(title);
    if (!slug || this.props.existingKeys.includes(slug)) {
      return;
    }
    const db = getDatabase();
    set(ref(db, `project/${slug}`), {
      title,
      desc: '',
      body: '',
      status: 'alive',
      years: '',
      appUrl: '',
      repoUrl: '',
      public: false,
      timestamp: Math.floor(Date.now() / 1000)
    }).then(() => {
      this.props.history.push(`/projects/${slug}/edit`);
    }).catch(console.log);
  }

  onKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.onCreate();
    }
  }

  render = () => {
    const slug = slugify(this.state.title);
    const taken = !!slug && this.props.existingKeys.includes(slug);
    return (
      <Dialog kicker='Projects' title='New project' onClose={this.props.onClose}>
        <div className='dialog-body'>
          <div className='field'>
            <label>Name</label>
            <input autoFocus value={this.state.title} placeholder='Project name ...'
                   onChange={e => this.setState({title: e.target.value})} onKeyDown={this.onKeyDown} />
            <div className='slug-preview'>{window.location.host}/projects/<span className='slug'>{slug || '…'}</span></div>
            {taken && <p className='did-you-mean'>A project with this URL already exists.</p>}
          </div>
        </div>
        <div className='dialog-foot'>
          <div className='note'>starts as a private draft</div>
          <button onClick={this.props.onClose}>Cancel</button>
          <button className='primary' disabled={!slug || taken} onClick={this.onCreate}>Create &amp; write →</button>
        </div>
      </Dialog>
    )
  }

}

export default NewProjectDialog;
