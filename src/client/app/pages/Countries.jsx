import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import firebase from 'firebase';

import Loader from '../components/Loader';

class Countries extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      country: [],
      loading: true
    }
  }

  componentDidMount = () => {
    this.countryRef = firebase.database().ref("country");
    this.countryRef.on('value', snapshot => {
      const payload = snapshot.val() || {};
      const country = Object.keys(payload)
            .sort((a, b) => payload[b].date - payload[a].date)
            .map(key => Object.assign({key}, payload[key]));
      this.setState({
        country,
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
    firebase.database().ref("country").child(key).remove();
  }

  renderCountries = () => {
    if (this.state.loading) {
      return <Loader />
    }
    return (
      <div className='countries-list'>
        {this.state.country.map((country, index) => {
          return (
            <div key={index} className='country'>
              <div className='photo' style={{backgroundImage: `url(${country.photoPath})`}}></div>
              <div className='content'>
                <h3>{country.name}</h3>
                <small>{this.convertTimestamp(country.date)}</small>
                <p>{country.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  render = () => {
    return (
      <DocumentTitle title='Countries | Ondrej Bures'>
        <div className='countries'>
          <h2>Countries log</h2>
          <div className='countries-header'>
            <div className='countries-info'>
              <p>{this.state.country.length} countries visited</p>
            </div>
            <div className='countries-controls'>
              {this.state.authed && <Link to={'/add-country'}><button>Add new country</button></Link>}
            </div>
          </div>
          {this.renderCountries()}
        </div>
      </DocumentTitle>
    )
  }
}

export default Countries;
