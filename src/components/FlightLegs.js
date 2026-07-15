import React, { Component } from 'react';

import { formatKm } from '../lib/Flights';

class FlightLegs extends Component {

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
              <div className='airport'>{leg.from}</div>
              <div className='segment'>
                <div className='distance'>{formatKm(leg.km)}</div>
                <div className='dashes'><span>➤</span></div>
              </div>
              {!chained && <div className='airport'>{leg.to}</div>}
              {!chained && next && <div className='gap'></div>}
            </div>
          )
        })}
      </div>
    )
  }

}

export default FlightLegs;
