import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';

import { continentOf, continentSize } from '../lib/Continents';
import { convertTimestamp, sortBy } from '../lib/Shared';
import Loader from '../components/Loader';

class Countries extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      countryList: [],
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
      this.setState({
        countryList,
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

  selectSorter = ({ key, direction }) => {
    this.setState({
      sortBy: key,
      sortDirection: direction
    });
  }

  renderBlogRibbon = () => {
    return (
      <div className='ribbon blog'>
        <div className='content'>
          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 16 16">
            <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
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

  renderCountries = () => {
    if (this.state.loading) return <Loader />;

    const sortedCountryList = this.state.countryList.sort(sortBy(this.state.sortBy, this.state.sortDirection));
    return (
      <div className='countries-list'>
        {sortedCountryList.map((country, index) => {
          return (
            <Link to={`/countries/${country.key}`} key={index}>
              <div className='country'>
                {country.magnet && this.renderMagnetRibbon()}
                {country.blogPostKey && this.renderBlogRibbon()}
                <div className='photo' style={{backgroundImage: `url(${country.photoPath})`}}></div>
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
    const continentCount = (continent) => this.state.countryList.filter(country => continentOf(country.iso) === continent).length;
    return (
      <div className='page'>
        <div className='countries-header'>
          <div className='info'>
            <p className='kicker'>The tracker</p>
            <h2>Countries log</h2>
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
              To improve the UX of this page, I have also connected the countries with corresponding blog post. The connected countries are highlighted with a pen badge 🖋️.
            </p>
          </div>
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
              <div className='value'>{continentCount('europe')}<span>/{continentSize('europe')}</span></div>
              <div className='label'>europe</div>
            </div>
            <div className='stat'>
              <div className='value'>{continentCount('asia')}<span>/{continentSize('asia')}</span></div>
              <div className='label'>asia</div>
            </div>
            <div className='stat'>
              <div className='value'>{continentCount('africa')}<span>/{continentSize('africa')}</span></div>
              <div className='label'>africa</div>
            </div>
            <div className='stat'>
              <div className='value'>{continentCount('americas')}<span>/{continentSize('americas')}</span></div>
              <div className='label'>americas</div>
            </div>
            <div className='stat'>
              <div className='value'>{magnetCount} <span className='check'>★</span></div>
              <div className='label'>fridge magnets</div>
            </div>
            <div className='stat'>
              <div className='value'>30<span>/30</span></div>
              <div className='label'>challenge · 2019</div>
            </div>
          </div>
        </div>
        <div className='filter-bar'>
          <div className='pills'>
            <button className={this.state.sortBy === 'date' ? 'active' : ''} onClick={() => this.selectSorter({ key: 'date', direction: 'desc' })}>Sorted by date</button>
            <button className={this.state.sortBy === 'name' ? 'active' : ''} onClick={() => this.selectSorter({ key: 'name', direction: 'asc' })}>A–Z</button>
          </div>
          <div className='pills'>
            {this.state.authed && <Link to={'/countries/add'}><button>+ Add new country</button></Link>}
          </div>
        </div>
        {this.renderCountries()}
      </div>
    )
  }
}

export default Countries;
