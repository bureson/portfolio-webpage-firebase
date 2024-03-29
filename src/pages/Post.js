import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/fontawesome-free-solid';
import { Converter } from 'showdown';

import { readingTime, convertTimestamp } from '../lib/Shared';
import Loader from '../components/Loader';
import NoMatch from '../components/NoMatch';

class Post extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      post: null,
      loading: true
    }
  }

  componentDidMount = () => {
    const postKey = this.props.match.params.post;
    const db = getDatabase();
    const postRef = ref(db, 'blog/' + postKey);
    onValue(postRef, snapshot => {
      const payload = snapshot.val();
      document.title = `${payload ? payload.title : 'Not found'} | Ondrej Bures`;
      this.setState({
        post: payload ? Object.assign({
          key: postKey
        }, payload) : null,
        loading: false
      });
    });
  }

  componentDidUpdate = () => {
    if (this.state.authed !== this.props.authed) {
      this.setState({
        authed: this.props.authed
      });
    }
  }

  onDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to remove the post?')) {
      const db = getDatabase();
      const postKey = this.state.post.key;
      const postRef = ref(db, 'blog/' + postKey);
      remove(postRef);
      this.props.history.push('/blog');
    }
  }

  render = () => {
    if (this.state.loading) {
      return <Loader />
    }
    if (!this.state.post) {
      return <NoMatch />
    }
    const mdConverter = new Converter({
      noHeaderId: true,
      underline: true,
      openLinksInNewWindow: true
    });
    const perexHtml = mdConverter.makeHtml(this.state.post.perex);
    const bodyHtml = mdConverter.makeHtml(this.state.post.body);
    return (
      <div className='page blog-item'>
        <h2>{this.state.post.title}</h2>
        <div className='page-header'>
          <div className='page-info'>
            <p><strong>Posted in {convertTimestamp(this.state.post.timestamp)}, reading time ~{readingTime(this.state.post.body)} minutes</strong></p>
          </div>
          {this.state.authed && <div className='page-controls'>
            <Link to={`/blog/${this.state.post.key}/edit`}><button><FontAwesomeIcon icon={faEdit} /></button></Link>
            <button onClick={this.onDelete}><FontAwesomeIcon icon={faTrash} /></button>
          </div>}
        </div>
        <div><em dangerouslySetInnerHTML={{__html: perexHtml}} /></div>
        <div dangerouslySetInnerHTML={{__html: bodyHtml}} />
      </div>
    )
  }
}

export default Post;
