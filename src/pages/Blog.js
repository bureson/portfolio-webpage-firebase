import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';
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
    const db = getDatabase();
    const blogRef = ref(db, 'blog');
    onValue(blogRef, snapshot => {
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

  componentDidUpdate = () => {
    if (this.state.authed !== this.props.authed) {
      this.setState({
        authed: this.props.authed
      });
    }
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
            <div key={index} className='blog-post'>
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
          <p>
            Feel free to read through a total of {availablePostList.length} stories that were significant and memorable enough in my life
            &nbsp;to make me make an effort of writing them down.
          </p>
          <div className='page-info'></div>
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
