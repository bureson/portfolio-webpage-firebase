import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';
import firebase from 'firebase';

import { convertTimestamp, sortBy } from '../lib/Shared';
import Dropdown from '../components/Dropdown';
import Loader from '../components/Loader';

class Countries extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      countryList: [],
      filterYear: null,
      loading: true,
      sortBy: 'date',
      sortDirection: 'desc'
    }
  }

  componentDidMount = () => {
    document.title = 'Countries | Ondrej Bures';
    this.countryRef = firebase.database().ref('country');
    this.countryRef.on('value', snapshot => {
      const payload = snapshot.val() || {};
      const countryList = Object.keys(payload)
            .sort((a, b) => payload[b].date - payload[a].date)
            .map(key => Object.assign({key}, payload[key]));
      const lastYear = new Date(countryList[0].date * 1000).getFullYear();
      const firstYear = new Date(countryList[countryList.length - 1].date * 1000).getFullYear();
      const data = [...Array(lastYear - firstYear + 1).keys()].map((_, key) => {
        const year = firstYear + key;
        const count = countryList.filter(c => new Date(c.date * 1000).getFullYear() === year).length;
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
        countryList,
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

  onDelete = (e, key) => {
    e.preventDefault();
    firebase.database().ref('country').child(key).remove();
  }

  onDotClick = (e) => {
    const filterYear = e
      ? e.activeLabel === this.state.filterYear
        ? null
        : e.activeLabel 
      : null;
    this.setState({
      filterYear
    });
  }

  clearFilter = (e) => {
    this.setState({
      filterYear: null
    });
  }

  select = ({key, direction}) => {
    this.setState({
      sortBy: key,
      sortDirection: direction
    });
  }

  renderCountries = () => {
    if (this.state.loading) {
      return <Loader />
    }
    const filteredCountryList = this.state.filterYear
      ? this.state.countryList.filter(c => new Date(c.date * 1000).getFullYear() === this.state.filterYear)
      : this.state.countryList;
    const sortedCountryList = filteredCountryList.sort(sortBy(this.state.sortBy, this.state.sortDirection));
    return (
      <div className='countries-list'>
        <ResponsiveContainer height={200}>
          <LineChart data={this.state.data} margin={{top: 20, right: 20, left: 20, bottom: 20}} onClick={this.onDotClick}>
            <XAxis dataKey="year"/>
            <Tooltip/>
            <Line type="monotone" dataKey="count" stroke="#2c73b0" activeDot={{r: 8}}/>
          </LineChart>
        </ResponsiveContainer>
        {sortedCountryList.map((country, index) => {
          return (
            <Link to={`/countries/${country.key}`} key={index}>
              <div className='country'>
                <div className='photo' style={{backgroundImage: `url(${country.photoPath})`}}></div>
                <div className='content'>
                  <h3>{country.name}</h3>
                  <small>{convertTimestamp(country.date)}</small>
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
      <div className='page'>
        <h2>Countries log</h2>
        <div className='page-header'>
          <div className='page-info'>
            <p>{this.state.countryList.length} countries visited</p>
          </div>
          <div className='page-controls'>
            {this.state.filterYear && <button onClick={this.clearFilter}>Clear filter: {this.state.filterYear}</button>}
            <Dropdown selected={`Sorted by ${this.state.sortBy}`} optionList={[{ key: 'date', direction: 'desc' }, { key: 'name', dirrection: 'asc' }]} select={this.select} />
            {this.state.authed && <Link to={'/countries/add'}><button>Add new country</button></Link>}
          </div>
        </div>
        {this.renderCountries()}
      </div>
    )
  }
}

export default Countries;
