import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';
import firebase from 'firebase';

import Loader from '../components/Loader';

class Countries extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      country: [],
      filterYear: null,
      loading: true
    }
  }

  componentDidMount = () => {
    document.title = 'Countries | Ondrej Bures';
    this.countryRef = firebase.database().ref('country');
    this.countryRef.on('value', snapshot => {
      const payload = snapshot.val() || {};
      const country = Object.keys(payload)
            .sort((a, b) => payload[b].date - payload[a].date)
            .map(key => Object.assign({key}, payload[key]));
      const lastYear = new Date(country[0].date * 1000).getFullYear();
      const firstYear = new Date(country[country.length - 1].date * 1000).getFullYear();
      const data = [...Array(lastYear - firstYear + 1).keys()].map((_, key) => {
        const year = firstYear + key;
        const count = country.filter(c => new Date(c.date * 1000).getFullYear() === year).length;
        return {year, count};
      }).reduce((acc, val, key, array) => {
        const {count} = val;
        const holder = {year: '...', count: 0};
        const isEmpty = count === 0;
        const prevIsHolder = isEmpty && acc[acc.length - 1].year === '...';
        const nextIsEmpty = isEmpty && [1, 2].every(inc => array[key + inc] && array[key + inc].count === 0);
        return isEmpty
        ? prevIsHolder
          ? acc
          : nextIsEmpty
            ? acc.concat(holder)
            : acc.concat(val)
        : acc.concat(val);
      }, []);
      this.setState({
        country,
        data: data,
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
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.getMonth()] + ' ' + date.getFullYear();
  }

  onDelete = (e, key) => {
    e.preventDefault();
    firebase.database().ref('country').child(key).remove();
  }

  onDotClick = (e) => {
    this.setState({
      filterYear: e.activeLabel
    });
  }

  clearFilter = (e) => {
    this.setState({
      filterYear: null
    });
  }

  renderCountries = () => {
    if (this.state.loading) {
      return <Loader />
    }
    const countryList = this.state.filterYear
      ? this.state.country.filter(c => new Date(c.date * 1000).getFullYear() === this.state.filterYear)
      : this.state.country;
    return (
      <div className='countries-list'>
        <ResponsiveContainer height={200}>
          <LineChart data={this.state.data} margin={{top: 20, right: 20, left: 20, bottom: 20}} onClick={this.onDotClick}>
            <XAxis dataKey="year"/>
            <Tooltip/>
            <Line type="monotone" dataKey="count" stroke="#2c73b0" activeDot={{r: 8}}/>
          </LineChart>
        </ResponsiveContainer>
        {countryList.map((country, index) => {
          return (
            <Link to={`/countries/${country.key}`} key={index}>
              <div className='country'>
                <div className='photo' style={{backgroundImage: `url(${country.photoPath})`}}></div>
                <div className='content'>
                  <h3>{country.name}</h3>
                  <small>{this.convertTimestamp(country.date)}</small>
                  <p>{country.description}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  render = () => {
    return (
      <div className='countries'>
        <h2>Countries log</h2>
        <div className='countries-header'>
          <div className='countries-info'>
            <p>{this.state.country.length} countries visited</p>
          </div>
          <div className='countries-controls'>
            {this.state.filterYear && <button onClick={this.clearFilter}>Clear filter: {this.state.filterYear}</button>}
            {this.state.authed && <Link to={'/countries/add'}><button>Add new country</button></Link>}
          </div>
        </div>
        {this.renderCountries()}
      </div>
    )
  }
}

export default Countries;
