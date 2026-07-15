import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

import FlightDialog from '../components/FlightDialog';
import FlightLegs from '../components/FlightLegs';
import FlightMap from '../components/FlightMap';
import FlightTimeline from '../components/FlightTimeline';
import Loader from '../components/Loader';
import { convertTimestamp } from '../lib/Shared';
import { flightTotals, flightYear, formatKm, formatCO2, kmComparisons } from '../lib/Flights';

class Flights extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      flights: [],
      countries: {},
      year: null,
      dialog: false,
      editing: null,
      loading: true
    }
  }

  componentDidMount = () => {
    document.title = 'Flights | Ondrej Bures';
    const db = getDatabase();
    const flightListRef = ref(db, 'flight-log');
    this.unsubscribe = onValue(flightListRef, snapshot => {
      const payload = snapshot.val() || {};
      const flights = Object.keys(payload)
            .sort((a, b) => payload[b].date - payload[a].date)
            .map(key => Object.assign({ key }, payload[key]));
      this.setState({
        flights,
        loading: false
      });
    });
    const countryListRef = ref(db, 'country');
    onValue(countryListRef, snapshot => {
      this.setState({
        countries: snapshot.val() || {}
      });
    }, { onlyOnce: true });
  }

  componentDidUpdate = () => {
    if (this.state.authed !== this.props.authed) {
      this.setState({
        authed: this.props.authed
      });
    }
  }

  componentWillUnmount = () => {
    this.unsubscribe && this.unsubscribe();
  }

  onDelete = (e, key) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to remove the flight?')) {
      const db = getDatabase();
      const flightRef = ref(db, `flight-log/${key}`);
      remove(flightRef);
    }
  }

  renderCountryChips = (flight) => {
    const countryKeys = (flight.countries || []).filter(key => this.state.countries[key]);
    if (!countryKeys.length) return null;
    return (
      <div className='trip-to'>
        <div className='label'>Trip to</div>
        {countryKeys.map(key => {
          const country = this.state.countries[key];
          return (
            <Link className='country-chip' to={`/countries/${key}`} key={key}>
              <span className='code'>{(country.iso || '').toUpperCase()}</span>
              {country.name}
            </Link>
          )
        })}
      </div>
    )
  }

  renderFlights = (flights) => {
    if (this.state.loading) return <Loader />;
    return (
      <div className='flight-list'>
        {flights.map(flight => {
          const totals = flightTotals(flight);
          const legCount = (flight.legs || []).length;
          return (
            <div className='flight-card' key={flight.key}>
              <div className='top'>
                <div className='ident'>
                  <span className='title'>{flight.title}</span>
                  <span className='date'>{convertTimestamp(flight.date)}</span>
                </div>
                <div className='metrics'>
                  <span>{legCount} {legCount === 1 ? 'leg' : 'legs'}</span>
                  <span>→ {formatKm(totals.km)}</span>
                  <span className='co2'>☁ {formatCO2(totals.co2)}</span>
                  {this.state.authed && <button onClick={() => this.setState({dialog: true, editing: flight})}><FontAwesomeIcon icon={faEdit} /></button>}
                  {this.state.authed && <button onClick={(e) => this.onDelete(e, flight.key)}><FontAwesomeIcon icon={faTrash} /></button>}
                </div>
              </div>
              <FlightLegs legs={flight.legs} />
              {this.renderCountryChips(flight)}
            </div>
          )
        })}
      </div>
    )
  }

  render = () => {
    const filtered = this.state.year
          ? this.state.flights.filter(flight => flightYear(flight) === this.state.year)
          : this.state.flights;
    const totals = filtered.reduce((sums, flight) => {
      const { km, co2 } = flightTotals(flight);
      return { km: sums.km + km, co2: sums.co2 + co2 };
    }, { km: 0, co2: 0 });
    return (
      <div className='page'>
        <div className='page-head'>
          <p className='kicker'>The tracker, airborne edition</p>
          <div className='title-row'>
            <h2>Flight map</h2>
            {!!this.state.flights.length && <div className='stats'>
              <div className='stat'>
                <div className='value'>{filtered.length}</div>
                <div className='label'>trips</div>
              </div>
              <div className='stat'>
                <div className='value'>{formatKm(totals.km)}</div>
                <div className='label'>flown</div>
              </div>
              {kmComparisons(totals.km).map(stat => (
                <div className='stat' key={stat.label}>
                  <div className='value'>{stat.value}</div>
                  <div className='label'>{stat.label}</div>
                </div>
              ))}
              <div className='stat'>
                <div className='value'>{formatCO2(totals.co2)}</div>
                <div className='label'>co2 footprint</div>
              </div>
            </div>}
          </div>
        </div>
        {!!this.state.flights.length && <FlightMap flights={filtered} baseFlights={this.state.flights} />}
        <FlightTimeline flights={this.state.flights} year={this.state.year} onYear={(year) => this.setState({year})} />
        {this.state.authed && <div className='flight-list-head'>
          <button onClick={() => this.setState({dialog: true})}>+ Log a flight</button>
        </div>}
        {this.renderFlights(filtered)}
        {this.state.dialog && <FlightDialog flight={this.state.editing} countries={this.state.countries} onClose={() => this.setState({dialog: false, editing: null})} />}
      </div>
    )
  }
}

export default Flights;
