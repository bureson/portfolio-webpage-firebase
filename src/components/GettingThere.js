import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getDatabase, ref, onValue } from 'firebase/database';

import FlightLegs from './FlightLegs';
import { classNames, convertTimestamp } from '../lib/Shared';
import { flightTotals, formatKm, formatCO2, kmComparisons } from '../lib/Flights';

class GettingThere extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authed: props.authed,
      flights: [],
      expanded: null,
      loading: true
    }
  }

  componentDidMount = () => {
    const db = getDatabase();
    const flightListRef = ref(db, 'flight-log');
    onValue(flightListRef, snapshot => {
      const payload = snapshot.val() || {};
      const flights = Object.keys(payload)
            .filter(key => (payload[key].countries || []).includes(this.props.country))
            .sort((a, b) => payload[b].date - payload[a].date)
            .map(key => Object.assign({ key }, payload[key]));
      this.setState(state => ({
        flights,
        // the latest trip starts expanded
        expanded: state.expanded || (flights.length ? flights[0].key : null),
        loading: false
      }));
    }, { onlyOnce: true });
  }

  componentDidUpdate = () => {
    if (this.state.authed !== this.props.authed) {
      this.setState({
        authed: this.props.authed
      });
    }
  }

  onToggle = (key) => {
    this.setState(state => ({
      expanded: state.expanded === key ? null : key
    }));
  }

  summary = (totals, legCount) => {
    const flights = this.state.flights;
    const trips = `${flights.length} ${flights.length === 1 ? 'trip' : 'trips'} · ${legCount} ${legCount === 1 ? 'leg' : 'legs'}`;
    if (totals.km >= 40075) {
      return `${trips} · the way there is ${kmComparisons(totals.km)[0].value} around Earth`;
    }
    return `${trips} · ${formatKm(totals.km)} flown to get here`;
  }

  renderTrip = (flight) => {
    const multiple = this.state.flights.length > 1;
    const open = !multiple || this.state.expanded === flight.key;
    const totals = flightTotals(flight);
    const legs = flight.legs || [];
    return (
      <div className={classNames('trip', {open: open && multiple})} key={flight.key}>
        <div className={classNames('row', {clickable: multiple})} onClick={multiple ? () => this.onToggle(flight.key) : undefined}>
          <div className='ident'>
            <span className='title'>{flight.title}</span>
            <span className='date'>{convertTimestamp(flight.date)}</span>
            {!open && !!legs.length && <span className='route'>{legs[0].from} → {legs[legs.length - 1].to} · {legs.length} {legs.length === 1 ? 'leg' : 'legs'}</span>}
          </div>
          <div className='metrics'>
            <span>→ {formatKm(totals.km)}</span>
            <span className='co2'>☁ {formatCO2(totals.co2)}</span>
            {multiple && <span className='caret'>{open ? '▴' : '▾'}</span>}
          </div>
        </div>
        {open && <FlightLegs legs={legs} />}
      </div>
    )
  }

  render = () => {
    const flights = this.state.flights;
    if (this.state.loading || !flights.length) {
      return null;
    }
    const totals = flights.reduce((sums, flight) => {
      const { km, co2 } = flightTotals(flight);
      return { km: sums.km + km, co2: sums.co2 + co2 };
    }, { km: 0, co2: 0 });
    const legCount = flights.reduce((sum, flight) => sum + (flight.legs || []).length, 0);
    return (
      <div className='getting-there'>
        <div className='head'>
          <p className='kicker'>✈ Getting there{flights.length > 1 ? ` · ${flights.length} trips` : ''}</p>
          {flights.length > 1
            ? <div className='totals'>
                <span>→ {formatKm(totals.km)} total</span>
                <span className='co2'>☁ {formatCO2(totals.co2)} total</span>
              </div>
            : <Link className='more' to='/flights'>full flight log →</Link>}
        </div>
        {flights.map(this.renderTrip)}
        <div className='foot'>
          <div>{this.summary(totals, legCount)}</div>
          {flights.length > 1 && <Link to='/flights'>full flight log →</Link>}
        </div>
      </div>
    )
  }

}

export default GettingThere;
