import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

import FlightLegs from './FlightLegs';
import FlightMap from './FlightMap';
import { flightTotals, formatKm, formatCO2, routeKey } from '../lib/Flights';

class FlightDetail extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hover: null
    };
  }

  // the map refits whenever its flight list changes identity, so hand it
  // the same array for as long as the flight itself is the same
  mapFlights = () => {
    if (this.flight !== this.props.flight) {
      this.flight = this.props.flight;
      this.flights = [this.props.flight];
    }
    return this.flights;
  }

  renderCountries = () => {
    const countries = this.props.countries || {};
    const countryKeys = (this.props.flight.countries || []).filter(key => countries[key]);
    if (!countryKeys.length) {
      return null;
    }
    return (
      <div className='trip-to'>
        {countryKeys.map(key => (
          <Link className='country-chip' to={`/countries/${key}`} key={key}>
            <span className='code'>{(countries[key].iso || '').toUpperCase()}</span>
            {countries[key].name}
          </Link>
        ))}
      </div>
    )
  }

  render = () => {
    const legs = this.props.flight.legs || [];
    const totals = flightTotals(this.props.flight);
    return (
      <div className='flight-detail'>
        {/* mounted only while open, so the arcs draw on every expand */}
        <div className='map'>{this.props.open && <FlightMap flights={this.mapFlights()} focus highlight={this.state.hover} />}</div>
        <div className='side'>
          <div className='kicker'>Legs</div>
          <FlightLegs legs={legs} rows onHover={leg => this.setState({hover: leg ? routeKey(leg.from, leg.to) : null})} />
          {this.renderCountries()}
          <div className='foot'>
            {this.props.authed && <div className='actions'>
              <button title='Edit flight' onClick={this.props.onEdit}><FontAwesomeIcon icon={faEdit} /></button>
              <button title='Remove flight' onClick={this.props.onDelete}><FontAwesomeIcon icon={faTrash} /></button>
            </div>}
            <span className='totals'>
              {legs.length} {legs.length === 1 ? 'leg' : 'legs'} · → {formatKm(totals.km)} · <span className='co2'>☁ {formatCO2(totals.co2)}</span>
            </span>
          </div>
        </div>
      </div>
    )
  }

}

export default FlightDetail;
