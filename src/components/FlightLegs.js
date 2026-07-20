import React, { Component } from 'react';

import { formatCoords, formatKm, loadAirports } from '../lib/Flights';

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

  render = () => {
    const legs = this.props.legs || [];
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
