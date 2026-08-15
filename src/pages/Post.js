import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { readingTime, convertTimestamp, getBlogPostKeys } from '../lib/Shared';
import { createConverter } from '../lib/Markdown';
import LazyPhoto from '../components/LazyPhoto';
import Loader from '../components/Loader';
import NoMatch from '../components/NoMatch';

class Post extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      blogList: [],
      countryList: [],
      post: null,
      loading: true
    }
  }

  componentDidMount = () => {
    this.loadData(this.props.match.params.post);
    const db = getDatabase();
    onValue(ref(db, 'blog'), snapshot => {
      const payload = snapshot.val() || {};
      const blogList = Object.keys(payload)
            .sort((a, b) => payload[b].timestamp - payload[a].timestamp)
            .map(key => Object.assign({key}, payload[key]));
      this.setState({
        blogList
      });
    }, { onlyOnce: true });
  }

  componentDidUpdate = (prevProps) => {
    if (this.state.authed !== this.props.authed) {
      this.setState({
        authed: this.props.authed
      });
    }
    if (prevProps.match.params.post !== this.props.match.params.post) {
      this.setState({
        loading: true
      });
      this.loadData(this.props.match.params.post);
    }
  }

  loadData = (postKey) => {
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
    }, { onlyOnce: true });
    // the country list is small, so the reverse lookup filters client-side
    onValue(ref(db, 'country'), snapshot => {
      const payload = snapshot.val() || {};
      const countryList = Object.keys(payload)
            .map(key => Object.assign({key}, payload[key]))
            .filter(country => getBlogPostKeys(country).includes(postKey));
      this.setState({
        countryList
      });
    }, { onlyOnce: true });
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

  renderMetaRow = (post, withControls) => {
    return (
      <div className='meta-row'>
        <p className='kicker'>{convertTimestamp(post.timestamp)} · ~{readingTime(post.body)} min read</p>
        {withControls && this.renderControls(post)}
      </div>
    )
  }

  renderControls = (post) => {
    if (!this.state.authed) return null;
    return (
      <div className='controls'>
        <Link to={`/blog/${post.key}/edit`}><button><FontAwesomeIcon icon={faEdit} /></button></Link>
        <button onClick={this.onDelete}><FontAwesomeIcon icon={faTrash} /></button>
      </div>
    )
  }

  renderTitle = (post) => {
    return (
      <h2 className='post-title'>{post.title}{!post.public && <span className='draft-pill'>draft</span>}</h2>
    )
  }

  renderChips = () => {
    if (!this.state.countryList.length) return null;
    return (
      <div className='country-chips'>
        {this.state.countryList.map(country => {
          return (
            <Link className='chip' to={`/countries/${country.key}`} key={country.key}>
              <span className='code'>{(country.iso || '').toUpperCase()}</span>{country.name}
            </Link>
          )
        })}
      </div>
    )
  }

  render = () => {
    if (this.state.loading) {
      return <Loader />
    }
    if (!this.state.post) {
      return <NoMatch />
    }
    const post = this.state.post;
    const mdConverter = createConverter();
    const perexHtml = mdConverter.makeHtml(post.perex);
    const bodyHtml = mdConverter.makeHtml(post.body);
    const availablePostList = this.state.authed ? this.state.blogList : this.state.blogList.filter(p => p.public);
    const index = availablePostList.findIndex(p => p.key === post.key);
    const newer = index > 0 ? availablePostList[index - 1] : null;
    const older = index >= 0 && index < availablePostList.length - 1 ? availablePostList[index + 1] : null;
    return (
      <div className='page post-page'>
        {post.coverPath
          ? <div className='post-hero'>
              <LazyPhoto className='photo' src={post.coverPath} />
              <div className='shade'></div>
              {this.renderControls(post)}
              <div className='hero-overlay'>
                {this.renderMetaRow(post)}
                {this.renderTitle(post)}
                {this.renderChips()}
              </div>
            </div>
          : <div className='post-head'>
              {this.renderMetaRow(post, true)}
              {this.renderTitle(post)}
              {this.renderChips()}
            </div>}
        <div className='post-column'>
          {post.perex && <div className='perex' dangerouslySetInnerHTML={{__html: perexHtml}} />}
          <div className='post-body' dangerouslySetInnerHTML={{__html: bodyHtml}} />
          {(older || newer) && <div className='post-nav'>
            {older
              ? <Link className='prev' to={`/blog/${older.key}`}>
                  <div className='label'>← previous</div>
                  <div className='name'>{older.title}</div>
                </Link>
              : <div />}
            {newer && <Link className='next' to={`/blog/${newer.key}`}>
              <div className='label'>next →</div>
              <div className='name'>{newer.title}</div>
            </Link>}
          </div>}
        </div>
      </div>
    )
  }
}

export default Post;
