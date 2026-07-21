import React, { Component } from 'react';

import { formatCO2, formatCoords, formatKm, loadAirports } from '../lib/Flights';

class FlightLegs extends Component {

  constructor(props) {
    super(props);
    this.state = {
      airports: null
    }
  }

  componentDidMount = () => {
    this.mounted = true;
    loadAirports().then(airports => {
      this.mounted && this.setState({ airports });
    });
  }

  componentWillUnmount = () => {
    this.mounted = false;
  }

  // the code alone is cryptic, so hovering reveals the city and where it sits
  renderAirport = (code) => {
    const airport = (this.state.airports || {})[code];
    return (
      <div className='airport'>
        {code}
        {airport && <span className='airport-tip'>
          <span className='name'>{airport[2]}</span>
          <span className='coords'>{formatCoords(airport[0], airport[1])}</span>
        </span>}
      </div>
    )
  }

  // one leg per row, route on the left and its numbers on the right;
  // the chain layout below cannot breathe inside a narrow dialog
  renderRows = (legs) => {
    return (
      <div className='leg-rows'>
        {legs.map((leg, index) => (
          <div className='row' key={index}
               onMouseEnter={() => this.props.onHover && this.props.onHover(leg)}
               onMouseLeave={() => this.props.onHover && this.props.onHover(null)}>
            <div className='route'>
              {this.renderAirport(leg.from)}
              <span className='arrow'>➤</span>
              {this.renderAirport(leg.to)}
            </div>
            <span className='stats' title={leg.estimated ? 'CO₂ estimated from the distance' : undefined}>
              {formatKm(leg.km)} · {formatCO2(leg.co2)}{leg.estimated ? '*' : ''}
            </span>
          </div>
        ))}
      </div>
    )
  }

  render = () => {
    const legs = this.props.legs || [];
    if (this.props.rows) {
      return this.renderRows(legs);
    }
    return (
      <div className='legs'>
        {legs.map((leg, index) => {
          const next = legs[index + 1];
          // keep the chain unbroken only when the next leg continues
          // from this leg's destination (open-jaw trips get a gap)
          const chained = next && next.from === leg.to;
          return (
            <div className='leg' key={index}>
              {this.renderAirport(leg.from)}
              <div className='segment'>
                <div className='distance'>{formatKm(leg.km)}</div>
                <div className='dashes'><span>➤</span></div>
              </div>
              {!chained && this.renderAirport(leg.to)}
              {!chained && next && <div className='gap'></div>}
            </div>
          )
        })}
      </div>
    )
  }

}

export default FlightLegs;
