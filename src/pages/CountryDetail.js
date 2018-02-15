import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';

import Loader from '../components/Loader';
import NoMatch from '../components/NoMatch';

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

  convertTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + ' ' + date.getFullYear();
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
    return (
      <div className='countries'>
        <h2>{this.state.country.name}</h2>
        <div className='countries-header'>
          <div className='countries-info'>
            <p><strong>Conquered in {this.convertTimestamp(this.state.country.date)}</strong></p>
            <p><em>{this.state.country.description}</em></p>
          </div>
          {this.state.authed && <div className='countries-controls'>
            <Link to={`/countries/${this.state.country.key}/edit`}><button><i className="fas fa-edit"></i></button></Link>
            <button onClick={(e) => this.onDelete(e, this.state.country.key)}><i className={'fa fa-trash'}></i></button>
          </div>}
        </div>
        {this.state.country.photoPath && <div className='country-cover' style={{backgroundImage: `url(${this.state.country.photoPath})`}} />}
        <div>
          <p>{this.state.country.story}</p>
        </div>
      </div>
    )
  }
}

export default CountryDetail;
