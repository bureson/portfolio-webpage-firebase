import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';

import { convertTimestamp, sortBy } from '../lib/Shared';
import CountryDialog from '../components/CountryDialog';
import LazyPhoto from '../components/LazyPhoto';
import Loader from '../components/Loader';
import Search from '../components/Search';

class Countries extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      countryList: [],
      dialog: false,
      diveCounts: {},
      loading: true,
      search: '',
      sortBy: 'date',
      sortDirection: 'desc'
    }
  }

  componentDidMount = () => {
    document.title = 'Countries | Ondrej Bures';
    const db = getDatabase();
    const countryListRef = ref(db, 'country');
    this.unsubscribeCountries = onValue(countryListRef, snapshot => {
      const payload = snapshot.val() || {};
      const countryList = Object.keys(payload)
            .sort((a, b) => payload[b].date - payload[a].date)
            .map(key => Object.assign({key}, payload[key]));
      this.setState({
        countryList,
        loading: false
      });
    });
    const diveListRef = ref(db, 'dive-log');
    this.unsubscribeDives = onValue(diveListRef, snapshot => {
      const payload = snapshot.val() || {};
      const diveCounts = Object.keys(payload).reduce((counts, key) => {
        const country = payload[key].country;
        counts[country] = (counts[country] || 0) + 1;
        return counts;
      }, {});
      this.setState({
        diveCounts
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

  componentWillUnmount = () => {
    this.unsubscribeCountries && this.unsubscribeCountries();
    this.unsubscribeDives && this.unsubscribeDives();
  }

  selectSorter = ({ key, direction }) => {
    this.setState({
      sortBy: key,
      sortDirection: direction
    });
  }

  onSearchChange = (e) => {
    e.preventDefault();
    this.setState({
      search: e.target.value
    });
  }

  renderBlogRibbon = () => {
    return (
      <div className='ribbon blog'>
        <div className='content'>
          <svg xmlns='http://www.w3.org/2000/svg' width='24px' height='24px' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' viewBox='0 0 16 16'>
            <rect x='2.75' y='1.75' width='10.5' height='12.5' rx='1.5' />
            <path d='M5.5 5.25h5M5.5 8h5M5.5 10.75h3' />
          </svg>
        </div>
      </div>
    )
  }

  renderMagnetRibbon = () => {
    return (
      <div className='ribbon magnet'>
        <div className='content'>
          <svg width='24px' height='24px' aria-hidden='true' focusable='false' data-prefix='far' data-icon='star' className='svg-inline--fa fa-star fa-w-18' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'>
            <path fill='currentColor' d='M528.1 171.5L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4L288 385.4l-124.3 65.3 23.7-138.4-100.6-98 139-20.2 62.2-126 62.2 126 139 20.2-100.6 98z'></path>
          </svg>
        </div>
      </div>
    )
  }

  renderDiveRibbon = () => {
    return (
      <div className='ribbon dive'>
        <div className='content'>
          <svg xmlns='http://www.w3.org/2000/svg' width='24px' height='24px' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' viewBox='0 0 16 16'>
            <path d='M1.2 5.5q1.7-2.2 3.4 0t3.4 0t3.4 0t3.4 0' />
            <path d='M1.2 10.5q1.7-2.2 3.4 0t3.4 0t3.4 0t3.4 0' />
          </svg>
        </div>
      </div>
    )
  }

  renderCountries = () => {
    if (this.state.loading) return <Loader />;

    const search = this.state.search.toLowerCase();
    const sortedCountryList = this.state.countryList
          .filter(country => !search || country.name.toLowerCase().includes(search) || (country.iso || '').toLowerCase().includes(search))
          .sort(sortBy(this.state.sortBy, this.state.sortDirection));
    return (
      <div className='countries-list'>
        {sortedCountryList.map((country, index) => {
          return (
            <Link to={`/countries/${country.key}`} key={index}>
              <div className='country'>
                <div className='ribbons'>
                  {country.magnet && this.renderMagnetRibbon()}
                  {country.blogPostKey && this.renderBlogRibbon()}
                  {!!this.state.diveCounts[country.key] && this.renderDiveRibbon()}
                </div>
                <LazyPhoto className='photo' src={country.photoPath} />
                <div className='content'>
                  <div className='code'>{(country.iso || '').toUpperCase()}</div>
                  <div className='info'>
                    <h3>{country.name}</h3>
                    <small>{convertTimestamp(country.date)}</small>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  render = () => {
    const magnetCount = this.state.countryList.filter(country => country.magnet).length;
    return (
      <div className='page'>
        <div className='page-head'>
          <p className='kicker'>The tracker</p>
          <div className='title-row'>
            <h2>Countries log</h2>
            <div className='stats'>
              <div className='stat'>
                <div className='value'>{this.state.countryList.length}</div>
                <div className='label'>countries</div>
              </div>
              <div className='stat'>
                <div className='value'>7<span>/7</span> <span className='check'>✓</span></div>
                <div className='label'>continents</div>
              </div>
              <div className='stat'>
                <div className='value'>{magnetCount} <span className='check'>★</span></div>
                <div className='label'>fridge magnets</div>
              </div>
              <div className='stat'>
                <div className='value'>{Object.values(this.state.diveCounts).reduce((sum, count) => sum + count, 0)} <span className='check'>≋</span></div>
                <div className='label'>dives logged</div>
              </div>
            </div>
          </div>
          <div className='info'>
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
              &nbsp;cue for myself to remember whether I have a magnet or not. Currently you can find {magnetCount} magnets on my fridge!
            </p>
            <p>
              To improve the UX of this page, I have also connected the countries with corresponding blog post. The connected countries are highlighted with an article badge 📄.
            </p>
          </div>
        </div>
        <div className='filter-bar'>
          <div className='pills'>
            <button className={this.state.sortBy === 'date' ? 'active' : ''} onClick={() => this.selectSorter({ key: 'date', direction: 'desc' })}>Sorted by date</button>
            <button className={this.state.sortBy === 'name' ? 'active' : ''} onClick={() => this.selectSorter({ key: 'name', direction: 'asc' })}>A–Z</button>
          </div>
          <div className='pills'>
            <Search value={this.state.search} onChange={this.onSearchChange} />
            {this.state.authed && <button onClick={() => this.setState({dialog: true})}>+ Add new country</button>}
          </div>
        </div>
        {this.renderCountries()}
        {this.state.dialog && <CountryDialog onClose={() => this.setState({dialog: false})} />}
      </div>
    )
  }
}

export default Countries;
