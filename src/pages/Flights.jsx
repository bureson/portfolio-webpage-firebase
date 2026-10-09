import React, { Component, Fragment } from 'react';
import { getDatabase, ref, onValue, remove } from 'firebase/database';

import FlightDetail from '../components/FlightDetail';
import FlightDialog from '../components/FlightDialog';
import FlightMap from '../components/FlightMap';
import FlightTimeline from '../components/FlightTimeline';
import Loader from '../components/Loader';
import { classNames, convertTimestamp } from '../lib/Shared';
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
      open: null,
      loading: true
    }
  }

  componentDidMount = () => {
    document.title = 'Flights | Ondrej Bures';
    document.addEventListener('keydown', this.onKeyDown);
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
    document.removeEventListener('keydown', this.onKeyDown);
    this.unsubscribe && this.unsubscribe();
  }

  onKeyDown = (e) => {
    if (e.key === 'Escape' && this.state.open) {
      this.setState({ open: null });
    }
  }

  onDelete = (key) => {
    if (window.confirm('Are you sure you want to remove the flight?')) {
      const db = getDatabase();
      const flightRef = ref(db, `flight-log/${key}`);
      remove(flightRef);
      this.setState({ open: null });
    }
  }

  // flights arrive newest first, so consecutive runs are already the years
  yearGroups = (flights) => {
    return flights.reduce((groups, flight) => {
      const year = flightYear(flight);
      const group = groups[groups.length - 1];
      const { km, co2 } = flightTotals(flight);
      if (!group || group.year !== year) {
        groups.push({ year, flights: [flight], km, co2 });
      } else {
        group.flights.push(flight);
        group.km += km;
        group.co2 += co2;
      }
      return groups;
    }, []);
  }

  renderRow = (flight) => {
    const totals = flightTotals(flight);
    const legCount = (flight.legs || []).length;
    const open = this.state.open === flight.key;
    return (
      <div className={classNames('flight-row', {open})} key={flight.key}>
        <button className='row' onClick={() => this.setState({open: open ? null : flight.key})}>
          <span className='month'>{convertTimestamp(flight.date, 'mmm')}</span>
          <span className='name'>{flight.title}</span>
          <span className='count'>{legCount} {legCount === 1 ? 'leg' : 'legs'}</span>
          <span className='km'>→ {formatKm(totals.km)}</span>
          <span className='co2'>☁ {formatCO2(totals.co2)}</span>
          <span className='chev'>{open ? '▴' : '▾'}</span>
        </button>
        <div className='detail'>
          <div className='detail-inner'>
            <FlightDetail flight={flight} countries={this.state.countries} authed={this.state.authed} open={open}
                          onEdit={() => this.setState({dialog: true, editing: flight})}
                          onDelete={() => this.onDelete(flight.key)} />
          </div>
        </div>
      </div>
    )
  }

  renderFlights = (flights) => {
    if (this.state.loading) return <Loader />;
    return (
      <div className='flight-ledger'>
        {this.yearGroups(flights).map(group => (
          <Fragment key={group.year}>
            <div className='year-head'>
              <span className='year'>{group.year}</span>
              <span className='rule'></span>
              <span className='summary'>
                {group.flights.length} {group.flights.length === 1 ? 'trip' : 'trips'} · {formatKm(group.km)} · ☁ {formatCO2(group.co2)}
              </span>
            </div>
            {group.flights.map(this.renderRow)}
          </Fragment>
        ))}
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
