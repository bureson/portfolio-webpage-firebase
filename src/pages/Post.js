import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/fontawesome-free-solid';
import { Converter } from 'showdown';

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
    this.postRef = firebase.database().ref('blog').child(postKey);
    this.postRef.on('value', snapshot => {
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

  componentWillUnmount = () => {
    this.postRef.off();
  }

  componentWillReceiveProps = (props) => {
    this.setState({
      authed: props.authed
    });
  }

  convertTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.getMonth()] + ' ' + date.getFullYear();
  }

  onDelete = (e, key) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to remove the post?')) {
      firebase.database().ref('blog').child(key).remove();
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
      <div className='page'>
        <h2>{this.state.post.title}</h2>
        <div className='page-header'>
          <div className='page-info'>
            <p><strong>Posted in {this.convertTimestamp(this.state.post.timestamp)}</strong></p>
          </div>
          {this.state.authed && <div className='page-controls'>
            <Link to={`/blog/${this.state.post.key}/edit`}><button><FontAwesomeIcon icon={faEdit} /></button></Link>
            <button onClick={(e) => this.onDelete(e, this.state.post.key)}><FontAwesomeIcon icon={faTrash} /></button>
          </div>}
        </div>
        <div dangerouslySetInnerHTML={{__html: perexHtml}} />
        <div dangerouslySetInnerHTML={{__html: bodyHtml}} />
      </div>
    )
  }
}

export default Post;
