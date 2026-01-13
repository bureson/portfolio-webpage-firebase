import { Component } from 'react';
import { Link } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';

import Loader from '../components/Loader';
import PostPreview from '../components/PostPreview';

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
    return (
      <div>
        {availablePostList.map((post, index) => {
          return <PostPreview key={post.key} post={post} />
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
