import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/fontawesome-free-solid';
import { Converter } from 'showdown';

import { convertTimestamp } from '../lib/Shared';
import DiveLog from '../components/DiveLog';
import Loader from '../components/Loader';
import NoMatch from '../components/NoMatch';
import Places from '../components/Places';
import PostPreview from '../components/PostPreview';

class CountryDetail extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      country: null,
      loading: true
    }
  }

  componentDidMount = () => {
    const countryKey = this.props.match.params.country;
    const db = getDatabase();
    const countryRef = ref(db, 'country/' + countryKey);
    onValue(countryRef, snapshot => {
      const countryPayload = snapshot.val();
      document.title = `${countryPayload ? countryPayload.name : 'Not found'} | Ondrej Bures`;
      const postRef = ref(db, 'blog/' + countryPayload.blogPostKey);
      onValue(postRef, snapshot => {
        const postPayload = snapshot.val();
        this.setState({
          country: countryPayload ? Object.assign({
            key: countryKey
          }, countryPayload) : null,
          post: postPayload ? Object.assign({
            key: countryPayload.blogPostKey
          }, postPayload) : null,
          loading: false
        });
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
    if (window.confirm('Are you sure you want to remove the country?')) {
      const db = getDatabase();
      const countryKey = this.state.country.key;
      const countryRef = ref(db, 'country/' + countryKey);
      remove(countryRef);
      this.props.history.push('/countries');
    }
  }

  render = () => {
    if (this.state.loading) {
      return <Loader />
    }
    if (!this.state.country) {
      return <NoMatch />
    }
    const mdConverter = new Converter({
      noHeaderId: true,
      underline: true,
      openLinksInNewWindow: true
    });
    const storyHtml = mdConverter.makeHtml(this.state.country.story);
    const country = this.state.country;
    const hasPost = !!this.state.post;
    return (
      <div className='page country-detail'>
        <div className='country-hero'>
          <div className='photo' style={{backgroundImage: `url(${country.photoPath})`}}></div>
          <div className='shade'></div>
          <div className='hero-overlay'>
            <div>
              <div className='meta-row'>
                <p className='kicker'>Conquered · {convertTimestamp(country.date)}</p>
              </div>
              <h2>{country.name}</h2>
            </div>
            <div className='actions'>
              <div className='badges'>
                {country.magnet && <div className='badge'>★</div>}
                {hasPost && <div className='badge'>
                  <svg xmlns='http://www.w3.org/2000/svg' width='14px' height='14px' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' viewBox='0 0 16 16'>
                    <rect x='2.75' y='1.75' width='10.5' height='12.5' rx='1.5' />
                    <path d='M5.5 5.25h5M5.5 8h5M5.5 10.75h3' />
                  </svg>
                </div>}
              </div>
              {this.state.authed && <div className='controls'>
                <Link to={`/countries/${country.key}/edit`}><button><FontAwesomeIcon icon={faEdit} /></button></Link>
                <button onClick={this.onDelete}><FontAwesomeIcon icon={faTrash} /></button>
              </div>}
            </div>
          </div>
        </div>
        <div className='detail-grid'>
          <div className='side-stack'>
            {country.description && <div className='notes-card'>
              <p className='kicker'>Notes</p>
              <p>{country.description}</p>
            </div>}
            {hasPost && <PostPreview post={this.state.post} featured label='From the blog' hideCover />}
            {!hasPost && this.state.authed && <div className='nudge-card'>
              <div className='icon'>✎</div>
              <div>
                <div className='title'>No story yet</div>
                <div className='text'>This trip doesn't have a blog post. <Link to='/blog/add'>Write one →</Link></div>
              </div>
            </div>}
          </div>
          <Places authed={this.state.authed} country={country.key} />
        </div>
        {country.story && <div className='country-story' dangerouslySetInnerHTML={{__html: storyHtml}} />}
        <DiveLog authed={this.state.authed} country={country.key} countryName={country.name} />
      </div>
    )
  }
}

export default CountryDetail;
