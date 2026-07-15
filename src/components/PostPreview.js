import { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Converter } from 'showdown';

import { convertTimestamp, readingTime } from '../lib/Shared';
import LazyPhoto from './LazyPhoto';

class PostPreview extends Component {

  navigate = (e) => {
    // Note: let actual links (post title, markdown links in the perex) handle themselves
    if (e.target.closest('a')) return;
    this.props.history.push(`/blog/${this.props.post.key}`);
  }

  render = () => {
    const post = this.props.post;
    const mdConverter = new Converter({
        noHeaderId: true,
        underline: true,
        openLinksInNewWindow: true
    });
    const perexHtml = mdConverter.makeHtml(post.perex);
    if (this.props.featured) {
      return (
        <div className='blog-featured' onClick={this.navigate}>
          <div className='info'>
            <p className='kicker'>{this.props.label || 'Latest'} · {convertTimestamp(post.timestamp)} · ~{readingTime(post.body)} min read</p>
            <Link className='row-link' to={`/blog/${post.key}`}>
              <div className='title'>{post.title}{!post.public && <span className='draft-pill'>draft</span>}</div>
            </Link>
            <div className='excerpt' dangerouslySetInnerHTML={{__html: perexHtml}} />
            <Link className='more' to={`/blog/${post.key}`}>Read the post →</Link>
          </div>
          {!this.props.hideCover && post.coverPath && <Link className='row-link cover-link' to={`/blog/${post.key}`}>
            <LazyPhoto className='cover' src={post.coverPath} />
          </Link>}
        </div>
      )
    }
    return (
      <div className='blog-row' onClick={this.navigate}>
        <div className='date'>{convertTimestamp(post.timestamp)}</div>
        <div className='info'>
          <Link className='row-link' to={`/blog/${post.key}`}>
            <div className='title'>{post.title}{!post.public && <span className='draft-pill'>draft</span>}</div>
          </Link>
          <div className='excerpt' dangerouslySetInnerHTML={{__html: perexHtml}} />
        </div>
        <div className='pill'>~{readingTime(post.body)} min</div>
      </div>
    )
  }
}

export default withRouter(PostPreview);
