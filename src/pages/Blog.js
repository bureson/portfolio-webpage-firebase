import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase/app';
import { Converter } from 'showdown';

import { convertTimestamp, readingTime } from '../lib/Shared';
import Loader from '../components/Loader';

class Blog extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      blog: [],
      loading: true
    }
  }

  componentDidMount = () => {
    document.title = 'Blog | Ondrej Bures';
    this.blogRef = firebase.database().ref('blog');
    this.blogRef.on('value', snapshot => {
      const payload = snapshot.val() || {};
      const blog = Object.keys(payload)
            .sort((a, b) => payload[b].timestamp - payload[a].timestamp)
            .map(key => Object.assign({key}, payload[key]));
      this.setState({
        blog,
        loading: false
      });
    });
  }

  componentWillUnmount = () => {
    this.blogRef.off();
  }

  componentWillReceiveProps = (props) => {
    this.setState({
      authed: props.authed
    });
  }

  renderBlog = (availablePostList) => {
    if (this.state.loading) {
      return <Loader />
    }
    const mdConverter = new Converter({
      noHeaderId: true,
      underline: true,
      openLinksInNewWindow: true
    });
    return (
      <div>
        {availablePostList.map((post, index) => {
          const perexHtml = mdConverter.makeHtml(post.perex);
          return (
            <div key={index}>
              <h2>{!post.public && '*'}<Link to={`/blog/${post.key}`}>{post.title}</Link></h2>
              <p><strong>Posted in {convertTimestamp(post.timestamp)}, reading time ~{readingTime(post.body)} minutes</strong></p>
              <div dangerouslySetInnerHTML={{__html: perexHtml}} />
            </div>
          )
        })}
      </div>
    )
  }

  render = () => {
    const availablePostList = this.state.authed ? this.state.blog : this.state.blog.filter(post => post.public);
    return (
      <div className='page'>
        <h2>Blog</h2>
        <div className='page-header'>
          <div className='page-info'>
            List of {availablePostList.length} posts
          </div>
          <div className='page-controls'>
            {this.state.authed && <Link to={'/blog/add'}><button>Add new post</button></Link>}
          </div>
        </div>
        {this.renderBlog(availablePostList)}
      </div>
    )
  }
}

export default Blog;
