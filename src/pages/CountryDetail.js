import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/fontawesome-free-solid';
import { Converter } from 'showdown';

import { convertTimestamp } from '../components/Library';
import Loader from '../components/Loader';
import NoMatch from '../components/NoMatch';
import Places from '../components/Places';

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
    this.countryRef = firebase.database().ref('country').child(countryKey);
    this.countryRef.on('value', snapshot => {
      const payload = snapshot.val();
      document.title = `${payload ? payload.name : 'Not found'} | Ondrej Bures`;
      this.setState({
        country: payload ? Object.assign({
          key: countryKey
        }, payload) : null,
        loading: false
      });
    });
  }

  componentWillUnmount = () => {
    this.countryRef.off();
  }

  componentWillReceiveProps = (props) => {
    this.setState({
      authed: props.authed
    });
  }

  onDelete = (e, key) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to remove the country?')) {
      firebase.database().ref('country').child(key).remove();
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
            <button onClick={(e) => this.onDelete(e, this.state.country.key)}><FontAwesomeIcon icon={faTrash} /></button>
          </div>}
        </div>
        {this.state.country.photoPath && <div className='country-cover' style={{backgroundImage: `url(${this.state.country.photoPath})`}} />}
        <Places authed={this.state.authed} country={this.state.country.key} />
        <div dangerouslySetInnerHTML={{__html: storyHtml}} />
      </div>
    )
  }
}

export default CountryDetail;
