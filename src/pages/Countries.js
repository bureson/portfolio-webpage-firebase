import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';
import { getDatabase, ref, onValue } from 'firebase/database';

import { convertTimestamp, sortBy } from '../lib/Shared';
import Dropdown from '../components/Dropdown';
import Loader from '../components/Loader';
import WorldMap from '../components/WorldMap';

class Countries extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      countryList: [],
      display: 'map',
      filterYear: null,
      loading: true,
      sortBy: 'date',
      sortDirection: 'desc'
    }
  }

  componentDidMount = () => {
    document.title = 'Countries | Ondrej Bures';
    const db = getDatabase();
    const countryListRef = ref(db, 'country');
    onValue(countryListRef, snapshot => {
      const payload = snapshot.val() || {};
      const countryList = Object.keys(payload)
            .sort((a, b) => payload[b].date - payload[a].date)
            .map(key => Object.assign({key}, payload[key]));
      const lastYear = new Date(countryList[0].date * 1000).getFullYear();
      const firstYear = new Date(countryList[countryList.length - 1].date * 1000).getFullYear();
      const data = [...Array(lastYear - firstYear + 1).keys()].map((_, key) => {
        const year = firstYear + key;
        const count = countryList.filter(c => new Date(c.date * 1000).getFullYear() === year).length;
        return { year, count };
      }).reduce((acc, val, key, array) => {
        const { count } = val;
        const holder = { year: '...', count: 0 };
        const isEmpty = count === 0;
        const prevIsHolder = isEmpty && acc[acc.length - 1].year === holder.year;
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

  componentDidUpdate = () => {
    if (this.state.authed !== this.props.authed) {
      this.setState({
        authed: this.props.authed
      });
    }
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

  selectDisplay = ({ key }) => {
    this.setState({
      display: key
    });
  }

  selectSorter = ({ key, direction }) => {
    this.setState({
      sortBy: key,
      sortDirection: direction
    });
  }

  renderChart () {
    const stroke = window.getComputedStyle(document.documentElement).getPropertyValue('--contrastColor').trim();
    return (
      <ResponsiveContainer height={200} className='recharts-container'>
        <LineChart data={this.state.data} margin={{top: 20, right: 20, left: 20, bottom: 20}} onClick={this.onDotClick}>
          <XAxis dataKey='year'/>
          <Tooltip/>
          <Line type='monotone' dataKey='count' stroke={stroke} activeDot={{r: 8}}/>
        </LineChart>
      </ResponsiveContainer>
    )
  }

  renderRibbon = () => {
    return (
      <div className='ribbon'>
        <div className='content'>
          <svg width='24px' height='24px' aria-hidden='true' focusable='false' data-prefix='far' data-icon='star' className='svg-inline--fa fa-star fa-w-18' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'>
            <path fill='currentColor' d='M528.1 171.5L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4L288 385.4l-124.3 65.3 23.7-138.4-100.6-98 139-20.2 62.2-126 62.2 126 139 20.2-100.6 98z'></path>
          </svg>
        </div>
      </div>
    )
  }

  renderCountries = () => {
    if (this.state.loading) return <Loader />;

    const filteredCountryList = this.state.filterYear
      ? this.state.countryList.filter(c => new Date(c.date * 1000).getFullYear() === this.state.filterYear)
      : this.state.countryList;
    const sortedCountryList = filteredCountryList.sort(sortBy(this.state.sortBy, this.state.sortDirection));
    return (
      <div className='countries-list'>
        {this.state.display === 'map' ? <WorldMap countryList={this.state.countryList} /> : this.renderChart()}
        {sortedCountryList.map((country, index) => {
          return (
            <Link to={`/countries/${country.key}`} key={index}>
              <div className='country'>
                {country.magnet && this.renderRibbon()}
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
          <p>
            I never saw myself as a big traveller, but it all started in summer of 2013 after my master's degree graduation. A friend of mine inspired me to try surfing in Indonesia.
            &nbsp;I got hooked up almost immediatelly and this new passion eventually led me to Morocco, Sri Lanka, Hawaii (USA) or Australia. In 2014 I visited a total of 7 countries
            &nbsp;and slowly started adopting a challenge to visit 30 countries before turning 30 years old. With a little time to spare I completed this challenge in January 2019 in
            &nbsp;Tanzania. Until this day I have visited {this.state.countryList.length} countries. You can see their overview in the grid below with the date of my visit and a little note
            &nbsp;that usually sums my impression of the country.
          </p>
          <p>
            On my travels I like to collect small fridge magnets for each country to remind me of places that I've been to when back home. Because I've visited some countries multiple times and
            &nbsp;it's easy to lose track of those that already have a place on my fridge, I came up with a star badge ⭐ so the next time I visit the country I have an easily accessible visual
            &nbsp;cue for myself to remember whether I have a magnet or not. Currently you can find {this.state.countryList.filter(country => country.magnet).length} magnets on my fridge!
          </p>
          <div className='page-info'></div>
          <div className='page-controls'>
            {this.state.filterYear && <button onClick={this.clearFilter}>Clear filter: {this.state.filterYear}</button>}
            <Dropdown selected={`Shown on ${this.state.display}`} optionList={[{ key: 'map' }, { key: 'chart' }]} select={this.selectDisplay} />
            <Dropdown selected={`Sorted by ${this.state.sortBy}`} optionList={[{ key: 'date', direction: 'desc' }, { key: 'name', dirrection: 'asc' }]} select={this.selectSorter} />
            {this.state.authed && <Link to={'/countries/add'}><button>Add new country</button></Link>}
          </div>
        </div>
        {this.renderCountries()}
      </div>
    )
  }
}

export default Countries;
