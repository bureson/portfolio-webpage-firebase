import { Component } from 'react';
import { Link } from 'react-router-dom';
import { Converter } from 'showdown';

import { convertTimestamp, readingTime } from '../lib/Shared';

class Blog extends Component {
  render = () => {
    const post = this.props.post;
    const mdConverter = new Converter({
        noHeaderId: true,
        underline: true,
        openLinksInNewWindow: true
    });
    const perexHtml = mdConverter.makeHtml(post.perex);
    return (
      <div className='blog-post'>
        <h2>{!post.public && '*'}<Link to={`/blog/${post.key}`}>{post.title}</Link></h2>
        <p><strong>Posted in {convertTimestamp(post.timestamp)}, reading time ~{readingTime(post.body)} minutes</strong></p>
        <div dangerouslySetInnerHTML={{__html: perexHtml}} />
    </div>
    )
  }
}

export default Blog;
