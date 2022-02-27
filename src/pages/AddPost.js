import React, { Component } from 'react';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import { Converter } from 'showdown';

import Attachments from '../components/Attachments';
import NoMatch from '../components/NoMatch';

class AddPost extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      key: null,
      title: '',
      perex: '',
      body: '',
      preview: false,
      public: false,
      timestamp: null
    }
  }

  componentDidMount = () => {
    const postKey = this.props.match.params.post;
    if (postKey) {
      const db = getDatabase();
      const postRef = ref(db, 'blog/' + postKey);
      onValue(postRef, snapshot => {
        const payload = snapshot.val();
        if (payload) {
          document.title = `Edit ${payload.title} | Ondrej Bures`;
          this.setState({
            key: postKey,
            loading: false,
            title: payload.title,
            perex: payload.perex,
            body: payload.body,
            public: payload.public,
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

  onSubmit = (e) => {
    e.preventDefault();
    const key = this.state.key || this.state.title.replace(/\s+/g, '-').toLowerCase();
    const db = getDatabase();
    set(ref(db, `blog/${key}`), {
      title: this.state.title,
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
    return (
      <div>
        <h2>Add post</h2>
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
            <label htmlFor='public'>Public</label>
            <input id='public' type='checkbox' checked={this.state.public} onChange={e => this.onToggle(e, 'public')} />
          </div>
          <div className='input-group'>
            <label htmlFor='public'>Preview</label>
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
