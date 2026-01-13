import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/fontawesome-free-solid';
import { Converter } from 'showdown';

import { convertTimestamp } from '../lib/Shared';
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
    return (
      <div className='page'>
        <h2>{this.state.country.name}</h2>
        <div className='page-header'>
          <div className='page-info'>
            <p><strong>Conquered in {convertTimestamp(this.state.country.date)}</strong></p>
            <p><em>{this.state.country.description}</em></p>
          </div>
          {this.state.authed && <div className='page-controls'>
            <Link to={`/countries/${this.state.country.key}/edit`}><button><FontAwesomeIcon icon={faEdit} /></button></Link>
            <button onClick={this.onDelete}><FontAwesomeIcon icon={faTrash} /></button>
          </div>}
        </div>
        {this.state.country.photoPath && <div className='country-cover' style={{backgroundImage: `url(${this.state.country.photoPath})`}} />}
        {this.state.post && <PostPreview post={this.state.post} />}
        <Places authed={this.state.authed} country={this.state.country.key} />
        <div dangerouslySetInnerHTML={{__html: storyHtml}} />
      </div>
    )
  }
}

export default CountryDetail;
